/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

/*
Name          : Financial Calculation Suitlet
Author        : Mosses Ross
Description   : This suitlet is used to calculate Simple interest, compound interest and EMI Tables.
Dependencies  : None
Release Date  : 2025-01-01
Version       : 2.0.2
Changing      : 1.0.0 - Initial release
                2.0 - With Emi Table Feature 2.0.2 - WIth Download PDF Function 
Website       : www.cloudio.com
*/

var query, record, runtime, serverWidget, ctsUtils, render;
var modules = ["N/query", "N/record", "N/runtime", "N/ui/serverWidget", "./sri-mos-pc-mod-v1.js", "N/render"];

define(modules, main);

function main(queryModule, recordModule, runtimeModule, serverWidgetModule, ctsUtilsModule, renderModule) {
    query = queryModule;
    record = recordModule;
    runtime = runtimeModule;
    serverWidget = serverWidgetModule;
    ctsUtils = ctsUtilsModule;
    render = renderModule;
    return { onRequest: onRequest };
}

function onRequest(scriptContext) {
    var retValue = { success: false, message: "", data: {} };
    try {
        if (scriptContext.request.method === "GET") retValue = processGet(scriptContext);
        if (scriptContext.request.method === "POST") retValue = processPost(scriptContext);
        if (retValue.success) scriptContext.response.writePage(retValue.data.form);
        else scriptContext.response.write("<html><body><h1>" + retValue.message + "</h1></body></html>");
    }
    catch (e) { log.error({ title: "Error - on request", details: e }); }
}

function processGet(scriptContext) {
    var myParams = { action: "", data: { CompoundInterestTableHtml: "" } };
    myParams.action = "GET";
    myParams.data = null;
    var retValue = createUI(scriptContext, myParams);
    return retValue;
}

function processPost(scriptContext) {
    var retValue = { success: false, message: "", data: {} };
    try {
        var action = scriptContext.request.parameters.custpage_action || "";
        var userInputs = scriptContext.request.parameters;

        var Principal = parseFloat(userInputs.custpage_principal || 0);
        var Rate = parseFloat(userInputs.custpage_rate || 0);
        var Time = parseInt(userInputs.custpage_time || 0);

        var simpleInterest = ctsUtils.computeSimpleInterest(Principal, Rate, Time);
        var compoundInterest = ctsUtils.calculateCompoundInterest(Principal, Rate, Time);
        var compoundInterestTableHtml = GenerateCITableHtml(Principal, Rate, Time);
        var emi = ctsUtils.calculateEMI(Principal, Rate, Time);
        var emiTableHtml = GenerateEmiTableHtml(Principal, Rate, Time, emi);

        var myParams = {
            action: "POST",
            data: {
                Principal: Principal,
                Rate: Rate,
                Time: Time,
                simpleInterest: simpleInterest,
                compoundInterest: compoundInterest,
                compoundInterestTableHtml: compoundInterestTableHtml,
                emiTableHtml: emiTableHtml,
            }
        };
        if (scriptContext.request.parameters.custpage_action == "generatePdf") {
            try {
                var pdfFile = generatePdfFileFromRawXml(
                    Principal,
                    Rate,
                    Time,
                    simpleInterest,
                    compoundInterest,
                    compoundInterestTableHtml,
                    emiTableHtml
                );
                scriptContext.response.writeFile(pdfFile);
            } catch (e) { log.error({ title: "Error Generating PDF", details: e.message }); }
        }
        retValue = createUI(scriptContext, myParams);
    } catch (e) {
        log.error({ title: "Process Post Error", details: e.message });
        retValue.message = "An error occurred: " + e.message;
    }
    return retValue;
}

function createUI(scriptContext, myParams) {
    var retValue = { success: false, message: "", data: {} };
    try {
        var action = myParams.action;
        var form = serverWidget.createForm({ title: "Interest and EMI Calculator" });
        form.clientScriptModulePath = "./sri-mos-pc-cs-v1.js";
        var userAction = scriptContext.request.parameters.custpage_action;
        var inputGroup = form.addFieldGroup({ id: "custpage_input_group", label: "Primary Details" });

        var fldPrincipal = form.addField({ id: "custpage_principal", type: serverWidget.FieldType.CURRENCY, label: "Principal", container: "custpage_input_group" });
        var fldRate = form.addField({ id: "custpage_rate", type: serverWidget.FieldType.PERCENT, label: "Rate", container: "custpage_input_group" });
        var fldTime = form.addField({ id: "custpage_time", type: serverWidget.FieldType.INTEGER, label: "Time", container: "custpage_input_group" });

        form.addSubmitButton({ label: "Calculate" });
        form.addButton({ id: "custbtn_download_pdf", label: "Generate PDF", functionName: 'setAction("generatePdf" )' });

        if (action === "POST") {
            fldPrincipal.defaultValue = myParams.data.Principal;
            fldRate.defaultValue = myParams.data.Rate;
            fldTime.defaultValue = myParams.data.Time;

            var primaryGroup = form.addFieldGroup({ id: "custpage_primary_group", label: "Simple Interest" });
            var outputGroupCI = form.addFieldGroup({ id: "custpage_compound_interest", label: "Compound Interest" });
            var outputGroupCIT = form.addFieldGroup({ id: "custpage_compound_interest_t", label: "Compound Interest Table" });
            var outputGroupEMI = form.addFieldGroup({ id: "custpage_emi_group", label: "EMI Table" });

            var fldSimpleInterest = form.addField({
                id: "custpage_simple_interest",
                type: serverWidget.FieldType.CURRENCY,
                label: "Simple Interest",
                container: "custpage_primary_group",
            }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });
            fldSimpleInterest.defaultValue = myParams?.data?.simpleInterest?.toFixed(2) || "";

            var fldCompoundInterest = form.addField({
                id: "custpage_compound_interest",
                type: serverWidget.FieldType.CURRENCY,
                label: "Compound Interest",
                container: "custpage_compound_interest",
            }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });
            fldCompoundInterest.defaultValue = myParams?.data?.compoundInterest?.toFixed(2) || "";

            var fldCompoundInterestTable = form.addField({
                id: "custpage_compound_interest_table",
                type: serverWidget.FieldType.INLINEHTML,
                label: "Compound Interest Table",
                container: "custpage_compound_interest_t",
            }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });
            fldCompoundInterestTable.defaultValue = myParams?.data?.compoundInterestTableHtml || "";

            var fldEmiTable = form.addField({
                id: "custpage_emi_table",
                type: serverWidget.FieldType.INLINEHTML,
                label: "EMI Table",
                container: "custpage_emi_group",
            }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });
            fldEmiTable.defaultValue = myParams?.data?.emiTableHtml || "";

            form.addField({ id: "custpage_action", type: serverWidget.FieldType.TEXT, label: "Action" })
                .updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
        }

        retValue.success = true;
        retValue.message = "UI created successfully";
        retValue.data = { form: form };
    } catch (e) {
        log.error({ title: "Error - createUI", details: e });
        retValue.success = false;
        retValue.message = e.message;
    }
    return retValue;
}

function processSimpleInterest(scriptContext) {
    var retValue = { success: false, message: "", data: {} };
    try {
        var userInputs = scriptContext.request.parameters;
        var Principal = userInputs.custpage_principal;
        var Rate = userInputs.custpage_rate;
        var Time = userInputs.custpage_time;
        Principal = Principal ? Principal : 0;
        Rate = Rate ? Rate : 0;
        Time = Time ? Time : 0;
        Principal = parseFloat(Principal);
        Rate = parseFloat(Rate);
        Time = parseInt(Time);

        var simpleInterest = ctsUtils.computeSimpleInterest(Principal, Rate, Time);
        var myParams = { action: "POST", data: {} };
        myParams.data = { Principal: Principal, Rate: Rate, Time: Time, simpleInterest: simpleInterest };
        retValue = createUI(scriptContext, myParams);
    } catch (e) {
        log.error({ title: "Exception in processSimpleInterest", details: e });
        retValue.success = false;
        retValue.message = e;
    }
    return retValue;
}

function processCompoundInterest(scriptContext) {
    var retValue = { success: false, message: "", data: {} };
    try {
        var userInputs = scriptContext.request.parameters;
        var Principal = parseFloat(userInputs.custpage_principal) || 0;
        var Rate = parseFloat(userInputs.custpage_rate) || 0;
        var Time = parseInt(userInputs.custpage_time) || 0;

        var compoundInterest = ctsUtils.calculateCompoundInterest(Principal, Rate, Time);
        var CompoundInterestTableHtml = ctsUtils.GenerateCITableHtml(Principal, Rate, Time, compoundInterest);
        var myParams = { action: "POST", data: {} };
        myParams.data = {
            Principal: Principal,
            Rate: Rate,
            Time: Time,
            compoundInterest: compoundInterest,
            CompoundInterestTableHtml: CompoundInterestTableHtml,
        };
        retValue = createUI(scriptContext, myParams);
    } catch (e) {
        log.error({ title: "Exception in processCompoundInterest", details: e });
        retValue.success = false;
        retValue.message = e;
    }
    return retValue;
}

function processEmi(scriptContext) {
    var retValue = { success: false, message: "", data: {} };
    try {
        var userInputs = scriptContext.request.parameters;
        var Principal = parseFloat(userInputs.custpage_principal || 0);
        var Rate = parseFloat(userInputs.custpage_rate || 0);
        var Time = parseInt(userInputs.custpage_time || 0);
        var emi = ctsUtils.calculateEMI(Principal, Rate, Time);

        var emiTableHtml = ctsUtils.GenerateEmiTableHtml(Principal, Rate, Time, emi);

        var myParams = { action: "POST", data: { Principal: Principal, Rate: Rate, Time: Time, emiTableHtml: emiTableHtml } };
        retValue = createUI(scriptContext, myParams);
    } catch (e) {
        log.error({ title: "Error - processEmi", details: e });
        retValue.success = false;
        retValue.message = e.message;
    }
    return retValue;
}

function generatePdfFileFromRawXml(Principal, Rate, Time, simpleInterest, compoundInterest, compoundInterestTableHtml, emiTableHtml) {
    try {
        var xmlStr =
            '<?xml version="1.0"?>\n' +
            '<!DOCTYPE pdf>\n' +
            `<pdf>\n<body font-size="18">
                <h1>Calculation Results</h1>
                <p><b>Principal:</b> ${Principal}</p>
                <p><b>Rate:</b> ${Rate}%</p>
                <p><b>Time:</b> ${Time} years</p>  
                <p><b>Simple Interest:</b> ${simpleInterest ? simpleInterest.toFixed(2) : ''}</p>
                <p><b>Compound Interest:</b> ${compoundInterest ? compoundInterest.toFixed(2) : ''}</p>
                <div>${compoundInterestTableHtml}</div>
                <div>${emiTableHtml}</div>
            </body>\n</pdf>`;

        var pdfFile = render.xmlToPdf({ xmlString: xmlStr });
        pdfFile.name = "Financial Calculations.pdf";
        return pdfFile;
    } catch (e) {
        log.error({ title: "Error Generating PDF", details: e.message });
        throw e;
    }
}
