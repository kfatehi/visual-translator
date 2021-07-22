const axios = require('axios');

module.exports = async function speak(content) {
    let resp = await axios.post("http://8.3.29.110:3000/tts", { content });
    return "http://8.3.29.110:3000"+resp.data.path;
}

