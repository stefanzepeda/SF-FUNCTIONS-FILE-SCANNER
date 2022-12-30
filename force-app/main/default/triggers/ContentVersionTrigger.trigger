trigger ContentVersionTrigger on ContentVersion (after insert) {
    
    for(ContentVersion cv: Trigger.NEW){
        if(cv.FileType!=null){
            System.debug(cv.FileType);
            
            ContentDocumentLink cdl = new ContentDocumentLink();
            cdl.ContentDocumentId = [SELECT Id, ContentDocumentId FROM ContentVersion WHERE Id =: cv.Id].ContentDocumentId;
            List<ContentDocumentLink> existingList = [SELECT Id FROM ContentDocumentLink WHERE ContentDocumentId=:cdl.ContentDocumentId AND LinkedEntityId = '0058G000002IOs2QAG'];
            if(existingList.size()>0) break;
            cdl.LinkedEntityId = '0058G000002IOs2QAG';
            cdl.ShareType = 'C';
            insert cdl;
            ID jobID = System.enqueueJob(new ContentVersionQueueable(cv.Id));
        }
    }
    
}