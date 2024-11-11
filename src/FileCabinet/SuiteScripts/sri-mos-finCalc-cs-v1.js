/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
/*
Name        : Client Script for Project Consultant Record
Author      : Mosses Ross
Description : To calculate Simple, Compound Interest and EMI
Dependencies: None
Release Date: 2024-10-29
version     : 1.0.0
Changelog   : 1.0.0 - Initial release
website     : www.cloudiotech.com
*/
var curRecord, pcMod;
var modules = ['N/currentRecord', './sri-mos-pc-mod-v1'];

define(modules, main);

function main(recordModule, pcModule) {
    clientRecord = recordModule;
    pcMod = pcModule;
    return {
        // pageInit: pageInit,
        fieldChanged: myFieldChanged,
        setAction: setCommand,
        setView:setView
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

}
function setView(action){
    var curRecord = clientRecord.get();
    curRecord.setValue({
        fieldId: 'custpage_view', value: action
    });

    console.log(document)
    document.forms[0].submit();
}

function setCommand(action) {
    // document.getElementById('custpage_calc_si').addEventListener('click', function() {
    //     triggerCalculation('SI');
    // });
    var curRecord = clientRecord.get();
    curRecord.setValue({
        fieldId: 'custpage_action', value: action
    });



    console.log(document)
    document.forms[0].submit();
}