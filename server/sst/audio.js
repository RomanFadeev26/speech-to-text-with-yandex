class Audio {
    constructor() {
        this.queue = [];
    }

    addAudioToQueue = (audioBinary) => {
        if(audioBinary.length) {
            this.queue.push(audioBinary);
        }
    };

    getAudio = () => {
        const commonLength = this.queue.reduce((acc, buffer) => buffer.length + acc, 0);
        return Buffer.concat(this.queue, commonLength);
    };
}

module.exports = Audio;
