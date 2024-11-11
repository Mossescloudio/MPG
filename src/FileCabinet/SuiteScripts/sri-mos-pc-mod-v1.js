var cts = {};

var query;
var modules = ['N/query'];
define(modules, main);

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

cts.calculateSimpleInterest = (principal, rate, time) => {
    rate = rate * 0.1;
    return (principal * rate * time) / 100;
}

cts.calculateCompoundInterest = (principal, rate, time, n) => {
    rate = rate / 100;
    let amount = principal * Math.pow((1 + rate / n), n * time);
    let Interest = amount - principal;
    return Interest.toFixed(2);
}

cts.calculateEMI = (P, annualInterestRate, loanTenureYears) => {
    let monthlyInterestRate = (annualInterestRate / 100) / 12;
    let loanTenureMonths = loanTenureYears * 12;
    let EMI = (P * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanTenureMonths)) / (Math.pow(1 + monthlyInterestRate, loanTenureMonths) - 1);
    return EMI;
}

cts.createHTML = (scriptContext, myParams) => {
    var innerHTML = ""
    innerHTML = `<html>
    <body>
    <head>
        <style type="text/css">
            .table-header{
                border-width: 3px;
                border-style: solid;
                border-color: #111;
                padding: 10px;
                text-align:center;
                font-weight:900;
                font-size: 12px;
                text-transform: uppercase;
            }
            .table-values{
                border-width: 3px;
                border-style: solid;
                border-color: #111;
                padding: 10px;
                text-align: center;
                font-weight: 600;
                background: #e3f4fb;
            }
            .highlight{
                background: light-green;
                color: #111;
            }
        </style>
    </head>
    <table style="width: 100%;border-collapse: collapse;margin-top:25px;position: relative;left: 50%">
        <thead style="background:#1c7e89">
            <tr style="color: white;">
                <th class="table-header">No</th>
                <th class="table-header">Principal</th>
                <th class="table-header">Interest</th>
                <th class="table-header">Installment</th>
                <th class="table-header">Capital Repay</th>
                <th class="table-header">Balance</th>
            </tr>
        </thead>
        <tbody>`;

    let reEMIVal = generateEMITable(myParams.data.principal, myParams.data.rate, myParams.data.time, myParams.data.emi);
    let EMIValues = reEMIVal.data.table;
    var totalInterest = 0;
    var totalEMI = 0;
    var totalRepayed = 0;
    for (let val of EMIValues) {
        totalInterest += val.interest
        totalEMI += val.emi
        totalRepayed += val.capitalRepay
        innerHTML += `<tr>
            <td class="table-values">${val.no}</td>
            <td class="table-values">${val.principal.toFixed(2)}</td>
            <td class="table-values">${val.interest.toFixed(2)}</td>
            <td class="table-values">${val.emi.toFixed(2)}</td>
            <td class="table-values">${val.capitalRepay.toFixed(2)}</td>
            <td class="table-values">${val.balance}</td>
        </tr>`;
    }
    innerHTML += `
        <td class="table-values">Total</td>
        <td class="table-values">Nill</td>
        <td class="table-values highlight">${totalInterest.toFixed(2)}</td>
        <td class="table-values highlight">${totalEMI.toFixed(2)}</td>       
        <td class="table-values highlight">${totalRepayed.toFixed(2)}</td>  
        <td class="table-values">Nill</td>          
    </tbody>
        </table>
    </body>
    </html>`;

    return innerHTML;
}

function generateEMITable(principal, rate, period, emi) {
    var retValue = { success: false, message: '', data: {} };
    try {
        var balance = principal;
        var monthlyRate = rate / 12 / 100;
        var table = [];


        for (var year = 1; year <= period; year++) {
            var yearlyInterest = 0;
            var yearlyRepay = 0;

            for (var month = 1; month <= 12; month++) {
                if (balance <= 0) break;

                var interestPart = balance * monthlyRate;
                var capitalRepay = emi - interestPart;
                balance -= capitalRepay;

                yearlyInterest += interestPart;
                yearlyRepay += capitalRepay;
            }

            table.push({
                no: year,
                principal: balance + yearlyRepay,
                interest: yearlyInterest,
                emi: emi * 12,
                capitalRepay: yearlyRepay,
                balance: (balance < 0 ? 0 : balance).toFixed(2),
            });

            if (balance <= 0) break;
        }

        retValue.success = true;
        retValue.message = 'EMI Table Array created!';
        retValue.data = { table: table };
    }
    catch (e) {
        log.error({ title: 'Error: GenerateEMITable Array', details: e });
        retValue.success = false;
        retValue.message = e.message;
        retValue.data = {};
    }
    return retValue;
}