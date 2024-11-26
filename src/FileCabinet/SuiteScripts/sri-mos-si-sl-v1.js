/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
/*
Name        : Suitelet
Author      : Mosses
Description : Simple Interest, Compound Interest, and EMI
Dependencies: None
Release Date: 2024-10-01
version     : 1.0.0
Changelog   : 1.0.0 - Initial release
website     : www.cloudiotech.com
*/

var query, record, runtime, serverWidget, ctsUtils;
var modules = ['N/query', 'N/record', 'N/runtime', 'N/ui/serverWidget', './sri-mos-pc-mod-v1'];

define(modules, main);

function main(queryModule, recordModule, runtimeModule, serverWidgetModule, ctsModule) {
    query = queryModule;
    record = recordModule;
    runtime = runtimeModule;
    serverWidget = serverWidgetModule;
    ctsUtils = ctsModule;
    return {
        onRequest: onRequest
    }
}

// For future, error handling purposes
function handleError(error) { 
    log.error({
        title: "Error: " + error.name,
        details: error.message,
        stackTrace: error.stack
    });
    let errorMessage = "Error occurred. Please try again later.";
    if (error.name === "ValidationError") {
        errorMessage = "Invalid input. Please check the values you entered.";
    } else if (error.name === "DatabaseError") {
        errorMessage = "A database error occurred. Please contact support: Mosses@cloudiotech.com";
    }
    return errorMessage;
}

function onRequest(scriptContext) {
    var retValue = { success: false, message: '', data: {} };
    try {
        if (scriptContext.request.method == 'GET') {
            log.debug({ title: "scriptContext", details: scriptContext });
            retValue = routeGet(scriptContext);
        }
        if (scriptContext.request.method == 'POST') {
            retValue = routePost(scriptContext);
        }
        if (retValue.success) {
            log.debug({ title: 'On Success', details: retValue });
            scriptContext.response.writePage(retValue.data.form);
        } else {
            retValue.message = retValue.message || "Error occurred. Try again later.";
            let responseText = `<html>
            <body>
                <h1>Error</h1>
                <p>${retValue.message}</p>
                <p>Contact technical support at support@cloudiotech.com for assistance.</p>
                <p>Or contact developer at Mosses@cloudiotech.com</p>
            </body>
            </html>`;
            scriptContext.response.write(responseText);
        }
    } catch (e) {
        const errorMessage = handleError(e);
        scriptContext.response.write(`
            <html>
            <body>
                <h1>Error</h1>
                <p>${errorMessage}</p>
            </body>
            </html>
        `);
    }
}

function routeGet(scriptContext) {
    let myParams = { action: 'GET', data: {} }
    let retValue = createUI(scriptContext, myParams);
    return retValue;
}

function routePost(scriptContext) {
    let retValue = { success: false, message: "", data: {} }
    try {
        let myParams={action:'POST',data:{}}
            retValue = processEMI(scriptContext);
        return retValue;
    }
    catch (e) {
        log.error({ title: 'Error - Process Post', details: e });
        retValue.success = false;
        retValue.message = e;

    }
    return retValue;
}

function createUI(scriptContext, myParams) {
    var retValue = { success: false, message: '', data: {} };
    try {
        var userAction = scriptContext.request.parameters.custpage_action;
        var form = serverWidget.createForm({
            title: 'Finance Calculator'
        });
        var fieldgroup = form.addFieldGroup({
            id: "fieldgroup_calc_Input_data",
            label: "Input Field",
        });
        let fldPrincipal = form.addField({
            id: 'custpage_principle', type: serverWidget.FieldType.CURRENCY, label: 'Principal', container: "fieldgroup_calc_Input_data"
        });
        let fldRate = form.addField({ id: 'custpage_rate', type: serverWidget.FieldType.PERCENT, label: "Rate of Interest", container: "fieldgroup_calc_Input_data" });
        let fldTime = form.addField({ id: "custpage_time", type: serverWidget.FieldType.INTEGER, label: "Time in Years", container: "fieldgroup_calc_Input_data" });
        var fldSInterest = form.addField({ id: "custpage_simple_interest", type: serverWidget.FieldType.CURRENCY, label: "Simple Interest", container: "fieldgroup_calc_Input_data" }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });
        var fldCInterest = form.addField({ id: "custpage_compound_interest", type: serverWidget.FieldType.CURRENCY, label: "Compound Interest", container: "fieldgroup_calc_Input_data" }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });
        var fieldgroup = form.addFieldGroup({
            id: "fieldgroup_primary_details",
            label: "EMI Table",
        });
        let retHTML = ctsUtils.createHTML(scriptContext, myParams);
        let htmlfld = form.addField({
            id: "custpage_html_table",
            type: serverWidget.FieldType.INLINEHTML,
            label: "HTML",
            container: "fieldgroup_primary_details"
        }).defaultValue = retHTML;
        if (myParams.action == 'POST' && myParams.data) {
            fldPrincipal.defaultValue = myParams.data.principal || 0;
            fldRate.defaultValue = myParams.data.rate || 0;
            fldTime.defaultValue = myParams.data.time || 0;
            fldSInterest.defaultValue = myParams.data.simple_interest || 0;
            fldCInterest.defaultValue = myParams.data.compound_interest || 0;
        }
        form.addSubmitButton({
            label: "Calculate"
        });
        form.clientScriptModulePath = './sri-mos-pc-cs-v1.js'

        retValue.success = true;
        retValue.message = 'UI Created';
        retValue.data = { form: form };
    } catch (e) {
        log.error({ title: 'Error: CreateUI', details: e });
        retValue.success = false;
        retValue.message = e;
    }
    return retValue;
}

function getUserInput(scriptContext) {
    const params = scriptContext.request.parameters;
    return {
        principal: parseFloat(params.custpage_principle || 0),
        rate: parseFloat(params.custpage_rate || 0),
        time: parseInt(params.custpage_time || 0)
    };
}

function processEMI(scriptContext) {
    let retValue = { success: false, message: '', data: {} };
    try {
        const { principal, rate, time } = getUserInput(scriptContext);

        const SimpleInterest = ctsUtils.calculateSimpleInterest(principal, rate, time).toFixed(2);
        const CompoundInterest = ctsUtils.calculateCompoundInterest(principal, rate, time, 12);
        const emi = ctsUtils.calculateEMI(principal, rate, time);

        retValue = createUI(scriptContext, { action: 'POST', data: {
            principal, rate, time, simple_interest: SimpleInterest, compound_interest: CompoundInterest, emi } });
    } catch (e) {
        log.error({ title: 'Error: processEMI', details: e });
        retValue.success = false;
        retValue.message = e;
    }
    return retValue;
}