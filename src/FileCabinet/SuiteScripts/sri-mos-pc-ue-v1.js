/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
var query, record;
var modules = ['N/query', 'N/record'];
define(modules, main);

function main(queryModule, recordModule){
    query = queryModule;
    record = recordModule;
    return {
        beforeLoad : myBeforeLoad,
        beforeSubmit : myBeforeSubmit,
        afterSubmit : myAfterSubmit
    }
}

function myBeforeLoad(ScriptContext){
    log.debug({title: beforeLoad,
        details: "Test of code"
    })
}

function myBeforeSubmit(ScriptContext){
    log.debug({title: beforeSubmit,
        details: "ScriptContext"
    })
}

function myAfterSubmit(ScriptContext){
    log.debug({title: afterSubmit,
        details: ScriptContext
    })
}