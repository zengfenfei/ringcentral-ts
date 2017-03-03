/* Generated code */
import PathSegment from '../PathSegment';

export default class Content extends PathSegment {
    constructor(prv: PathSegment, id?: string, service?) {
        super('content', id, prv, service);
    }

    /**
     *  Get Message Attachment
     */
    get(): Promise<any> {
        return this.getRest().call(this.getEndpoint(true), undefined, {
            body: undefined,
            method: 'get'
        });
    }

}
