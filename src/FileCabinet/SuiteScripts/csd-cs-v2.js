/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

/*
Name          : Client Script for Button Action
Author        : Mosses
Description   : Handles button click to increment a field and submit the form.
Dependencies  : N/currentRecord
Release Date  : 2025-01-09
Version       : 1.0.0
Changing      : 1.0.0 - Initial release
Website       : www.cloudio.com
*/

define(['N/currentRecord'], main);

function main (currentRecord) {
    
}

function crashingCar() {
    const record = currentRecord.get(); ce
    let gameCount = parseInt(record.getValue({ fieldId: 'custfield_csd_c_game_count' })) || 0;
    gameCount += 1;
    record.setValue({
        fieldId: 'custfield_csd_c_game_count',
        value: gameCount
    });
    form.submit();
}

return {
    crashingCar: crashingCar
};