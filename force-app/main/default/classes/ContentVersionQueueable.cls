public with sharing class ContentVersionQueueable implements Queueable {
    private List<ContentVersion> ContentVersions;

    public ContentVersionQueueable (List<ContentVersion> versions){
        this.ContentVersions=versions;
    }

    public void execute(QueueableContext context) {

        for(ContentVersion cv: ContentVersions){
            Long startTime = DateTime.now().getTime();
            String Jsonpayload = '{"contentVersionId": "'+cv.Id+'","contentDocumentId":"'+cv.ContentDocumentId+'"}';
            Functions.Function scanFilesFunction = functions.Function.get('SF_FUNCTIONS_FILE_SCANNER.scanfiles');
            Functions.FunctionInvocation invocation = scanFilesFunction.invoke(Jsonpayload);
            String jsonResponse = invocation.getResponse();
            Long endTime = DateTime.now().getTime();
            Long milliseconds = endTime - startTime;
            System.debug(jsonResponse);
        }
    }
}
