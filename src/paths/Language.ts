/* Generated code */
import LanguageInfo from '../definitions/LanguageInfo';
import PathSegment from '../PathSegment';

export default class Language extends PathSegment {
	constructor(prv: PathSegment, id?: string, service?) {
		super('language', id, prv, service);
	}

	/**
	 *  <p style='font-style:italic;'>Since 1.0.14 (Release 6.6)</p><p>Returns the information about supported languages.</p><h4>Usage Plan Group</h4><p>Light</p>
	 */
	list(): Promise<LanguageList> {
		return this.getRest().call(this.getEndpoint(false), undefined, {
			body: undefined,
			method: 'get'
		}).then<any>((res) => {
				return res.json();
		});
	}


	/**
	 *  <p style='font-style:italic;'>Since 1.0.14 (Release 6.6)</p><p>Returns language by its respective ID.</p><h4>Usage Plan Group</h4><p>Light</p>
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
