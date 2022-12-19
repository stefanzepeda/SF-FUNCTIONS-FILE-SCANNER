public with sharing class ContentVersionQueueable implements Queueable {
    private String contentDocId;

    public ContentVersionQueueable (String recordId){
        this.contentDocId=recordId;
    }

    public void execute(QueueableContext context) {

        
        Long startTime = DateTime.now().getTime();
        
        String Jsonpayload = '{"contentDocId": "'+contentDocId+'"}';

        Functions.Function scanFilesFunction = functions.Function.get('SF_FUNCTIONS_FILE_SCANNER.scanfiles');
        Functions.FunctionInvocation invocation = scanFilesFunction.invoke(Jsonpayload);
        String jsonResponse = invocation.getResponse();
        Long endTime = DateTime.now().getTime();
        Long milliseconds = endTime - startTime;

        System.debug(jsonResponse);
        
    }
}
