/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
/*
Name        : User Event on Project Consultant
Author      : Mosses
Description : Compute Cost based on Work Experience
Dependencies: None
Release Date: 2024-10-01
version     : 1.0.0
Changelog   : 1.0.0 - Initial release
website     : www.cloudiotech.com
*/
var query, record, pcMod;
var modules = ['N/query', 'N/record', './sri-mos-pc-mod-v1'];
 
define(modules, main);
 
function main(queryModule, recordModule, pcModule) {
    query = queryModule;
    record = recordModule;
    pcMod = pcModule;
    return {
        beforeLoad: myBeforeLoad,
        beforeSubmit: myBeforeSubmit,
        afterSubmit: myAfterSubmit
    }
}

function myBeforeLoad(scriptContext) {
    log.debug({
        title: 'Before Load',
        details: 'This is my before load event'
    });
}

function myBeforeSubmit(scriptContext) {
    try {
        var curRecord = scriptContext.newRecord;
        var recType = curRecord.type;
        var recId = curRecord.id;
        var mode = scriptContext.type;
        if (mode == 'create' || mode == 'edit') {
            var result = pcMod.updateCostAndMargin(curRecord);
            if (!result.success) {
                throw result.message;
            }
        }
    } catch (e) {
        log.error({ title: 'Error', details: e });
    }
}

function myAfterSubmit(scriptContext) {
    try {
        var curRecord = scriptContext.newRecord;
        var status = curRecord.getValue('name');
        if (status == PC_STATUS_APPROVED){
            var ConsultantName = curRecord.getValue('name');
            var task = record.create({ type: record.type.TASK});
            var subject = 'followup regarding on boarding of ' + ConsultantName;

            task.setValue({fieldId: 'name', value: subject});
            task.setValue({fieldId: 'assigned', value: subject});
            task.setValue({fieldId: 'message', value: 'Please verify!'});

            var taskId = task.save();
        }
    } catch (e) {
        log.error({title: 'Error', details: e})
    }
}
 