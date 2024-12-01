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
const ErrorPage = (message) => `
    <html>
    <body>
        <h1>Error</h1>
        <p>${message}</p>
        <p>Contact technical support at support@cloudiotech.com for assistance.</p>
    </body>
    </html>`;
const DE = 'Unexpected Error Occured. Contact Support at support@cloudiotech.com'
var serverWidget, ctsUtils;

var modules = ['N/ui/serverWidget', './sri-mos-pc-mod-v1'];

define(modules, main);

function main(serverWidgetModule, ctsModule) {
    serverWidget = serverWidgetModule;
    ctsUtils = ctsModule;
    return { onRequest: onRequest }
}

function onRequest(scriptContext) {
    const { method } = scriptContext.request;
    
    var retValue = { success: false, message: '', data: {} };
    try {
        if (method == 'GET') { retValue = routeGet(scriptContext) }
        else if (method == 'POST') { retValue = routePost(scriptContext) }

        if (retValue.success) {
            log.debug({ title: 'On Success', details: retValue });
            scriptContext.response.writePage(retValue.data.form);
        } else {
            retValue.message = retValue.message || DE;
            scriptContext.response.write(ErrorPage(retValue.message || DE));
        }
    } catch (e) {
        scriptContext.response.write(ErrorPage(retValue.message || DE));
    }
}

function routeGet(scriptContext) {
    let myParams = { action: 'GET', data: {} }
    return createUI(scriptContext, myParams);
}

function routePost(scriptContext) {
    return processEMI(scriptContext);
}

function getUserInput(scriptContext) {
    const { custpage_principle, custpage_rate, custpage_time } = scriptContext.request.parameters;
    return {
        principle: parseFloat(custpage_principle || 0),
        rate: parseFloat(custpage_rate || 0),
        time: parseInt(custpage_time || 0)
    };
}

function processEMI(scriptContext) {
    let retValue = { success: false, message: '', data: {} };
    try {
        const { principle, rate, time } = getUserInput(scriptContext);
        const SimpleInterest = ctsUtils.calculateSimpleInterest(principle, rate, time).toFixed(2);
        const CompoundInterest = ctsUtils.calculateCompoundInterest(principle, rate, time, 12);
        const emi = ctsUtils.calculateEMI(principle, rate, time);
        retValue = createUI(scriptContext, { action: 'POST', data: { principle, rate, time, SimpleInterest, CompoundInterest, emi } });
    } catch (e) {
        log.error({ title: 'Error - processEMI', details: e });
        retValue = { success: false, message: e };
    }
    return retValue;
}

function createUI(scriptContext, myParams) {
    var retValue = { success: false, message: '', data: {} };
    try {
        var form = serverWidget.createForm({ title: 'Finance Calculator' });
        form.clientScriptModulePath = './sri-mos-pc-cs-v1.js';
        form.addSubmitButton({ label: "Calculate" });
        form.addFieldGroup({ id: "fieldgroup_Input_Data", label: "Input Fields" });
        form.addFieldGroup({ id: "fieldgroup_Output_Data", label: "Output Fields" });
        form.addFieldGroup({ id: "fieldgroup_emi_table", label: "EMI Table" });
        let customListField = form.addField({ id: 'custpage_custom_list', type: serverWidget.FieldType.SELECT, label: 'Select What to Calculate', container: "fieldgroup_Input_Data" });
        customListField.addSelectOption({ value: 1, text: 'Simple Interest' });
        customListField.addSelectOption({ value: 2, text: 'Compound Interest' });
        customListField.addSelectOption({ value: 3, text: 'EMI Table' });
        const selectedValue = scriptContext.request.parameters.custpage_custom_list;
        let fldprinciple = form.addField({ id: "custpage_principle", type: serverWidget.FieldType.CURRENCY, label: "Principle", container: "fieldgroup_Input_Data" });
        let fldRate = form.addField({ id: "custpage_rate", type: serverWidget.FieldType.PERCENT, label: "Rate of Interest", container: "fieldgroup_Input_Data" });
        let fldTime = form.addField({ id: "custpage_time", type: serverWidget.FieldType.INTEGER, label: "Time in Years", container: "fieldgroup_Input_Data" });
        if (selectedValue == 1) { var fldSInterest = form.addField({ id: "custpage_simple_interest", type: serverWidget.FieldType.CURRENCY, label: "Simple Interest", container: "fieldgroup_Output_Data" }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED }); }
        if (selectedValue == 2) { var fldCInterest = form.addField({ id: "custpage_compound_interest", type: serverWidget.FieldType.CURRENCY, label: "Compound Interest", container: "fieldgroup_Output_Data" }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED }); }
        if (selectedValue == 3) {
            form.addButton({
                id: 'custpage_download_pdf',
                label: 'Export - PDF',
                functionName: 'triggerPDF'
            });
            let retHTML = ctsUtils.createHTML(scriptContext, myParams);
            let htmlfld = form.addField({ id: "custpage_html_table", type: serverWidget.FieldType.INLINEHTML, label: "HTML", container: "fieldgroup_emi_table" }).defaultValue = retHTML;
        }
        if (myParams.action == 'POST' && myParams.data) {
            fldprinciple.defaultValue = myParams.data.principle || 0;
            fldRate.defaultValue = myParams.data.rate || 0;
            fldTime.defaultValue = myParams.data.time || 0;
            if (selectedValue == 1) { fldSInterest.defaultValue = myParams.data.SimpleInterest || 0; }
            if (selectedValue == 2) { fldCInterest.defaultValue = myParams.data.CompoundInterest || 0; }
        }
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