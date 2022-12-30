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


export default async function (event, context, logger) {

  

  logger.info(`Invoking Scanfiles with payload ${JSON.stringify(event.data || {})}`);

  //const results = await context.org.dataApi.query('SELECT Id, Name FROM Account');
  const query = "SELECT VersionData FROM ContentVersion WHERE Id='"+event.data.contentDocId+"'";
  const results = await context.org.dataApi.query(query);
  const binaryFile = results.records[0].binaryFields.versiondata;

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
  let textContent = textProxy
      .reduce((acc,pageContent,pageIndex) => {
        pageContent.items.forEach((item)=> item.page = pageIndex)
        return acc.concat(pageContent.items)
      },[] )
      .forEach((snippet,index)=>{
        const transform = snippet.transform;
        const x = transform[4];
        const y = transform[5];
        const width = snippet.width;
        const height = snippet.height;
        const redactor = new SyncRedactor();
        const redactedText = redactor.redact(snippet.str);
        let isRedacted = snippet.str!==redactedText;
        if(!isRedacted) return;
        pages[snippet.page].drawRectangle({
          x: x,
          y: y,
          width: width,
          height: height,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1.5,
          color: rgb(0,0,0),
        })
      })



  //let metadata = await pdf.getMetadata();
  //let textPage = await pdf.getData();
  //const readableStream = page.streamTextContent();
  //const reader = readableStream.getReader();
  const pdfBase64 = await pdfDoc.saveAsBase64()

  return await context.org.dataApi.create({
    type: "ContentVersion",
    fields: {
      Title: `test-pdf-test`,
      PathOnClient: `test-pdf-test.pdf`,
      Description: `Test PDF`,
      VersionData: pdfBase64,
    }
  });

  //logger.info('testing text in pages: '+JSON.stringify(textContent));

  /*let textPages = Array(numPages).fill(0).reduce(async (acc,cv,index) => {
    
    return acc.push(textContent.items);
  },[])*/

  //logger.info('testing text in pages: '+textPages);

  //return numPages;
}
