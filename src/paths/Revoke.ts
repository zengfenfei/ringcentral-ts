/* Generated code */
import PathSegment from '../PathSegment';

export default class Revoke extends PathSegment {
    constructor(prv: PathSegment, id?: string, service?) {
        super('revoke', id, prv, service);
    }

    /**
     *  OAuth2 Revoke Token
     */
    post(body: PostBody): Promise<void> {
        return this.getRest().call(this.getEndpoint(true), undefined, {
            body: body,
            method: 'post'
        }).then(res => {});
    }

}

export interface PostBody {

    /**
     * Active access or refresh token to be revoked
     */
    token?: string;
}
