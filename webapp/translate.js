const spawn = require('child_process').spawn;
const fs = require('fs');
const speak = require('./speak');
// const crypto = require('crypto');
//let hash = crypto.createHash('md5').update(req.body.content).digest("hex");


function ocr(imageFile) {
    return new Promise((resolve, reject) => {
        let textFileBasename = imageFile+'_translation';
        let textFile = textFileBasename+".txt";
        let tesseract = spawn('tesseract', ['-l', 'fas', imageFile, textFileBasename]);

        let stdout = '';
        let stderr = '';
        tesseract.stdout.on('data', data=>stdout += data.toString());
        tesseract.stderr.on('data', data=>stderr += data.toString());
    
        tesseract.on('exit', (code)=>{
            if (code === 0) {
                let ocr = fs.readFileSync(textFile).toString();
                resolve(ocr)
            } else {
                reject({ stdout, stderr });
            }
        })
    });
}

// >>> from deep_translator import GoogleTranslator
// >>> langs_dict = GoogleTranslator.get_supported_languages(as_dict=True)  # output: {arabic: ar, french: fr, english:en etc...}
// >>> langs_dict
// {'afrikaans': 'af', 'albanian': 'sq', 'amharic': 'am', 'arabic': 'ar', 'armenian': 'hy', 'azerbaijani': 'az', 'basque': 'eu', 'belarusian': 'be', 'bengali': 'bn', 'bosnian': 'bs', 'bulgarian': 'bg', 'catalan': 'ca', 'cebuano': 'ceb', 'chichewa': 'ny', 'chinese': 'zh', 'chinese (simplified)': 'zh-cn', 'chinese (traditional)': 'zh-tw', 'corsican': 'co', 'croatian': 'hr', 'czech': 'cs', 'danish': 'da', 'dutch': 'nl', 'english': 'en', 'esperanto': 'eo', 'estonian': 'et', 'filipino': 'tl', 'finnish': 'fi', 'french': 'fr', 'frisian': 'fy', 'galician': 'gl', 'georgian': 'ka', 'german': 'de', 'greek': 'el', 'gujarati': 'gu', 'haitian creole': 'ht', 'hausa': 'ha', 'hawaiian': 'haw', 'hebrew': 'iw', 'hindi': 'hi', 'hmong': 'hmn', 'hungarian': 'hu', 'icelandic': 'is', 'igbo': 'ig', 'indonesian': 'id', 'irish': 'ga', 'italian': 'it', 'japanese': 'ja', 'javanese': 'jw', 'kannada': 'kn', 'kazakh': 'kk', 'khmer': 'km', 'korean': 'ko', 'kurdish (kurmanji)': 'ku', 'kyrgyz': 'ky', 'lao': 'lo', 'latin': 'la', 'latvian': 'lv', 'lithuanian': 'lt', 'luxembourgish': 'lb', 'macedonian': 'mk', 'malagasy': 'mg', 'malay': 'ms', 'malayalam': 'ml', 'maltese': 'mt', 'maori': 'mi', 'marathi': 'mr', 'mongolian': 'mn', 'myanmar (burmese)': 'my', 'nepali': 'ne', 'norwegian': 'no', 'pashto': 'ps', 'persian': 'fa', 'polish': 'pl', 'portuguese': 'pt', 'punjabi': 'pa', 'romanian': 'ro', 'russian': 'ru', 'samoan': 'sm', 'scots gaelic': 'gd', 'serbian': 'sr', 'sesotho': 'st', 'shona': 'sn', 'sindhi': 'sd', 'sinhala': 'si', 'slovak': 'sk', 'slovenian': 'sl', 'somali': 'so', 'spanish': 'es', 'sundanese': 'su', 'swahili': 'sw', 'swedish': 'sv', 'tajik': 'tg', 'tamil': 'ta', 'telugu': 'te', 'thai': 'th', 'turkish': 'tr', 'ukrainian': 'uk', 'urdu': 'ur', 'uzbek': 'uz', 'vietnamese': 'vi', 'welsh': 'cy', 'xhosa': 'xh', 'yiddish': 'yi', 'yoruba': 'yo', 'zulu': 'zu', 'Filipino': 'fil', 'Hebrew': 'he'}


function translate(inputText) {
    return new Promise((resolve, reject) => {
        let dt = spawn('deep_translator', [
            '--translator', 'google', 
            '-src', 'fa', '-tg', 'en', '-txt', inputText]);

        let stdout = '';
        let stderr = '';
        dt.stdout.on('data', data=>stdout += data.toString());
        dt.stderr.on('data', data=>stderr += data.toString());
    
        dt.on('exit', (code)=>{
            if (code === 0) {
                resolve(stdout.split('\n').slice(2,-1).map(i=>i.trim()));
            } else {
                reject(stderr);
            }
        })
    });
}

const recordingCache = {};
const translationCache = {};

module.exports = async function(imageFile) {
    let ocrText = null;
    let ocrError = null;
    let translation = null;
    let translateError = null;
    let recordingURL = null;
    let recordingError= null;
    try {
        ocrText = await ocr(imageFile);
        if (ocrText.trim().length < 1) {
            ocrError = "no text detected";
        }
    } catch(err) {
        error = ocrError
    }
    if (!ocrError) {
        if (translationCache[ocrText]) {
            translation = translationCache[ocrText];
        } else {
            try {
                translation = await translate(ocrText);
                translationCache[ocrText] = translation;
            } catch(err) {
                translateError = err;
            }
        }
        if (recordingCache[ocrText]) {
            recordingURL = recordingCache[ocrText]
        } else {
            try {
                recordingURL = await speak(ocrText);
                recordingCache[ocrText] = recordingURL;
            } catch(err) {
                console.log(err.stack);
                recordingError = err;
            }
        }
    }
    return { ocrError, ocrText, translation, translateError, recordingURL, recordingError }
}
