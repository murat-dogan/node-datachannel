export default class DOMException {
    code: number;
    message: string;
    name: string;

    constructor(message?: string, name?: string);
}
