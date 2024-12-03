/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
/*
Name        : Client Script for Project Consultant Record
Author      : Mosses Ross
Description : Computes cost based on work experience and handles form actions
Dependencies: None
Release Date: 2024-10-29
version     : 1.0.1
Changelog   : 1.0.0 - Initial release
              1.0.1 - Merged cost calculation and action functions
website     : www.cloudiotech.com
*/

var record, pcMod;
var modules = ['N/currentRecord', './sri-mos-pc-mod-v1'];

define(modules, main);

function main(recordModule, pcModule) {
    record = recordModule;
    pcMod = pcModule;
    return {
        fieldChanged: myFieldChanged,
        triggerPDF: triggerPDF
    };
}

function myFieldChanged(context) {
    var currentRecord = context.currentRecord;
    var fieldId = context.fieldId;
    var principle = currentRecord.getValue('custpage_principle');
    if (isNaN(principle) || principle === 0) {
        alert("Principle cannot be zero or a non-numeric value. Please enter a valid number.");
        return false;
    }
    if (fieldId == 'custrecord_mos_pc_experience') {
        var result = pcMod.updateCostAndMargin(currentRecord);
        if (!result.success) {
            console.error("Error updating cost and margin:", result.message);
        }
    }
}

function triggerPDF() {
    log.debug({title: 'triggerPDF', details: 'trigger pdf is triggered'});
    var suiteletUrl = '/app/site/hosting/scriptlet.nl?script=2067&deploy=1&customText=TriggeredPDFMosses';                
    window.location.href = suiteletUrl;
}