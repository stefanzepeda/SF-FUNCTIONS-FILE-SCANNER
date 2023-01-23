/**
 * Function that takes in a PDF document in Salesforce and performs PDF 
 * redaction by blacking out sensitive parts of the file
 *
 *
 * Following parameters are pre-configured and provided to your function on execution:
 * @param event: represents the data associated with the occurrence of an event, and
 *                 supporting metadata about the source of that occurrence.
 * @param context: represents the connection to Functions and your Salesforce org.
 * @param logger: logging handler used to capture application logs and trace specifically
 *                 to a given execution of a function.
 */
import pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import {
    PDFDocument,
} from 'pdf-lib';
import * as httpHelper from "./helpers/httpHelper.js";
import * as util from "./helpers/util.js";

export default async function(event, context, logger) {

    logger.info(`Invoking Scanfiles with payload ${JSON.stringify(event.data || {})}`);

    const docId = event.data.contentDocumentId;
    const binaryFile = await httpHelper.getPDFBinary(event, context);

    const readablePdf = await pdfjsLib.getDocument( //load readable PDF to extract text
        binaryFile
    ).promise;
    const numPages = readablePdf.numPages;

    const writeablePdf = await PDFDocument.load(binaryFile) //load writeable PDF
    const pages = writeablePdf.getPages();


    logger.info('Number of pages to process: ' + numPages);

    const rawTextExtracts = await util.extractTextBlocks(readablePdf, numPages);


    const textToRedact = rawTextExtracts
        .reduce((acc, pageContent, pageIndex) => {
            pageContent.items.forEach((item) => item.page = pageIndex)
            return acc.concat(pageContent.items)
        }, [])
        .reduce(util.buildBlocks, [])

    const redactedResults = textToRedact.map(item => pages[item.page].drawRectangle(item))

    const pdfBase64 = await writeablePdf.saveAsBase64()

    return await httpHelper.savePDF(context,docId,pdfBase64);

}