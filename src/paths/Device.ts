/* Generated code */
import DeviceInfo from '../definitions/DeviceInfo';
import PagingResult from '../PagingResult';
import PathSegment from '../PathSegment';

export default class Device extends PathSegment {
    constructor(prv: PathSegment, id?: string, service?) {
        super('device', id, prv, service);
    }

    /**
     *  Get Account Device List
     */
    list(): Promise<PagingResult<DeviceInfo>> {
        return this.getRest().call(this.getEndpoint(false), undefined, {
            body: undefined,
            method: 'get'
        }).then<any>((res) => {
                return res.json();
        });
    }


    /**
     *  Get Device by ID
     */
    get(): Promise<DeviceInfo> {
        return this.getRest().call(this.getEndpoint(true), undefined, {
            body: undefined,
            method: 'get'
        }).then<any>((res) => {
                return res.json();
        });
    }

}
