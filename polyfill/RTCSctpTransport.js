// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export default class RTCSctpTransport extends EventTarget {
    constructor(init = {}) {
        super();
    }

    #maxChannels = null;

    get maxChannels() {
        return this.#maxChannels;
    }
    #maxMessageSize = null;

    get maxMessageSize() {
        return this.#maxMessageSize;
    }
    #state = null;

    get state() {
        return this.#state;
    }
    #transport = null;

    get transport() {
        return this.#transport;
    }

    onstatechange = noop;
}
