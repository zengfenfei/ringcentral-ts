/* Generated code */
import IServiceProviderConfig from '../definitions/ServiceProviderConfig';
import PathSegment from '../PathSegment';

export default class ServiceProviderConfig extends PathSegment {
	constructor(prv: PathSegment, id?: string, service?) {
		super('ServiceProviderConfig', id, prv, service);
	}

	/**
	 *  <p style='font-style:italic;'>Since 1.0.31 (Release 9.2)</p><p>Returns the list of users requested.</p><h4>Required Permissions</h4><table class='fullwidth'><thead><tr><th>Permission</th><th>Description</th></tr></thead><tbody><tr><td class='code'>ReadAccounts</td><td>Viewing Service Provider confiog</td></tr></tbody></table><h4>API Group</h4><p>Medium</p>
	 */
	get(): Promise<IServiceProviderConfig> {
		return this.getRest().call(this.getEndpoint(true), undefined, {
			body: undefined,
			method: 'get'
		}).then<any>((res) => {
				return res.json();
		});
	}

}
