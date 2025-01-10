/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

/*
Name        : User Event on Project Consultant
Author      : Mosses
Description : Compute Cost based on Work Experience
Dependencies: None
Release Date: 2024-10-01
Version     : 1.0.0
Changelog   : 1.0.0 - Initial release
Website     : www.cloudiotech.com
*/

const DRAFT = 1;
const PC_STATUS_PENDING = 2;
const PC_STATUS_APPROVED = 3;
const PC_STATUS_REJECTED = 4;

var query, record, pcMod;

const modules = ['N/query', 'N/record', './sri-mos-pc-mod-v1'];

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

/**
 * Function to handle the beforeLoad event for Project Consultant records
 * @param {Object} scriptContext - The script context
 */
function myBeforeLoad(scriptContext) {
    try {
        var currentRecord = scriptContext.newRecord;
        var recordType = currentRecord.type;
        var recordId = currentRecord.id;
        var mode = scriptContext.type;
        
        log.debug({
            title: 'Before Load',
            details: `Processing before load for record type: ${recordType}, Record ID: ${recordId}`
        });

        // Add further logic as needed

    } catch (error) {
        log.error({ title: 'Error in Before Load', details: error });
    }
}

/**
 * Function to handle the beforeSubmit event for Project Consultant records
 * @param {Object} scriptContext - The script context
 */
function myBeforeSubmit(scriptContext) {
    try {
        var currentRecord = scriptContext.newRecord;
        var mode = scriptContext.type;

        // Only process on create or edit
        if (mode === 'create' || mode === 'edit') {
            var result = pcMod.updateCostAndMargin(currentRecord);
            if (!result.success) {
                throw new Error(result.message);
            }
        }
    } catch (error) {
        log.error({ title: 'Error in Before Submit', details: error.message });
    }
}

/**
 * Function to handle the afterSubmit event for Project Consultant records
 * @param {Object} scriptContext - The script context
 */
function myAfterSubmit(scriptContext) {
    try {
        var currentRecord = scriptContext.newRecord;
        var status = currentRecord.getValue('custrecord_mos_pc_status');
        
        log.debug({
            title: 'After Submit - Status Check',
            details: `Current status: ${status}`
        });

        // Trigger task creation if approved
        if (status === PC_STATUS_APPROVED) {
            pcMod.createTask(currentRecord);
        }

    } catch (error) {
        log.error({ title: 'Error in After Submit', details: error });
    }
}
