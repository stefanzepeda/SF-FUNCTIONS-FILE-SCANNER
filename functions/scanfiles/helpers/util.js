export async function calcStartPos (sentence, location)  {
    const letterSize = 
        sentence.split(' ')
        .filter((word, index) => index < location)
        .reduce((totalSize, word) => totalSize + word.length, 0)
    return letterSize + location //add location to account for number of spaces
}