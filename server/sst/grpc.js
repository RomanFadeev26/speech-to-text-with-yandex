const fs = require('fs');
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const nanoid = require('nanoid');
const { FOLDER_ID } = require('../auth/consts');

const RECOGNITION_CONFIG = {
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

class GrpcService {
    constructor({iamToken, pathToProto, pathToRootSert}) {
        this.sessionId = nanoid();
        this.token = iamToken;
        const packageDefinition = protoLoader.loadSync(pathToProto, {
            includeDirs: ['node_modules/google-proto-files', __dirname]
        });
        this.packageObject = grpc.loadPackageDefinition(packageDefinition);
        this.grpcCredentials = grpc.credentials.createSsl(fs.readFileSync(pathToRootSert));

        this.stream = null;
        this.sessionOpened = false;
        this.isStreaming = false;
    }

    createGRPCStream = () => {
        const serviceMetadata = new grpc.Metadata();
        serviceMetadata.add('authorization', `Bearer ${this.token}`);
        const serviceConstructor = this.packageObject.yandex.cloud.ai.stt.v2.SttService;
        const service = new serviceConstructor('stt.api.cloud.yandex.net:443', this.grpcCredentials);

        this.stream = service['StreamingRecognize'](serviceMetadata);
    };

    openSession = () => {
        console.log('start session', this.sessionId);
        this.sessionOpened = true;
        this.stream.write(RECOGNITION_CONFIG);
    };

    sendMessage = (message, callback) => {
        console.log('send message', this.sessionId);
        this.isStreaming = true;
        this.stream.write(message, () => {
            this.isStreaming = false;
            callback();
        });
    };

    closeSession = () => {
        console.log('close session', this.sessionId);
        this.sessionOpened = false;
        this.stream.end();
        this.stream = null;
    };

    addEventListener = (eventName, callback) => {
        this.stream.on(eventName, callback);
    };
}

module.exports = GrpcService;
