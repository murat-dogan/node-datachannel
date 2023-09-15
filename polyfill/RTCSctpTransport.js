export default class _RTCSctpTransport extends EventTarget {
    #maxChannels = null;
    #maxMessageSize = null;
    #state = null;
    #transport = null;

    onstatechange = createEmptyFunction();

    constructor(init = {}) {
        super();
    }

    get maxChannels() {
        return this.#maxChannels;
    }

    get maxMessageSize() {
        return this.#maxMessageSize;
    }

    get state() {
        return this.#state;
    }

    get transport() {
        return this.#transport;
    }
}

function createEmptyFunction() {
    return () => {
        /** */
    };
}
