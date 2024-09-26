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
    details: scriptContext,
  });
}
 
function myBeforeSubmit(scriptContext) {
  log.debug({
    title: "myBeforeSubmit",
    details: scriptContext,
  });
}
 
function myAfterSubmit(scriptContext) {
  log.debug({
    title: "myAfterSubmit",
    details: scriptContext,
  });
}
 