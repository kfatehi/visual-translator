const spawn = require('child_process').spawn;
const fs = require('fs');

module.exports = function ocr(imageFile) {
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