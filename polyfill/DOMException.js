export default class DOMException extends Error {
    constructor(message, name) {
        super(message);
        this.name = name || 'DOMException';
        this.message = message || 'DOMException';
    }
}
