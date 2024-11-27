/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
/*
Name        : Finance Calculator Suitelet
Author      : Mosses
Description : Calculate Simple Interest, Compound Interest, and EMI
Version     : 1.0.0
*/
const DE = 'Unexpected Error Occured. Contact Support at support@cloudiotech.com' //Default Error Message
var serverWidget, ctsUtils;
var modules = ['N/ui/serverWidget', './sri-mos-pc-mod-v1'];

define(modules, main);

function main(serverWidgetModule, ctsModule) {
    serverWidget = serverWidgetModule;
    ctsUtils = ctsModule;
    return { onRequest: onRequest }
}

const ErrorPage = (message) => `
    <html>
    <body>
        <h1>Error</h1>
        <p>${message}</p>
        <p>Contact technical support at support@cloudiotech.com for assistance.</p>
    </body>
    </html>`;

function onRequest(scriptContext) {
    var retValue = { success: false, message: '', data: {} };
    try {
        const { method } = scriptContext.request;
        retValue = method === 'GET' ? routeGet(scriptContext) : routePost(scriptContext);
        if (retValue.success) {
            log.debug({ title: 'On Success', details: retValue });
            scriptContext.response.writePage(retValue.data.form);
        } else {
            retValue.message = retValue.message || DE;
            scriptContext.response.write(ErrorPage(e.message || DE));
        }
    } catch (e) {
        scriptContext.response.write(ErrorPage(e.message || DE));
    }
}

function routeGet(scriptContext) {
    let myParams = { action: 'GET', data: {} }
    return createUI(scriptContext, myParams);
}

function routePost(scriptContext) {
    return processEMI(scriptContext);
}

function processEMI(scriptContext) {
    let retValue = { success: false, message: '', data: {} };
    try {
        const { principal, rate, time } = getUserInput(scriptContext);
        const SimpleInterest = ctsUtils.calculateSimpleInterest(principal, rate, time).toFixed(2);
        const CompoundInterest = ctsUtils.calculateCompoundInterest(principal, rate, time, 12);
        const emi = ctsUtils.calculateEMI(principal, rate, time);
        retValue = createUI(scriptContext, { action: 'POST', data: { principal, rate, time, SimpleInterest, CompoundInterest, emi } });
    } catch (e) {
        log.error({ title: 'Error - processEMI', details: e });
        retValue.success = false;
        retValue.message = e;
    }
    return retValue;
}

function createUI(scriptContext, myParams) {
    var retValue = { success: false, message: '', data: {} };
    try {
        var form = serverWidget.createForm({ title: 'Finance Calculator' });
        var fieldgroup = form.addFieldGroup({ id: "fieldgroup_Input_Data", label: "Input Fields" });
        var fieldgroup = form.addFieldGroup({ id: "fieldgroup_Output_Data", label: "Output Fields" });
        let fldPrincipal = form.addField({
            id: 'custpage_principle', type: serverWidget.FieldType.CURRENCY, label: 'Principal', container: "fieldgroup_Input_Data"
        });
        let fldRate = form.addField({ id: 'custpage_rate', type: serverWidget.FieldType.PERCENT, label: "Rate of Interest", container: "fieldgroup_Input_Data" });
        let fldTime = form.addField({ id: "custpage_time", type: serverWidget.FieldType.INTEGER, label: "Time in Years", container: "fieldgroup_Input_Data" });
        let fldSInterest = form.addField({ id: "custpage_simple_interest", type: serverWidget.FieldType.CURRENCY, label: "Simple Interest", container: "fieldgroup_Output_Data" }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });
        let fldCInterest = form.addField({ id: "custpage_compound_interest", type: serverWidget.FieldType.CURRENCY, label: "Compound Interest", container: "fieldgroup_Output_Data" }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });
        let fieldgroupEMI = form.addFieldGroup({ id: "fieldgroup_emi_table", label: "EMI Table" });
        let retHTML = ctsUtils.createHTML(scriptContext, myParams);
        let htmlfld = form.addField({ id: "custpage_html_table", type: serverWidget.FieldType.INLINEHTML, label: "HTML", container: "fieldgroup_emi_table" }).defaultValue = retHTML;
        if (myParams.action == 'POST' && myParams.data) {
            fldPrincipal.defaultValue = myParams.data.principal || 0;
            fldRate.defaultValue = myParams.data.rate || 0;
            fldTime.defaultValue = myParams.data.time || 0;
            fldSInterest.defaultValue = myParams.data.SimpleInterest || 0;
            fldCInterest.defaultValue = myParams.data.CompoundInterest || 0;
        }
        form.addSubmitButton({
            label: "Calculate"
        });
        form.clientScriptModulePath = './sri-mos-pc-cs-v1.js'

        retValue = {
            success: true,
            message: 'UI Created',
            data: { form: form }
        };
    } catch (e) {
        log.error({ title: 'Error - CreateUI', details: e });
        retValue.success = false;
        retValue.message = e;
    }
    return retValue;
}

function getUserInput(scriptContext) {
    const { custpage_principle, custpage_rate, custpage_time } = scriptContext.request.parameters;
    return {
        principal: parseFloat(custpage_principle || 0),
        rate: parseFloat(custpage_rate || 0),
        time: parseInt(custpage_time || 0)
    };
}