/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

/*
Name          : Client Script
Author        : Mosses
Description   : Manage client
Dependencies  : None
Release Date  : 2024-11-20
Version       : 1.0.0
Changing      : 1.0.0 - Initial release
Website       : www.cloudio.com
*/
var clientRecord;
var module = ["N/currentRecord"];

define(module, main);

function main(recordModule) {
  clientRecord = recordModule;
  return { setAction: setAction };
}

function setAction(action) {
  var curRecord = clientRecord.get();
  curRecord.setValue({ fieldId: 'custpage_action', value: action });
  document.forms[0].submit();
}


