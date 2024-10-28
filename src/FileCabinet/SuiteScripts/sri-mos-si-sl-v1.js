/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
/*
Name         : Suitelet Demonstration
Author       : Mosses Ross
Description  : Compute Simple and Compound Interest
Release Date : 2023-06-15
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
            // var responseText = `<html><body><h1 style="color: blue; text-align: center;">` + retValue.message + '</h1></body></html>';
            // scriptContext.response.write(responseText);
        } else {
            retValue.message = retValue.message ? retValue.message : 'User Formatted errors';
            let responseText = "<html><body><h1>" + retValue.message + "</h1></body></html>";
            scriptContext.response.write(responseText);
        }
    } catch (e) {
        log.error({ title: 'Error - on request', details: e });
    }
}
function routeGet(scriptContext) {
    let myParams = { action: 'GET', data: {} }
    myParams.data = null;
    retValue = createUI(scriptContext, myParams);
    return retValue;
}

function createUI(scriptContext, myParams, type) {
    var retValue = { success: false, message: '', data: {} };
    try {
        var form = serverWidget.createForm({
            title: 'EasyCalc Finance'
        });
        let fldPrincipal = form.addField({ id: 'custpage_principle', type: serverWidget.FieldType.CURRENCY, label: 'Principal' });
        let fldRate = form.addField({ id: 'custpage_rate', type: serverWidget.FieldType.PERCENT, label: "Rate of Interest" });
        let fldTime = form.addField({ id: "custpage_time", type: serverWidget.FieldType.INTEGER, label: "Time in Years" });
        var fldSimpleInterest = null;
        if (type == 'SI') {
            fldSimpleInterest = form.addField({ id: "custpage_simple_interest", type: serverWidget.FieldType.CURRENCY, label: "Simple Interest" }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });

        } else if (type == 'CI') {
            fldSimpleInterest = form.addField({ id: "custpage_compound_interest", type: serverWidget.FieldType.CURRENCY, label: "Compound Interest" }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });
        }

        // let fldEMI = form.addField({ id: "custpage_emi_calculation", type: serverWidget.FieldType.CURRENCY, label: "Compound Interest" });
        // fldEMI.updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });
        let fldAction = form.addField({ id: 'custpage_action', type: serverWidget.FieldType.TEXT, label: 'Action' }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });;

        if (myParams.action == 'POST') {
            fldPrincipal.defaultValue = myParams.data.principal;
            fldRate.defaultValue = myParams.data.rata;
            fldTime.defaultValue = myParams.data.time;
            fldSimpleInterest.defaultValue = myParams.data.interest.toFixed(2);
            // fldEMI.defaultValue = myParams.data.emi;
        }

        form.addButton({
            id: 'custpage_calc_si',
            label: 'Calc Simple Interest',
            functionName: 'setAction("SI")'
        });

        form.addButton({
            id: 'custpage_calc_ci',
            label: 'Calc Compound Interest',
            functionName: 'setAction("CI")'
        });

        form.addButton({
            id: 'custpage_calc_emi',
            label: 'Calculate EMI',
            functionName: 'setAction("EMI")'
        });

        form.clientScriptModulePath = './cts-cad-finCalc-cs-v1.js'

        retValue.success = true;
        retValue.message = 'UI created successfully';
        retValue.data = { form: form };
    } catch (e) {
        log.error({ title: 'Error - Create UI', details: e });
        retValue.success = false;
        retValue.message = e;
    }
    return retValue;
}

function routePost(scriptContext) {
    let retValue = { success: false, message: "", data: {} }
    try {
        var userAction = scriptContext.request.parameters.custpage_action;

        if (userAction == 'SI') {
            retValue = processInterest(scriptContext, 'SI');
        } else if (userAction == 'CI') {
            retValue = processInterest(scriptContext, 'CI');
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

function processEMI(scriptContext) {
    var retValue = { success: false, message: '', data: {} };
    try {
        log.debug({ title: "scriptContext", details: scriptContext });
        userInput = scriptContext.request.parameters;

        let principal = parseFloat(userInput.custpage_principle ? userInput.custpage_principle : 0);
        let rate = parseFloat(userInput.custpage_rate ? userInput.custpage_rate : 0);
        let time = parseInt(userInput.custpage_time ? userInput.custpage_time : 0);
        let interest = ctsUtils.calculateSimpleInterest(principal, rate, time);
        let calcEMI = ctsUtils.calculateEMI(principal, rate, time);
        let EMI = calcEMI * 12;


        let myParams = { action: 'POST', data: {} }
        myParams.data = { principal: principal, rata: rate, time: time, interest: interest, emi: EMI }
        retValue = createUIForEMI(scriptContext, myParams);
    }
    catch (e) {
        log.error({ title: 'Error - compute Simple Interest', details: e });
        retValue.success = false;
        retValue.message = e;
    }
    return retValue
}

function createUIForEMI(scriptContext, myParams) {
    var retValue = { success: false, message: '', data: {} };
    try {
        var form = serverWidget.createForm({
            title: 'Creating a EMI Table'
        });
        var fieldgroup = form.addFieldGroup({
            id: "fieldgroup_fin_input_data",
            label: "User Input Value",
        });

        var fldPrincipal = form.addField({ id: 'custpage_principle', type: serverWidget.FieldType.CURRENCY, label: 'Principal',container:'fieldgroup_fin_input_data' });
        var fldRate = form.addField({ id: 'custpage_rate', type: serverWidget.FieldType.PERCENT, label: "Rate of Interest" ,container:'fieldgroup_fin_input_data'});
        var fldTime = form.addField({ id: "custpage_time", type: serverWidget.FieldType.INTEGER, label: "Time in Years" ,container:'fieldgroup_fin_input_data'});
        fldPrincipal.defaultValue = myParams.data.principal;
        fldRate.defaultValue = myParams.data.rata;
        fldTime.defaultValue = myParams.data.time;

        form.addSubtab({
            id: "subtab_table",
            label: "sublist Table",
        });

        var sublist = form.addSublist({
            id: 'custpage_table',
            type: serverWidget.SublistType.STATICLIST,
            label: 'EMI Calculator',
            tab:"subtab_table"
        });

        //Header
        sublist.addField({
            id: 'custpage_sn',
            type: serverWidget.FieldType.INTEGER,
            label: 'S.No'
        });

        sublist.addField({
            id: 'custpage_principal',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Principal'
        });

        sublist.addField({
            id: 'custpage_interest',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Interest'
        });

        sublist.addField({
            id: 'custpage_installment',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Installment'
        });

        sublist.addField({
            id: 'custpage_capital_repay',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Capital Repay'
        });
        sublist.addField({
            id: 'custpage_balance',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Balance'
        });

        // table values 
        let principal = myParams.data.principal;
        let rate = myParams.data.rata
        let time = myParams.data.time
        let interest = myParams.data.interest
        let Installment = myParams.data.emi
        var Balance = principal
        var curprincipal = principal;
        for (let i = 0; i < 10; i++) {
            curprincipal = i == 0 ? principal : Balance;
            let curinterest = ctsUtils.calculateSimpleInterest(curprincipal, rate, time);
            let repay = Installment - curinterest
            log.debug({ title: "balance", repay });
           
            Balance = curprincipal - repay
            


            // log.debug({ title: "curprincipal", Balance });

            sublist.setSublistValue({
                id: 'custpage_sn',
                line: i,
                value: i + 1
            });

            sublist.setSublistValue({
                id: 'custpage_principal',
                line: i,
                value: curprincipal.toFixed(2)
            });
            sublist.setSublistValue({
                id: 'custpage_interest',
                line: i,
                value: curinterest.toFixed(2)
            });
            sublist.setSublistValue({
                id: 'custpage_installment',
                line: i,
                value: Installment.toFixed(2)
            });
            sublist.setSublistValue({
                id: 'custpage_capital_repay',
                line: i,
                value: repay.toFixed(2)
            });
            sublist.setSublistValue({
                id: 'custpage_balance',
                line: i,
                value: Balance.toFixed(2)
            });

        }
        
        var fieldgroup = form.addFieldGroup({
            id: "fieldgroup_primary_details",
            label: "HTML Table",
        });
        
        let innerHTML=ctsUtils.GenerateHTML(scriptContext, myParams);
        form.addField({
            id: "custpage_html_table",
            type: serverWidget.FieldType.INLINEHTML,
            label: "HTML",
            container: "fieldgroup_primary_details"
          }).defaultValue = innerHTML.data;

        retValue.success = true;
        retValue.message = 'Table created successfully';
        log.debug({ title: "form", details: form });
        retValue.data = { form: form };
    }
    catch (e) {
        log.error({ title: 'Error - Table', details: e });
        retValue.success = false;
        retValue.message = e;
    }
    return retValue;
}



function processInterest(scriptContext, type) {
    var retValue = { success: false, message: '', data: {} };
    try {
        log.debug({ title: "scriptContext", details: scriptContext });
        userInput = scriptContext.request.parameters;

        let principal = parseFloat(userInput.custpage_principle ? userInput.custpage_principle : 0);
        let rate = parseFloat(userInput.custpage_rate ? userInput.custpage_rate : 0);
        let time = parseInt(userInput.custpage_time ? userInput.custpage_time : 0);
        var interest = null;
        if (type == 'SI') {
            interest = ctsUtils.calculateSimpleInterest(principal, rate, time);
        }
        else if ((type == 'CI')) {
            interest = ctsUtils.calculateCompoundInterest(principal, rate, time, 12);
        }

        let myParams = { action: 'POST', data: {} }
        myParams.data = { principal: principal, rata: rate, time: time, interest: interest }
        retValue = createUI(scriptContext, myParams, type);
    }
    catch (e) {
        log.error({ title: 'Error - compute Simple Interest', details: e });
        retValue.success = false;
        retValue.message = e;
    }
    return retValue
}