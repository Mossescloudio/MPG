var cts = {};
var query;
var module = ["N/query"];

define(module, main);

function main(queryModule) {
  query = queryModule;
  return cts;
}

cts.updateCostAndMargin = (curRecord) => {
  var retValue = { success: false, message: '', data: {} };
  try {
    var workExperience = curRecord.getValue('custrecord_mos_pc_experience');
    workExperience = workExperience ? workExperience : 0;
    workExperience = parseInt(workExperience);
    var ratePerHour = curRecord.getValue('custrecord_mos_pc_rate_per_hour');
    ratePerHour = ratePerHour ? ratePerHour : 0;
    ratePerHour = parseFloat(ratePerHour);
    var defaultMargin = curRecord.getValue('custrecord_mos_pc_defa_margin_pc');
    defaultMargin = defaultMargin ? defaultMargin : 0;
    defaultMargin = parseFloat(defaultMargin);
    log.debug({ title: 'Work Experience | Rate | Default Margin', details: workExperience + ' | ' + ratePerHour + ' | ' + defaultMargin });

    var result = computeCostAndMargin(workExperience, ratePerHour, defaultMargin);
    if (result.success) {
      curRecord.setValue({
        fieldId: 'custrecord_mos_pc_cost_per_hour',
        value: result.data.costPerHour
      });
      curRecord.setValue({
        fieldId: 'custrecord_mos_pc_actual_margin_pc',
        value: result.data.marginPercentage
      });
    } else {
      log.error({ title: 'Error: updateCostAndMargin', details: result.message });
      throw result.message;
    }
    retValue.success = true;
    retValue.message = 'Cost and Margin updated Successfully';
    retValue.data = { costPerHour: result.data.costPerHour, marginPercentage: result.data.marginPercentage };
  } catch (e) {
    log.error({ title: 'Error', details: e });
    retValue.success = false;
    retValue.message = e.message;
    retValue.data = {};
  }
  return retValue;
};

cts.createTask = (curRecord) => {
  var retValue = { success: false, message: '', data: {} };
  try {
    var ConsultantFullName = curRecord.getValue('name');
    var task = record.create({ type: record.Type.TASK });
    log.debug({ title: "task json", details: task })
    var subject = 'Follow up of onboarding ' + ConsultantFullName;
    task.setValue({
      fieldId: 'title', value: subject
    });
    // 4376 
    task.setValue({
      fieldId: 'assigned', value: 4376
    });
    task.setValue({
      fieldId: 'status', value: "COMPLETE"
    });
    task.setValue({
      fieldId: 'message', value: "Please verify!"
    });
    var taskId = task.save();
    log.debug({ title: "taskId", details: taskId })
    retValue.success = true;
    retValue.message = 'Task created Successfully';
  }
  catch (e) {
    log.error({ title: 'Error', details: e });
    retValue.success = false;
    retValue.message = e.message;
    retValue.data = {};
  }
  return retValue;
}

cts.computeSimpleInterest = (Principal, Rate, Time) => {
  return (Principal * Rate * Time) / 100;
}

cts.calculateEMI = (Principal, Rate, Time) => {
  var annualRate = Rate / 100;
  var emi = (Principal * annualRate * Math.pow(1 + annualRate, Time)) /
    (Math.pow(1 + annualRate, Time) - 1);
  return emi;
}

cts.calculateCompoundInterest = (Principal, Rate, Time) => {
  return Principal * Math.pow((1 + Rate / 100), Time) - Principal;
};

const styles = {
  table: 'width: 100%; border-collapse: collapse; text-align: center;margin: 0 auto; color: black; background: #F8F8F8; font-size: 15px;',
  headerRow: 'background-color: rgb(0, 70, 108); color: white;',
  headerCell: 'padding: 12px;',
  dataRow: 'background-color: rgb(190, 243, 255); color: black;',
  dataCell: 'padding: 12px;'
};

function GenerateCITableHtml(Principal, Rate, Time) {
  var table = `
    <div style="display: flex; justify-content: center; margin: 60px auto 50px;">
      <table border="1" style="${styles.table}">
        <thead>
          <tr style="${styles.headerRow}">
            <th style="${styles.headerCell}">Period</th>
            <th style="${styles.headerCell}">Opening Balance</th>
            <th style="${styles.headerCell}">Interest</th>
            <th style="${styles.headerCell}">Closing Balance</th>
          </tr>
        </thead>
        <tbody>`;

  var openingBalance = Principal;
  var annualRate = Rate / 100;

  for (var i = 1; i <= Time; i++) {
    var interest = openingBalance * annualRate;
    var closingBalance = openingBalance + interest;

    table += `
    <tr style="${styles.dataRow}">
    <td style="${styles.dataCell}">${i}</td>
    <td style="${styles.dataCell}">${openingBalance.toFixed(2)}</td>
    <td style="${styles.dataCell}">${interest.toFixed(2)}</td>
    <td style="${styles.dataCell}">${closingBalance.toFixed(2)}</td>
    </tr>`;
    openingBalance = closingBalance;
  }

  table += `
          </tbody>
        </table>
      </div>`;
  return table;
}

function GenerateEmiTableHtml(Principal, Rate, Time, emi) {
  var table = `
    <div style="text-align: center; margin: 60px auto 50px;">
    <table border="1" style="${styles.table}">
        <thead>
            <tr style="${styles.headerRow}">
                <th style="${styles.headerCell}">Period</th>
                <th style="${styles.headerCell}">Principal</th>
                <th style="${styles.headerCell}">Interest</th>
                <th style="${styles.headerCell}">EMI</th>
                <th style="${styles.headerCell}">Capital Repayment</th>
                <th style="${styles.headerCell}">Balance</th>
            </tr>
        </thead>
        <tbody>`
  var balance = Principal;
  var monthlyRate = Rate / 100;
  var periods = Time;

  for (var i = 1; i <= periods; i++) {
    var interest = balance * monthlyRate;
    var capitalRepayment = emi - interest;
    balance -= capitalRepayment;
    if (balance < 0) {
      capitalRepayment += balance;
      balance = 0;
    }
    
    table += `
    <tr style="${styles.dataRow}">
        <td style="${styles.dataCell}">${i}</td>
        <td style="${styles.dataCell}">${Principal.toFixed(2)}</td>
        <td style="${styles.dataCell}">${interest.toFixed(2)}</td>
        <td style="${styles.dataCell}">${emi.toFixed(2)}</td>
        <td style="${styles.dataCell}">${capitalRepayment.toFixed(2)}</td>
        <td style="${styles.dataCell}">${balance.toFixed(2)}</td>
    </tr>`;

    if (balance <= 0) break;
    Principal = balance;
  }

  table += `
        </tbody>
      </table>
    </div>`;

  return table;
}