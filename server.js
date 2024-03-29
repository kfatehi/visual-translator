const express = require('express');
const analyze = require('./analyze');

const app = express();

app.use(require('express-fileupload')({
    limits: { fileSize: 50 * 1024 * 1024 }
}));

app.use('/', express.static('public'));
app.use('/tmp', express.static('tmp'));

app.post('/upload', async function (req, res) {
    let dest = __dirname+'/tmp/last-img.png';
    await req.files.image.mv(dest);
    res.json({});
});

app.post('/crop', async function (req, res) {
    let dest = __dirname+'/tmp/crop.png';
    await req.files.crop.mv(dest);
    let result = await analyze(dest);
    res.json(result);
});

app.listen(3000, () => {
    console.log("listening on 3000");
});
