export const InvalidStateError = (msg) => {
    return new DOMException(msg, 'InvalidStateError');
};
