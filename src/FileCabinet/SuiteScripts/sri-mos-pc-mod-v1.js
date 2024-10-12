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
        log.debug({ title: 'Work Experience|Rate|Default Margin', details: workExperience + '|' + ratePerHour + '|' + defaultMargin });

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
        retValue.message = 'Cost and Margin updated successfully';
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
        var marginPercentage = 20;
        if (workExperience >= 1 && workExperience <= 3) {
            marginPercentage = 15;
        } else if (workExperience > 3 && workExperience <= 5) {
            marginPercentage = 10;
        } else if (workExperience > 5 && workExperience <= 10) {
            marginPercentage = 5;
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
    log.debug("Create task function")
    try {
        var ConsultantFullName = curRecord.getValue('name');
        var task = record.create({ type: record.Type.TASK });
        var subject = 'Follow up regarding onboarding of ' + ConsultantFullName;
        task.setValue({
            fieldId: 'title', value: subject
        });
        task.setValue({
            fieldId: 'assigned', value: 4345
        });
        task.setValue({
            fieldId: 'message', value: "Please verify!"
        });
        var taskId = task.save();

    }
    catch (e) {
        log.error({ title: 'Error', details: e });
    }
}