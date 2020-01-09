const path = require('path');
const { fetchIamToken } = require('../auth/iam-token');
const Grpc = require('./grpc');
const GrpcController = require('./grpcControlller');
const Audio = require('./audio');
const AudioIterator = require('./audioIterator');

let audio = new Audio();
let audioIterator = new AudioIterator(audio);

let grpc = null;
let grpcController = null;

function cleanAll() {
    grpc = null;
    grpcController = null;
    audio = new Audio();
    audioIterator = new AudioIterator(audio);
}

async function plugin(audioBinary) {
    audio.addAudioToQueue(audioBinary);
    const iamToken = await fetchIamToken();
    if(!grpc) {
        grpc = new Grpc({
            iamToken,
            pathToRootSert: path.join(__dirname, './roots.pem'),
            pathToProto: path.join(__dirname, './stt_service.proto')
        });
        grpc.createGRPCStream();
        grpc.openSession();
        grpcController = new GrpcController(grpc, audioIterator);
        grpcController.init();
    }

    const answer = await grpcController.sendAudio();
    console.log('session opened', grpc.sessionOpened);
    if(!grpc.sessionOpened) {
        console.log(answer);
        console.log('------------------------------/--------------------------------------/---------------------------');
        cleanAll();
    }
    return answer;
}

module.exports = plugin;
