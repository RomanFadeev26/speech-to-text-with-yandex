const {FOLDER_ID} = require('../auth/consts');
const superagent = require('superagent');
const {fetchIamToken} = require('../auth/iam-token');

async function textToSpeech(text) {
    console.log('from tts');
    const result = await superagent
        .post('https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize')
        .query({text, voice: 'zahar', folderId: FOLDER_ID})
        .set('Authorization', `Bearer ${await fetchIamToken()}`);

    return result.body;
}

module.exports = textToSpeech;
