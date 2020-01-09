class GrpcControlller {
    constructor(grpcService, audioIterator) {
        this.grpcService = grpcService;
        this.audioIterator = audioIterator;
        this.isFinal = false;
        this.result = '';
    }

    setIsFinal = (value) => {
        this.isFinal = value;
    };

    setResult = (result) => {
        this.result = result;
    };

    init = () => {
        const { setIsFinal, grpcService, setResult } = this;
        grpcService.addEventListener('data', ({chunks: [{alternatives, final}]}) => {
            console.log('Start chunk: ');
            alternatives.forEach((alternative) => {
                console.log('alternative: ', alternative.text);
                setResult(alternative.text);
            });
            setIsFinal(Boolean(final));
            console.log('Is final: ', Boolean(final));
            console.log('');
        });

        grpcService.addEventListener('error', ({code, details}) => {
            if (details) {
                console.log(code, details);
            } else {
                console.log('error', code);
            }
        });
    };

    sendAudio = () => {
        const {isFinal, grpcService, audioIterator, result} = this;
        console.log('sendAudio', {isFinal}, 'isStreaming', this.grpcService.isStreaming);
        return new Promise(
            (resolve) => {

                if(isFinal) {
                    if(grpcService.sessionOpened) {
                        grpcService.closeSession();
                    }
                    resolve({ isFinal, result });
                }

                audioIterator.iterate(
                    (audioChunk) => {
                        if(!isFinal) {
                            grpcService.sendMessage({audioContent: audioChunk}, () => {
                                resolve({isFinal, result})
                            });
                        }
                    },
                    () => {
                        if(isFinal) {
                            grpcService.closeSession();
                        }
                        resolve({isFinal, result})
                    }
                );
            });
    };
}

module.exports = GrpcControlller;
