/* Generated code */
import BlockedNumberInfo from '../definitions/BlockedNumberInfo';
import PagingResult from '../PagingResult';
import PathSegment from '../PathSegment';

export default class BlockedNumber extends PathSegment {
    constructor(prv: PathSegment, id?: string, service?) {
        super('blocked-number', id, prv, service);
    }

    /**
     *  Add New Blocked Number
     */
    post(body: BlockedNumberInfo): Promise<BlockedNumberInfo> {
        return this.getRest().call(this.getEndpoint(true), undefined, {
            body: body,
            method: 'post'
        }).then<any>((res) => {
                return res.json();
        });
    }


    /**
     *  Get Blocked Number List
     */
    list(): Promise<PagingResult<BlockedNumberInfo>> {
        return this.getRest().call(this.getEndpoint(false), undefined, {
            body: undefined,
            method: 'get'
        }).then<any>((res) => {
                return res.json();
        });
    }


    /**
     *  Delete Blocked Number by ID
     */
    delete(): Promise<void> {
        return this.getRest().call(this.getEndpoint(true), undefined, {
            body: undefined,
            method: 'delete'
        }).then(res => {});
    }


    /**
     *  Get Blocked Number by ID
     */
    get(): Promise<BlockedNumberInfo> {
        return this.getRest().call(this.getEndpoint(true), undefined, {
            body: undefined,
            method: 'get'
        }).then<any>((res) => {
                return res.json();
        });
    }


    /**
     *  Update Blocked Number Label
     */
    put(body: BlockedNumberInfo): Promise<BlockedNumberInfo> {
        return this.getRest().call(this.getEndpoint(true), undefined, {
            body: body,
            method: 'put'
        }).then<any>((res) => {
                return res.json();
        });
    }

}
