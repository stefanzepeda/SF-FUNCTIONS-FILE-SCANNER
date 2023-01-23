import axios from "axios";

/**
 * Test whether a given URL is retrievable.
 */
export async function getPDFBinary(event, context) {
    let requestUrl = this.getObjectURL(context.org.baseURL,'ContentVersion',event.data.contentVersionId,'VersionData');
    console.log(requestUrl);
    const bodyRaw = await axios.get(requestUrl, {
        headers: {
            Authorization: 'Bearer ' + context.org.dataApi.accessToken,
        },
        responseType: 'arraybuffer',
    }, );
    return bodyRaw.data;
}

export async function getObjectURL(baseURL,objectName,fieldName) {
  return `${baseURL}/services/data/v55.0/sobjects/${objectName}/${objectId}/${fieldName}`;
}