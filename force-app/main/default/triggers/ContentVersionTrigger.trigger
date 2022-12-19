trigger ContentVersionTrigger on ContentVersion (after insert) {
    
    for(ContentVersion cv: Trigger.NEW){
        if(cv.FileType!=null){
            System.debug(cv.FileType);
            ID jobID = System.enqueueJob(new ContentVersionQueueable(cv.Id));
        }
    }
    
}