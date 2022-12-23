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


export default async function (event, context, logger) {

  

  logger.info(`Invoking Scanfiles with payload ${JSON.stringify(event.data || {})}`);

  //const results = await context.org.dataApi.query('SELECT Id, Name FROM Account');
  const query = "SELECT VersionData FROM ContentVersion WHERE Id='"+event.data.contentDocId+"'";
  const results = await context.org.dataApi.query(query);
  let binaryFile = results.records[0].binaryFields.versiondata;
  //logger.info('testing buffer content: '+JSON.stringify(binaryFile));

  const pdf = await pdfjsLib.getDocument(
    binaryFile
  ).promise;
  //const pdf = await PDFJSLib.getDocument(binaryFile);
  const numPages = pdf.numPages;
  logger.info('testing number of pages: '+numPages);
  
  let page = await pdf.getPage(1);
  let textContent = await page.getTextContent();
  //let metadata = await pdf.getMetadata();
  //let textPage = await pdf.getData();
  //const readableStream = page.streamTextContent();
  //const reader = readableStream.getReader();


  logger.info('testing text in pages: '+JSON.stringify(textContent));

  /*let textPages = Array(numPages).fill(0).reduce(async (acc,cv,index) => {
    
    return acc.push(textContent.items);
  },[])*/

  //logger.info('testing text in pages: '+textPages);

  return numPages;
}
