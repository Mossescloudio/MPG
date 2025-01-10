/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

/*
Name          : Client Script
Author        : Mosses
Description   : Handles the Crash button click to increment the game number.
Dependencies  : None
Release Date  : 2025-01-08
Version       : 1.0.0
Changing      : 1.0.0 - Initial release
Website       : www.cloudio.com
*/

const modules = ['N/currentRecord', 'N/ui/message'];
var currentRecord, ui;

define(modules, main);

function main(curRecord, ui) {
    currentRecord = curRecord;
    ui = ui;
    return { pageInit: pageInit, incrementGameNumber: incrementGameNumber };
}

function pageInit(context) {
    var currentRec = currentRecord.get(); // Get the current record
    var gameNoFieldId = 'custrecord_csd_c_game_no'; // Field ID for the game number
    var gameNo = currentRec.getValue({ fieldId: gameNoFieldId }); // Get the current value

    // Initialize the field if it is null or empty
    if (gameNo === null || gameNo === '') {
        currentRec.setValue({
            fieldId: gameNoFieldId,
            value: 0 // Default the game number to 0
        });

        // Optional: Display an information message about initialization
        ui.message.create({
            title: 'Game Number Initialized',
            message: 'The game number was empty and has been initialized to 0.',
            type: ui.message.Type.INFORMATION
        }).show();
    }
}

function incrementGameNumber() {
    var currentRec = currentRecord.get(); // Get the current record
    var gameNoFieldId = 'custrecord_csd_c_game_no'; // Field ID for the game number
    var gameNo = currentRec.getValue({ fieldId: gameNoFieldId }); // Get the current value

    // Increment the value
    if (gameNo !== null && gameNo !== '') {
        gameNo = parseInt(gameNo, 10) + 1;
    } else {
        gameNo = 1; // Initialize if somehow empty
    }

    // Update the field value
    currentRec.setValue({
        fieldId: gameNoFieldId,
        value: gameNo
    });

    // Optional: Display a confirmation message
    ui.message.create({
        title: 'Game Updated',
        message: 'The game number has been updated to ' + gameNo,
        type: ui.message.Type.CONFIRMATION
    }).show();
}
