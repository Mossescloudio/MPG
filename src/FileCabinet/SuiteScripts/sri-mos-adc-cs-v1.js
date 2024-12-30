/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
 
/*
Name        : Client Script for Invoice Discount
Author      : Mosses Ross
Description : Calculates and applies discount% on line-level amounts and updates the total discounted amount in a transaction body field
Dependencies: None
Release Date: 2024-12-25
Version     : 1.4.0
*/
 
var record;
var log;
var isUpdatingLine = false;
var modules = ["N/currentRecord", "N/log"];
 
define(modules, main);
 
function main(recordModule, logModule) {
  record = recordModule;
  log = logModule;
 
  return {
    validateLine: validateLine,
    sublistChanged: sublistChanged,
  };
}
 
// Entry Point: validateLine
function validateLine(context) {
  try {
    var currentRecord = context.currentRecord;
    var sublistName = context.sublistId;
 
    if (sublistName == "item") {
      var amount = parseFloat(
          currentRecord.getCurrentSublistValue({
            sublistId: "item",
            fieldId: "amount",
          })
        ) || 0;
 
      var discountPercent = calculateDiscountPercent(amount);
      var discountedAmount = amount - (amount * discountPercent) / 100;
 
      // Set discount percent and discounted amount in the respective fields
      currentRecord.setCurrentSublistValue({
        sublistId: "item",
        fieldId: "custcol_sri_mos_discount_percentage", // Discount %
        value: discountPercent,
        ignoreFieldChange: true,
      });
 
      currentRecord.setCurrentSublistValue({
        sublistId: "item",
        fieldId: "custcol_sri_mos_auto_discounted", // Discounted Amount
        value: discountedAmount.toFixed(2),
        ignoreFieldChange: true,
      });
 
      log.debug({
        title: "Line Validation",
        details: `Amount: ${amount}, Discount%: ${discountPercent}, Discounted Amount: ${discountedAmount}`,
      });
    }
 
    return true; // Allow the line to be saved
  } catch (e) {
    log.error({
      title: "Error in validateLine",
      details: e.message,
    });
    return false; // Prevent the line from being saved in case of an error
  }
}
 
// Entry Point: sublistChanged
function sublistChanged(context) {
  if (isUpdatingLine) return;
 
  try {
    isUpdatingLine = true;
 
    var currentRecord = context.currentRecord;
    var sublistName = context.sublistId;
 
    if (sublistName == "item") {
      var lineCount = currentRecord.getLineCount({ sublistId: "item" });
      var totalDiscountedAmount = 0;
 
      // Loop through all lines to calculate the total discounted amount
      for (var i = 0; i < lineCount; i++) {
        var discountedAmount = parseFloat(
          currentRecord.getSublistValue({
            sublistId: "item",
            fieldId: "custcol_sri_mos_auto_discounted",
            line: i,
          })
        ) || 0;
 
        totalDiscountedAmount += discountedAmount;
      }
 
      // Update the total discounted amount in the transaction body field
      currentRecord.setValue({
        fieldId: "custbody_mos_sri_discounted_price",
        value: totalDiscountedAmount.toFixed(2),
        ignoreFieldChange: true,
      });
 
      log.debug({
        title: "Sublist Changed",
        details: `Total Discounted Amount Updated: ${totalDiscountedAmount}`,
      });
    }
  } catch (e) {
    log.error({
      title: "Error in sublistChanged",
      details: e.message,
    });
  } finally {
    isUpdatingLine = false;
  }
}
 
// Helper Function: Calculate Discount Percent
function calculateDiscountPercent(amount) {
  if (amount <= 1000) {
    return 1;
  } else if (amount > 1000 && amount <= 1500) {
    return 3;
  } else if (amount > 1500) {
    return 5;
  }
  return 0; // Default fallback
}