/// <reference lib="dom" />

export class InvalidStateError extends DOMException {
    constructor(msg: string) {
        super(msg, 'InvalidStateError');
    }
};

export class TypeError extends DOMException {
    constructor(msg: string) {
        super(msg, 'TypeError');
    }
};

export class OperationError extends DOMException {
    constructor(msg: string) {
        super(msg, 'OperationError');
    }
};

export class NotFoundError extends DOMException {
    constructor(msg: string) {
        super(msg, 'NotFoundError');
    }
};

export class InvalidAccessError extends DOMException {
    constructor(msg: string) {
        super(msg, 'InvalidAccessError');
    }
};

export class SyntaxError extends DOMException {
    constructor(msg: string) {
        super(msg, 'SyntaxError');
    }
};
