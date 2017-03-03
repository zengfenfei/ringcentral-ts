/* Generated code */
import PathSegment from '../PathSegment';

export default class End extends PathSegment {
    constructor(prv: PathSegment, id?: string, service?) {
        super('end', id, prv, service);
    }

    /**
     *  End Current Meeting
     */
    post(): Promise<void> {
        return this.getRest().call(this.getEndpoint(true), undefined, {
            body: undefined,
            method: 'post'
        }).then(res => {});
    }

}
