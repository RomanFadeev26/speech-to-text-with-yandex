const fs = require('fs');
const path = require('path');
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const createIAMTokenFetcher = require('./iam-token');

const FREQUENCY = 250;
const CHUNK_SIZE = 4000;
const FOLDER_ID = 'b1g7fguhq2u0ackp3cnh';

const requestParams = {
    config: {
        specification: {
            languageCode: 'ru-RU',
            profanityFilter: false,
            model: 'general',
            partialResults: true,
            audioEncoding: 'OGG_OPUS'
        },
        folderId: FOLDER_ID
    }
};

const fetchIAMToken = createIAMTokenFetcher();

async function request({speech: audio}) {
console.log(audio);
    const iamToken = await fetchIAMToken();
    const serviceMetadata = new grpc.Metadata();
    serviceMetadata.add('authorization', `Bearer ${iamToken}`);
    const packageDefinition = protoLoader.loadSync(path.join(__dirname, './yandex/cloud/ai/stt/v2/stt_service.proto'),{
        includeDirs: ['node_modules/google-proto-files', __dirname]
    });

    const packageObject = grpc.loadPackageDefinition(packageDefinition);

    const serviceConstructor = packageObject.yandex.cloud.ai.stt.v2.SttService;
    const grpcCredentials = grpc.credentials.createSsl(fs.readFileSync(path.join(__dirname, './roots.pem')));
    const service = new serviceConstructor('stt.api.cloud.yandex.net:443', grpcCredentials);
    const call = service['StreamingRecognize'](serviceMetadata);

    call.write(requestParams);

    let i = 1;
    const interval = setInterval(() => {

        if (i * CHUNK_SIZE <= audio.length) {
            const chunk = audio.slice((i - 1) * CHUNK_SIZE, i * CHUNK_SIZE);
            call.write({audioContent: chunk});
            console.log('sended');
            i++;
        } else {
            console.log('end sending');
            call.end();
            clearInterval(interval);
        }
    }, FREQUENCY);

    call.on('data', (response) => {
        console.log('Start chunk: ');
        response.chunks[0].alternatives.forEach((alternative) => {
            console.log('alternative: ', alternative.text)
        });
        console.log('Is final: ', Boolean(response.chunks[0].final));
        console.log('');
    });
}

module.exports = request;
