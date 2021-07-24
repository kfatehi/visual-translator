const axios = require('axios');

module.exports = async function speak(content) {
    let resp = await axios.post("https://tts.farsi.keyvan.tv/tts", { content });
    return "https://tts.farsi.keyvan.tv"+resp.data.path;
}

