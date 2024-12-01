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
                <head>
                    <style type="text/css">
                        body {
                            font-family: arial;
                            font-size: 12px;
                        }
                        h1 {
                            font-size: 18px;
                            color: #333;
                        }
                        p {
                            margin: 5px 0;
                        }
                    </style>
                </head>
                <body>
                    <h1>Custom PDF Document</h1>
                    <p>Hello Balu, Team this is a dynamically generated PDF! TEst yeah Mosses Ross</p>
                    <p>Custom Text: ${scriptContext.request.parameters.customText || 'Default Text'}</p>
                </body>
            </pdf>
        `;

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