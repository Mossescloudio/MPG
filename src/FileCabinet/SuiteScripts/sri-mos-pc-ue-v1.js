/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
/*
Name          : User Event on Project Consultant
Author        : Mosses
Description   : Compute cost based on experience
Dependencies  : None
Release Date  : 2024-09-23
Version       : 2.0.0
Changing      : 2.0.0 - 2nd Updated Version
Website       : www.cloudio.com
*/

var query, record;
var modules = ["N/query", "N/record"];
 
define(modules, main);
 
function main(queryModule, recordModule) {
  query = queryModule;
  record = recordModule;
  return {
    beforeLoad: myBeforeLoad,
    beforeSubmit: myBeforeSubmit,
    afterSubmit: myAfterSubmit,
  };
}
 
function myBeforeLoad(scriptContext) {
  log.debug({
    title: "myBeforeLoad",
    details: 'This is just my before load',
  });
}
 
function myBeforeSubmit(scriptContext) {
  var curRecord = scriptContext.newRecord;
  var recType = curRecord.type;
  var recId = curRecord.id;
  curRecord.setValue({
    fieldId: 'custrecord_mos_pc_cost_per_hour',
    value: 25
  });
}
 
function myAfterSubmit(scriptContext) {
  log.debug({
    title: "myAfterSubmit",
    details: 'This is just my after submit',
  });
}
 