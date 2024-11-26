/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
/*
Name        : Financial Calculator Suitelet 2nd Attempt
Author      : Mosses Ross
Description : Compute Simple, Compound Interest, and EMI
Dependencies: None
Release Date: 2024-11-11
version     : 1.0.0
Changelog   : 1.0.0 - Initial release
website     : www.cloudiotech.com
*/

var query, record, runtime, serverWidget;
var modules = ['N/query', 'N/record', 'N/runtime', 'N/ui/serverWidget'];

define(modules, main);

function main(queryModule, recordModule, runtimeModule, serverWidgetModule) {
    query = queryModule;
    record = recordModule;
    runtime = runtimeModule;
    serverWidget = serverWidgetModule;
    return {
        onRequest: onRequest
    }
}

function onRequest(scriptContext) {
    var retValue = { success: false, message: '', data: {} };
    try{
        if (scriptContext.request.method == 'GET') {
        retValue = createUI(scriptContext);
        }

        //Block 2 : Post Operation
        if (scriptContext.request.method == 'POST') {
            retValue = processPost(scriptContext);
        }

        //Block 3 : Response/Rendering
        if (retValue.success) {
            log.debug({ title: 'On Success', details: retValue });
            scriptContext.response.writePage(retValue.data.form);
        } else {
            retValue.message = retValue.message ? retValue.message : 'User Formatted errors';
            var responseText = '<html><body><h1>' + retValue.message + '</h1></body></html>';
            scriptContext.response.write(responseText);
        }
    }
    catch (e) {
        log.error({ title: 'Error - on request', details: e });
    }
}

function processPost(scriptContext) {
    var retValue = { success: false, message: '', data: {} };
    try {
        // extract user Inputs
        var userInputs = scriptContext.request.parameters;

        var principal = userInputs.custpage_principal;
        var rate = userInputs.custpage_rate;
        var time = userInputs.custpage_time;

        // convert and format input values
        principal = principal ? principal : 0;
        rate = rate ? rate : 0;
        time = time ? time : 0;
        principal = parseFloat(principal);
        rate = parseFloat(rate);
        time = parseInt(time);
        log.debug({ title: 'User Inputs', details: principal + '|' + rate + '|' + time });

        var s_interest = computesInterest(principal, rate, time);
        var c_interest = computecInterest(principal, rate, time);
        log.debug({ title: 'Interest', details: s_interest });

        var form = serverWidget.createForm({
            title: 'Simple Interest Calculated Successfully'
        });
       var field_principal = form.addField({
            id: 'custpage_principal',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Principal'
        })
        field_principal.defaultValue = principal;

        form.addField({
            id: 'custpage_rate',
            type: serverWidget.FieldType.PERCENT,
            label: 'Rate of Interest'
        }).defaultValue = rate;

        form.addField({
            id: 'custpage_time',
            type: serverWidget.FieldType.INTEGER,
            label: 'Time in Years'
        }).defaultValue = time;
        
        var field_interest = form.addField({
            id: 'custpage_simple_interest',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Simple Interest',
        });
        field_interest.defaultValue = s_interest;
        field_interest.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
        var field_interest = form.addField({
            id: 'custpage_compound_interest',
            type: serverWidget.FieldType.CURRENCY,
            label: 'SCompound Interest',
        });
        field_interest.defaultValue = c_interest;
        field_interest.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
        form.addSubmitButton({
            label: 'Calculate'
        });
        retValue.success = true;
        retValue.message = 'Interest calculated successfully';
        retValue.data = { form: form };
    } catch (e) {
        log.error({ title: 'Error - computeSimpleInterest', details: e });
        retValue.success = false;
        retValue.message = e;
    }
    return retValue;
}

function computesInterest(principal, rate, time) {
    return (principal * rate * time) / 100;
}

function computecInterest(principal, rate, time) {
    return principal * ((1 + rate / 100) ^ (time)) - principal;
}

function createUI(scriptContext) {
    var retValue = { success: false, message: '', data: {} };
    try {
        var form = serverWidget.createForm({
            title: 'Simple Interest Calculation'
        });
        form.addField({
            id: 'custpage_rate',
            type: serverWidget.FieldType.PERCENT,
            label: 'Rate of Interest'
        });
        form.addField({
            id: 'custpage_time',
            type: serverWidget.FieldType.INTEGER,
            label: 'Time in Years'
        });
        form.addField({
            id: 'custpage_simple_interest',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Simple Interest'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });
        form.addField({
            id: 'custpage_compound_interest',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Compound Interest'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });
        form.addSubmitButton({
            label: 'Calculate'
        });
        retValue.success = true;
        retValue.message = 'UI created successfully';
        retValue.data = { form: form };
    } catch (e) {
        retValue.success = false;
        retValue.message = e;
    }
    return retValue;
}