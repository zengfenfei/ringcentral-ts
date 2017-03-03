import RestClient from './RestClient';

/**
 * UrlParts
 */
export default class UrlSection {
    private name: string;
    private value: string;
    private previous: UrlSection;
    private rest: RestClient;
    constructor(name: string, value?: string, prv?: UrlSection, service?: RestClient) {
        this.rest = service;
        this.name = name;
        this.value = value || null;
        this.previous = prv;
    }

    toString(withValue = true): string {
        let str = '/' + this.name;
        if (withValue && this.value) {
            str += '/' + this.value;
        }
        return str;
    }

    getEndpoint(withValue = true): string {
        let end: string = '';
        if (this.previous) {
            end = this.previous.getEndpoint();
        }
        return end + this.toString(withValue);
    }

    protected getRest() {
        let sec: UrlSection = this;
        while (sec) {
            if (sec.rest) {
                return sec.rest;
            }
            if (sec.previous) {
                sec = sec.previous;
            }
        }
    }
}