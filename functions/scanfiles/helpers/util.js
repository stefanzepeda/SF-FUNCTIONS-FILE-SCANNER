import {
    SyncRedactor
} from "redact-pii";
import {rgb,} from 'pdf-lib';

export function calcStartPos(sentence, location) {
    let letterSize = sentence.split(' ')
        .filter((word, index) => index < location)
        .reduce((totalSize, word) => totalSize + word.length, 0)
    return letterSize + location //add location to account for number of spaces
}

export async function extractTextBlocks(pdf, numPages) {
    let pagePromises = Array(numPages).fill(0)
        .map(async (page, index) => pdf.getPage(index + 1))
    let pageProxy = await Promise.all(pagePromises)

    let textPromise = pageProxy.map((page) => page.getTextContent());
    let textProxy = await Promise.all(textPromise);
    return textProxy;
}

export function buildBlocks(snippetList, snippet) {

    const transform = snippet.transform;
    const x = transform[4];
    const y = transform[5];
    const width = snippet.width;
    const height = snippet.height;
    const redactor = new SyncRedactor();
    const redactedText = redactor.redact(snippet.str);
    let isRedacted = snippet.str !== redactedText;

    if (!isRedacted) return snippetList;


    const rectanglePlots = snippet.str
        .split(' ')
        .reduce((list, word, index) => redactedText.split(' ').indexOf(word) == -1 ?
            list.concat([{
                redactedWord: word,
                location: index
            }]) :
            list, [])
        .map(item => {
            const letterSize = width / snippet.str.length;
            return {
                x: x + (letterSize * calcStartPos(snippet.str, item.location)),
                y: y,
                width: (letterSize * item.redactedWord.length) + 10, //added 10 padding for font sizes
                height: height,
                borderColor: rgb(0, 0, 0),
                borderWidth: 1.5,
                color: rgb(0, 0, 0),
                page: snippet.page,
            }
        })
        
    return snippetList.concat(rectanglePlots);
}

