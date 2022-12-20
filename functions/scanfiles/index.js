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

import * as pdfjsLib from 'pdfjs';

export default async function (event, context, logger) {
  logger.info(`Invoking Scanfiles with payload ${JSON.stringify(event.data || {})}`);

  //const results = await context.org.dataApi.query('SELECT Id, Name FROM Account');
  const query = "SELECT Id, VersionData FROM ContentVersion WHERE Id='"+event.data.contentDocId+"'";
  const results = await context.org.dataApi.query(query);
  let binaryFile = results.records[0].binaryFields.versiondata;
  logger.info('testing binary: '+Buffer.isBuffer(binaryFile));
  logger.info('testing binary 2: '+typeof binaryFile);
  const pdf = await pdfjsLib.getDocument(binaryFile);
  //const numPages = pdf.numPages;
  logger.info('testing number of pages: '+JSON.stringify(binaryFile).substring(0,200));

  return pdf;
}
