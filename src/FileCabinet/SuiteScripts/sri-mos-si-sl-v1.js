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
            retValue.message = retValue.message ? retValue.message : 'User Formatted errors';
            let responseText = "<html><body><h1>" + retValue.message + "</h1></body></html>";
            scriptContext.response.write(responseText);
        }
    } catch (e) {
        log.error({ title: 'Error: onRequest', details: e });
    }
}
function routeGet(scriptContext) {
    let myParams = { action: 'GET', data: {} }
    myParams.data = null;
    let retValue = createUI(scriptContext, myParams);
    return retValue;
}

function routePost(scriptContext) {
    let retValue = { success: false, message: "", data: {} }
    try {
        var userAction = scriptContext.request.parameters.custpage_action;

        if (userAction == 'SI') {
            retValue = processInterest(scriptContext);
        } else if (userAction == 'CI') {
            retValue = processInterest(scriptContext);
        } else if (userAction == "EMI") {
            retValue = processEMI(scriptContext);
        }
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
            title: userAction == 'EMI' ? 'EMI Calculator' : userAction == 'SI' ? "Simple Interest Calculator" : userAction == 'CI' ? " Compound Interest Calculator" : 'Finance Calculator'
        });
        var fieldgroup = form.addFieldGroup({
            id: "fieldgroup_calc_Input_data",
            label: userAction == 'SI' ? 'Simple Interest Fields' : userAction == 'CI' ? "Compound Interest Fields" : "Input Field",
        });
        let fldPrincipal = form.addField({
            id: 'custpage_principle', type: serverWidget.FieldType.CURRENCY, label: 'Principal', container: "fieldgroup_calc_Input_data"
        });
        let fldRate = form.addField({ id: 'custpage_rate', type: serverWidget.FieldType.PERCENT, label: "Rate of Interest", container: "fieldgroup_calc_Input_data" });
        let fldTime = form.addField({ id: "custpage_time", type: serverWidget.FieldType.INTEGER, label: "Time in Years", container: "fieldgroup_calc_Input_data" });
        var fldInterest = null;
        if (userAction == 'SI') {
            fldInterest = form.addField({ id: "custpage_simple_interest", type: serverWidget.FieldType.CURRENCY, label: "Simple Interest", container: "fieldgroup_calc_Input_data" }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });

        } else if (userAction == 'CI') {
            fldInterest = form.addField({ id: "custpage_compound_interest", type: serverWidget.FieldType.CURRENCY, label: "Compound Interest", container: "fieldgroup_calc_Input_data" }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });
        } else if (userAction == 'EMI') {
            // ctsUtils.GenerateSubtab(form, myParams);

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
        }

        let fldAction = form.addField({ id: 'custpage_action', type: serverWidget.FieldType.TEXT, label: 'Action' }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });;
        if (myParams.action == 'POST') {
            fldPrincipal.defaultValue = myParams.data.principal;
            fldRate.defaultValue = myParams.data.rate;
            fldTime.defaultValue = myParams.data.time;
            if (userAction == 'SI' || userAction == 'CI') {
                fldInterest.defaultValue = myParams.data.interest;
            }
        }

        form.addButton({
            id: 'custpage_si',
            label: 'Simple Interest',
            functionName: 'setAction("SI")'
        });

        form.addButton({
            id: 'custpage_ci',
            label: 'Compound Interest',
            functionName: 'setAction("CI")'
        });

        form.addButton({
            id: 'custpage_emi',
            label: 'EMI Table',
            functionName: 'setAction("EMI")'
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

function processInterest(scriptContext) {
    let retValue = { success: false, message: '', data: {} };
    try {
        const { principal, rate, time } = getUserInput(scriptContext);

        let interest = null;
        const userAction = scriptContext.request.parameters.custpage_action;

        if (userAction === 'SI') {
            interest = ctsUtils.calculateSimpleInterest(principal, rate, time).toFixed(2);
        } else if (userAction === 'CI') {
            interest = ctsUtils.calculateCompoundInterest(principal, rate, time, 12);
        }

        retValue = createUI(scriptContext, { action: 'POST', data: { principal, rate, time, interest } });
    } catch (e) {
        log.error({ title: 'Error: processInterest', details: e });
        retValue.success = false;
        retValue.message = e;
    }
    return retValue;
}

function processEMI(scriptContext) {
    let retValue = { success: false, message: '', data: {} };
    try {
        const { principal, rate, time } = getUserInput(scriptContext);

        const interest = ctsUtils.calculateSimpleInterest(principal, rate, time).toFixed(2);
        const emi = ctsUtils.calculateEMI(principal, rate, time);

        retValue = createUI(scriptContext, { action: 'POST', data: { principal, rate, time, interest, emi } });
    } catch (e) {
        log.error({ title: 'Error: processEMI', details: e });
        retValue.success = false;
        retValue.message = e;
    }
    return retValue;
}