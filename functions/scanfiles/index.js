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
  //logger.info('testing buffer content: '+JSON.stringify(binaryFile));

  const pdf = await pdfjsLib.getDocument(
    binaryFile
  ).promise;
  //const pdf = await PDFJSLib.getDocument(binaryFile);
  const numPages = pdf.numPages;
  logger.info('testing number of pages: '+numPages);
  
  let page = await pdf.getPage(1);
  let textContent = await page.getTextContent();

  const pdfDoc = await PDFDocument.load(binaryFile)

  const pages = pdfDoc.getPages()
  const firstPage = pages[0]

  const item = textContent.items[0];
  const transform = item.transform;
  const x = transform[4];
  const y = transform[5];
  const width = item.width;
  const height = item.height;
  
  const redactor = new SyncRedactor();
  logger.info(JSON.stringify(item));
  const redactedText = redactor.redact(item.str);
  // Hi NAME, Please give me a call at PHONE_NUMBER
  logger.info(redactedText);
  
  logger.info(item.str===redactedText);


  firstPage.drawRectangle({
    x: x,
    y: y,
    width: width,
    height: height,
    borderColor: rgb(1, 0, 0),
    borderWidth: 1.5,
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
