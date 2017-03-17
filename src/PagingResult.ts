import NavigationInfo from './definitions/NavigationInfo';
import PagingInfo from './definitions/PagingInfo';

/**
 * PagingResult
 */
export default class PagingResult<T> {
	constructor(data) {
		this.records = data['records'];
		this.navigation = data['navigation'];
		this.paging = data['paging'];
	}

    /**
     * List of real results
     */
	records: T[];

	navigation: NavigationInfo;

	paging: PagingInfo;
}
