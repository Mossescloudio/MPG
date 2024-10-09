/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
/*
Name        : Client Script for Project Consultant Record
Author      : Mosses
Description : Compute Cost based on Work Experience
Dependencies: None
Release Date: 2024-10-01
version     : 1.0.0
Changelog   : 1.0.0 - Initial release
website     : www.cloudiotech.com
*/
var record,pcMod;
var modules = ['N/currentRecord','./sri-mos-pc-mod-v1'];
 
define(modules, main);
 
function main(recordModule,pcModule) {
    record = recordModule;
    pcMod = pcModule;
    return {
        // pageInit: pageInit,
        fieldChanged: myFieldChanged,
        // postSourcing: postSourcing,
        // sublistChanged: sublistChanged,
        // lineInit: lineInit,
        // validateField: validateField,
        // validateLine: validateLine,
        // validateInsert: validateInsert,
        // validateDelete: validateDelete,
        // saveRecord: saveRecord        
    }
}
function myFieldChanged(context) {
    var currentRecord = context.currentRecord;
    var fieldId = context.fieldId;
    if (fieldId == 'custrecord_mos_pc_experience') {
        var result = pcMod.updateCostAndMargin(currentRecord);
    }
    // if (fieldId == 'custrecord_cad_pc_cph') {
    //     var result = pcMod.updateCostAndMargin(currentRecord);
    // }
}