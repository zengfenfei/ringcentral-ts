/* Generated code */
import LanguageInfo from '../definitions/LanguageInfo';
import PagingResult from '../PagingResult';
import PathSegment from '../PathSegment';

export default class Language extends PathSegment {
    constructor(prv: PathSegment, id?: string, service?) {
        super('language', id, prv, service);
    }

    /**
     *  Get Supported Language List
     */
    list(): Promise<PagingResult<LanguageInfo>> {
        return this.getRest().call(this.getEndpoint(false), undefined, {
            body: undefined,
            method: 'get'
        }).then<any>((res) => {
                return res.json();
        });
    }


    /**
     *  Get Language by ID
     */
    get(): Promise<LanguageInfo> {
        return this.getRest().call(this.getEndpoint(true), undefined, {
            body: undefined,
            method: 'get'
        }).then<any>((res) => {
                return res.json();
        });
    }

}
