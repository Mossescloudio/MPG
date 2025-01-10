/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

/*
Name          : Simple Suitelet with Button
Author        : Mosses
Description   : Creates a simple button on the screen.
Dependencies  : None
Release Date  : 2025-01-09
Version       : 1.0.0
Changing      : 1.0.0 - Initial release
Website       : www.cloudio.com
*/

var serverWidget, record;

var modules = ["N/ui/serverWidget", "N/record"];

define(modules, main);

function main(serverWidgetModule, recordModule) {
    serverWidget = serverWidgetModule;
    record = recordModule;
    return { onRequest: onRequest };
}

function onRequest(context) {
    if (context.request.method === 'GET') {
        var form = serverWidget.createForm({ title: 'Car Stunt Data Tracker Mark II' });

        form.addButton({
            id: 'custpage_crash_button',
            label: 'Crash',
            functionName: 'crashingCar()'
        });

        form.addField({
            id: 'custfield_csd_players_name',
            type: serverWidget.FieldType.TEXT,
            label: 'Players Name'
        })
        form.addField({
            id: 'custfield_csd_c_game_count',
            type: serverWidget.FieldType.INTEGER,
            label: 'Game Count'
        })

        form.clientScriptModulePath = './csd-cs-v2.js';

        context.response.writePage(form);
    }
    else if (context.request.method === 'POST') {
        
    }
}
