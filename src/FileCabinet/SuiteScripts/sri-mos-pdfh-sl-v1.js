/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
/*
Name        : PDF Generator
Author      : Mosses
Description : Helper suitelet to generate stuffs like pdfs
Version     : 1.0.0
*/
var ctsUtils, render;

var modules = ['./sri-mos-pc-mod-v1', 'N/render'];

define(modules, main);

function main(ctsModule, renderModule) {
    ctsUtils = ctsModule;
    render = renderModule;
    return { onRequest: onRequest }
}

function onRequest(scriptContext) {
    const { method } = scriptContext.request;
    var retValue = { success: false, message: '', data: {} };

    if (method == 'GET') {
        var renderer = render.create();
        var pdfTemplate = `
            <pdf>
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Finance Calculator Table</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }
                    th, td {
                        text-align: center;
                        padding: 10px;
                        border: 1px solid #ccc;
                    }
                    th {
                        background-color: #007b5e;
                        color: white;
                        font-weight: bold;
                    }
                    tr:nth-child(even) {
                        background-color: #f2f2f2;
                    }
                    .total-row {
                        font-weight: bold;
                        background-color: #007b5e;
                        color: white;
                    }
                </style>
            </head>
            <body>
                <table>
                    <thead>
                        <tr>
                            <th>Year</th>
                            <th>Principle</th>
                            <th>Interest</th>
                            <th>Installment</th>
                            <th>Capital Repay</th>
                            <th>Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>150000.00</td>
                            <td>16327.82</td>
                            <td>47400.90</td>
                            <td>31073.09</td>
                            <td>118926.91</td>
                        </tr>
                    </tbody>
                </table>
            </body>
            </html>
        </pdf>

        `;
        log.debug({title: 'HTML', details: pdfTemplate});
        renderer.templateContent = pdfTemplate;
        var pdfFile = renderer.renderAsPdf();
        scriptContext.response.writeFile({
            file: pdfFile,
            isInline: false
        });
    }

    if (retValue.success) {
        log.debug({ title: 'On Success', details: retValue });
        scriptContext.response.writeFile({
            file: pdfFile,
            isInline: false });
    } else {
        retValue.message = retValue.message || 'Error on request';
    }
}