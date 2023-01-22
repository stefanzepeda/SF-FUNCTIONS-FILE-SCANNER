trigger ContentVersionTrigger on ContentVersion (after insert) {
    List<ContentVersion> insertedPDF = new List<ContentVersion>();
    List<ContentVersion> checkPDF = new List<ContentVersion>();
    Set<Id> documentIds = new Set<Id>();

    for(ContentVersion cv: Trigger.NEW){
        if(cv.FileType!=null && cv.FileType=='PDF'){
            checkPDF.add(cv);
            documentIds.add(cv.ContentDocumentId);
        }
    }
    if(checkPDF.isEmpty()) return;

    List<User> integrationUser = [SELECT ID FROM User WHERE Name='Platform Integration User'];

    if(integrationUser.isEmpty()) return;

    Set<Id> existingLinkDocIds = new Set<Id>();

    for(ContentDocumentLink cdl: [SELECT Id,ContentDocumentId FROM ContentDocumentLink WHERE ContentDocumentId in:documentIds AND LinkedEntityId =:integrationUser[0].Id]){
        if(!existingLinkDocIds.contains(cdl.ContentDocumentId)){
            existingLinkDocIds.add(cdl.ContentDocumentId);
        }
    }
    List<ContentDocumentLink> insertNewDocLinks = new List<ContentDocumentLink>();

    for(ContentVersion cv: checkPDF){
        if(!existingLinkDocIds.contains(cv.ContentDocumentId)){
            insertedPDF.add(cv);
            ContentDocumentLink newCdl = new ContentDocumentLink();
            newCdl.ContentDocumentId = cv.ContentDocumentId;
            newCdl.LinkedEntityId = integrationUser[0].Id;
            newCdl.ShareType = 'C';
            insertNewDocLinks.add(newCdl);
        }
    }

    if(insertedPDF.isEmpty()) return;

    insert insertNewDocLinks;
    System.debug(insertedPDF);
    
    ID jobID = System.enqueueJob(new ContentVersionQueueable(insertedPDF));
    
}