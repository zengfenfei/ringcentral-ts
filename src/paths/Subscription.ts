/* Generated code */
import SubscriptionInfo from '../definitions/SubscriptionInfo';
import SubscriptionRequestDeliveryMode from '../definitions/SubscriptionRequestDeliveryMode';
import PagingResult from '../PagingResult';
import PathSegment from '../PathSegment';

export default class Subscription extends PathSegment {
    constructor(prv: PathSegment, id?: string, service?) {
        super('subscription', id, prv, service);
    }

    /**
     *  Create New Subscription
     */
    post(body: PostBody): Promise<SubscriptionInfo> {
        return this.getRest().call(this.getEndpoint(true), undefined, {
            body: body,
            method: 'post'
        }).then<any>((res) => {
                return res.json();
        });
    }


    /**
     *  Get Subscription List
     */
    list(): Promise<PagingResult<SubscriptionInfo>> {
        return this.getRest().call(this.getEndpoint(false), undefined, {
            body: undefined,
            method: 'get'
        }).then<any>((res) => {
                return res.json();
        });
    }


    /**
     *  Cancel Subscription by ID
     */
    delete(): Promise<void> {
        return this.getRest().call(this.getEndpoint(true), undefined, {
            body: undefined,
            method: 'delete'
        }).then(res => {});
    }


    /**
     *  Get Subscription by ID
     */
    get(): Promise<SubscriptionInfo> {
        return this.getRest().call(this.getEndpoint(true), undefined, {
            body: undefined,
            method: 'get'
        }).then<any>((res) => {
                return res.json();
        });
    }


    /**
     *  Update/Renew Subscription by ID
     */
    put(body: PutBody): Promise<SubscriptionInfo> {
        return this.getRest().call(this.getEndpoint(true), undefined, {
            body: body,
            method: 'put'
        }).then<any>((res) => {
                return res.json();
        });
    }

}

export interface PostBody {

    /**
     * Mandatory. Collection of URIs to API resources (see Event Types for details). For APNS transport type only message event filter is available
     */
    eventFilters?: string[];

    /**
     * Notification delivery settings
     */
    deliveryMode?: SubscriptionRequestDeliveryMode;
}

export interface PutBody {

    /**
     * Collection of URIs to API resources (see Event Types). Mandatory field
     */
    eventFilters?: string[];
}
