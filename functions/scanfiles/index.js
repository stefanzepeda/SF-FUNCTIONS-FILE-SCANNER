/**
 * Describe Scanfiles here.
 *
 * The exported method is the entry point for your code when the function is invoked.
 *
 * Following parameters are pre-configured and provided to your function on execution:
 * @param event: represents the data associated with the occurrence of an event, and
 *                 supporting metadata about the source of that occurrence.
 * @param context: represents the connection to Functions and your Salesforce org.
 * @param logger: logging handler used to capture application logs and trace specifically
 *                 to a given execution of a function.
 */
import pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { SyncRedactor } from "redact-pii";
import axios from "axios";


export default async function (event, context, logger) {

  

  logger.info(`Invoking Scanfiles with payload ${JSON.stringify(event.data || {})}`);

  //const query = "SELECT ContentDocumentId,VersionData FROM ContentVersion WHERE Id='"+event.data.contentDocId+"'";
  let  requestUrl= context.org.baseUrl+'/services/data/v55.0/sobjects/ContentVersion/068DE000002EekMYAS/VersionData';
  console.log(requestUrl);
  console.log(context.org.dataApi.accessToken);
  const bodyRaw = await axios.get(requestUrl,
                        {
                          headers: {
                                  Authorization: 'Bearer ' + context.org.dataApi.accessToken,
                          },
                          responseType: 'arraybuffer',
                        },
                        );

  const binaryFile = bodyRaw.data;
  const docId = '069DE000002AYXiYAO';

  const pdf = await pdfjsLib.getDocument(
    binaryFile
  ).promise; //load readable PDF to extract text

  const pdfDoc = await PDFDocument.load(binaryFile) //load writeable PDF
  const pages = pdfDoc.getPages()

  const numPages = pdf.numPages;

  logger.info('Number of pages to process: '+numPages);

  let pagePromises = Array(numPages).fill(0)
    .map(async (page,index) => pdf.getPage(index+1))
    
  let pageProxy = await Promise.all(pagePromises)

  let textPromise = pageProxy.map((page) => page.getTextContent());
  let textProxy = await Promise.all(textPromise);
  let calcStartPos = (sentence,location) => {
    let letterSize = sentence.split(' ')
                              .filter((word,index)=>index<location)
                              .reduce((totalSize,word)=>totalSize+word.length,0)
    return letterSize+location //add location to account for number of spaces
  };
  let textContent = textProxy
      .reduce((acc,pageContent,pageIndex) => {
        pageContent.items.forEach((item)=> item.page = pageIndex)
        return acc.concat(pageContent.items)
      },[] )
      .reduce((acc,snippet)=>{
        const transform = snippet.transform;
        const x = transform[4];
        const y = transform[5];
        const width = snippet.width;
        const height = snippet.height;
        const redactor = new SyncRedactor();
        const redactedText = redactor.redact(snippet.str);
        let isRedacted = snippet.str!==redactedText;
        if(!isRedacted) return acc;
        console.log(redactedText);
        
        const rectanglePlots = snippet.str
          .split(' ')
          .reduce((list,word,index) => redactedText.split(' ').indexOf(word)==-1?
                                            list.concat([{redactedWord:word,location:index}]):
                                            list
          ,[])
          .map(item => {
            const letterSize = width/snippet.str.length;
            return {
              x: x+(letterSize*calcStartPos(snippet.str,item.location)),
              y: y,
              width: (letterSize*item.redactedWord.length)+10,//added 10 padding for font sizes
              height: height,
              borderColor: rgb(0, 0, 0),
              borderWidth: 1.5,
              color: rgb(0,0,0),
              page: snippet.page,
            }
          })
        
        
        console.log(acc); 
        return acc.concat(rectanglePlots);
      },[])
  let plotResults = textContent.map(item => pages[item.page].drawRectangle(item))
    

  const pdfBase64 = await pdfDoc.saveAsBase64()

  return await context.org.dataApi.create({
    type: "ContentVersion",
    fields: {
      ContentDocumentId : docId,
      PathOnClient: `redacted-pdf.pdf`,
      ReasonForChange: 'Redacted PDF',
      VersionData: pdfBase64,
    }
  });

}
