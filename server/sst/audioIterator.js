const CHUNK_SIZE = 4000;

class AudioIterator {
    constructor(audio) {
        this.audio = audio;
        this.pointer = 0;
    }

    iterate = (iterateCallback, endCallback) => {
        const {audio} = this;

        if (this.pointer + CHUNK_SIZE <= audio.getAudio().length) {
            const chunk = new Uint16Array(audio.getAudio().slice(this.pointer, this.pointer + CHUNK_SIZE));
            const chunkBuffer = Buffer.from(chunk);
            iterateCallback(chunkBuffer);
            this.pointer = this.pointer + CHUNK_SIZE;
        } else {
            endCallback()
        }
    }
}

module.exports = AudioIterator;
