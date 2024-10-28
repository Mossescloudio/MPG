var cts = {};

var query;
var modules = ['N/query'];
define(modules, main);

function main(queryModule) {
    query = queryModule;
    return cts;
}

cts.status = {
    PC_STATUS_PENDING_APPROVEL: 1,
    PC_STATUS_APPROVED: 2,
    PC_STATUS_REJECTD: 3,
    PC_STATUS_DRAFT: 4
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
        log.debug({ title: 'Work Experience | Rate| Default Margin', details: workExperience + ' | ' + ratePerHour + ' | ' + defaultMargin });

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
            log.error({ title: 'Error', details: result.message });
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
}

function computeCostAndMargin(workExperience, ratePerHour, defaultMargin) {
    var retValue = { success: false, message: '', data: {} };
    try {
        var marginPercentage = 0;
        if (workExperience >= 1 && workExperience <= 3) {
            marginPercentage = 10;
        } else if (workExperience > 3 && workExperience <= 5) {
            marginPercentage = 15;
        } else if (workExperience > 5 && workExperience <= 10) {
            marginPercentage = 20;
        } else {
            marginPercentage = defaultMargin;
        }

        log.debug({ title: 'Margin Percentage', details: marginPercentage });

        var costPerHour = ratePerHour / (1 + marginPercentage / 100);
        costPerHour = parseFloat(costPerHour);
        var marginAmount = ratePerHour - costPerHour;
        log.debug({ title: 'Rate|Cost|Margin', details: ratePerHour + '|' + costPerHour + '|' + marginAmount });
        retValue.success = true;
        retValue.message = 'Cost and Margin computed successfully';
        retValue.data = { costPerHour: costPerHour, marginPercentage: marginPercentage };
    } catch (e) {
        log.error({ title: 'Error', details: e });
        retValue.success = false;
        retValue.message = e.message;
        retValue.data = {};
    }
    return retValue;
}

// Creating a task 
cts.createTask = (curRecord) => {
    var retValue = { success: false, message: '', data: {} };
    try {
        var ConsultantFullName = curRecord.getValue('name');
        var task = record.create({ type: record.Type.TASK });
        log.debug({ title: "task json", details: task })
        var subject = 'Fellow up regarding onboarding to ' + ConsultantFullName;
        task.setValue({
            fieldId: 'title', value: subject
        });
        // 4376
        task.setValue({
            fieldId: 'assigned', value: 4376
        });
        task.setValue({
            fieldId: 'priority', value: "HIGH"
        });
        task.setValue({
            fieldId: 'status', value: "COMPLETE"
        });
        task.setValue({
            fieldId: 'message', value: "Please verify the consultant record and request for documents"
        });
        var taskId = task.save();
        log.debug({ title: "taskId", details: taskId })
        retValue.success = true;
        retValue.message = 'The Task is created Successfully';
    }
    catch (e) {
        log.error({ title: 'Error', details: e });
        retValue.success = false;
        retValue.message = e.message;
        retValue.data = {};
    }
    return retValue;
}

cts.calculateSimpleInterest = (principal, rate, time) => {
    rate = rate * 0.1;
    return (principal * rate * time) / 100;
}


cts.calculateCompoundInterest=(principal, rate, time, n)=>{
    rate = rate /100;
    let amount = principal * Math.pow((1 + rate / n), n * time);
    let Interest = amount - principal;
    return Interest.toFixed(2);
}

cts.calculateEMI=(P, annualInterestRate, loanTenureYears)=> {
    let monthlyInterestRate = (annualInterestRate / 100) / 12;
    let loanTenureMonths = loanTenureYears * 12;
    let EMI = (P * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanTenureMonths)) / (Math.pow(1 + monthlyInterestRate, loanTenureMonths) - 1);
    return EMI;
}


cts.GenerateHTML=(scriptContext, myParams)=>{
    var retValue = { success: false, message: '', data: {} };
    try {
        let principal = myParams.data.principal;
        let rate = myParams.data.rata
        let time = myParams.data.time
        let interest = myParams.data.interest
        let Installment = myParams.data.emi
        var Balance = principal
        var curprincipal = principal;
        var totalInterest=null;
        var totalInstallment=null;
        var innerHTML=""
        innerHTML = `<html>
    <body>
        <table style="width: 100%;border-collapse: collapse;margin-top:25px;position: relative;left: 50%">
            <thead style="background:#1c7e89">
                <tr style="color: white;">
                    <th style="border: 2px solid #111;padding: 11px;text-align: center;font-weight:900">S.No</th>
                    <th style="border: 2px solid #111;padding: 11px;text-align: center;font-weight:900">Principal</th>
                    <th style="border: 2px solid #111;padding: 11px;text-align: center;font-weight:900">Interest</th>
                    <th style="border: 2px solid #111;padding: 11px;text-align: center;font-weight:900">Installment</th>
                    <th style="border: 2px solid #111;padding: 11px;text-align: center;font-weight:900">Capital Repay</th>
                    <th style="border: 2px solid #111;padding: 11px;text-align: center;font-weight:900">Balance</th>
                </tr>
            </thead>
            <tbody>`;

for (let i = 0; i < 10; i++) {
    let curprincipal = i == 0 ? principal : Balance;
    let curinterest = ctsUtils.calculateSimpleInterest(curprincipal, rate, time);
    totalInterest +=curinterest;
    totalInstallment +=Installment;
    let repay = Installment - curinterest;
    log.debug({ title: "balance", repay });

    Balance = curprincipal - repay;

    innerHTML += `<tr>
        <td style="border: 2px solid #111;padding: 11px;text-align: center;font-weight:900">${i + 1}</td>
        <td style="border: 2px solid #111;padding: 11px;text-align: center;">${curprincipal.toFixed(2)}</td>
        <td style="border: 2px solid #111;padding: 11px;text-align: center;">${curinterest.toFixed(2)}</td>
        <td style="border: 2px solid #111;padding: 11px;text-align: center;">${Installment.toFixed(2)}</td>
        <td style="border: 2px solid #111;padding: 11px;text-align: center;">${repay.toFixed(2)}</td>
        <td style="border: 2px solid #111;padding: 11px;text-align: center;">${Balance.toFixed(2)}</td>
    </tr>`;
}

innerHTML += `
 <td ></td>
 <td ></td>
 <td style="border: 2px solid #111;padding: 11px;text-align: center;">${totalInterest.toFixed(2)}</td>
  <td style="border: 2px solid #111;padding: 11px;text-align: center;">${totalInstallment.toFixed(2)}</td>
   <td style="border: 2px solid #111;padding: 11px;text-align: center;">${principal.toFixed(2)}</td></tbody>
        </table>
    </body>
</html>`;

        retValue.success = true;
        retValue.data = innerHTML
    }
    catch (e) {
        log.error({ title: 'Error - compute Simple Interest', details: e });
        retValue.success = false;
        retValue.message = e;
    }
    return retValue
}