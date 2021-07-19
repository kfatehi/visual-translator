const express = require('express');
const ocr = require('./ocr');

const app = express();

app.use(require('express-fileupload')({
    limits: { fileSize: 50 * 1024 * 1024 }
}));

app.use('/', express.static('public'));
app.use('/tmp', express.static('tmp'));

app.post('/ocr', async function (req, res) {
    let dest = __dirname+'/tmp/last-img.png';
    await req.files.image.mv(dest);
    let result = await ocr(dest);
    res.json(result);
});

app.listen(3000, () => {
    console.log("listening on 3000");
});
