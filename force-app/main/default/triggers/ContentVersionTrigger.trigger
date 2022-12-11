trigger ContentVersionTrigger on ContentVersion (before insert) {
    
    Functions.Function scanFilesFunction = functions.Function.get('SF_FUNCTIONS_FILE_SCANNER.scanfiles');
    Functions.FunctionInvocation invocation = scanFilesFunction.invoke(JSON.serialize(Trigger.NEW));
    System.debug(invocation.getResponse());
}