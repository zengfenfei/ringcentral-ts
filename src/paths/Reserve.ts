/* Generated code */
import ReservePhoneNumberRequestReserveRecord from '../definitions/ReservePhoneNumberRequestReserveRecord';
import ReservePhoneNumberResponseReserveRecord from '../definitions/ReservePhoneNumberResponseReserveRecord';
import PathSegment from '../PathSegment';

export default class Reserve extends PathSegment {
    constructor(prv: PathSegment, id?: string, service?) {
        super('reserve', id, prv, service);
    }

    /**
     *  Reserve Phone Number
     */
    post(body: PostBody): Promise<PostResponse> {
        return this.getRest().call(this.getEndpoint(true), undefined, {
            body: body,
            method: 'post'
        }).then<any>((res) => {
                return res.json();
        });
    }

}

export interface PostBody {

    /**
     * Phone numbers to be reserved/un-reserved
     */
    records?: ReservePhoneNumberRequestReserveRecord[];
}

export interface PostResponse {

    /**
     * Phone numbers to be reserved/un-reserved
     */
    records?: ReservePhoneNumberResponseReserveRecord[];
}
