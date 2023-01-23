import axios from "axios";


export async function getPDFBinary(event, context) {
    let requestUrl = this.getObjectURL(context.org.baseUrl,'ContentVersion',event.data.contentVersionId,'VersionData');

    const bodyRaw = await axios.get(requestUrl, {
        headers: {
            Authorization: 'Bearer ' + context.org.dataApi.accessToken,
        },
        responseType: 'arraybuffer',
    }, );
    return bodyRaw.data;
}

export function getObjectURL(baseURL,objectName,recordId,fieldName) {
  return `${baseURL}/services/data/v55.0/sobjects/${objectName}/${recordId}/${fieldName}`;
}

export async function savePDF(context,docId,pdfBase64){
  return context.org.dataApi.create({
    type: "ContentVersion",
    fields: {
        ContentDocumentId: docId,
        PathOnClient: `redacted-pdf.pdf`,
        ReasonForChange: 'Redacted PDF',
        VersionData: pdfBase64,
    }
  });
}