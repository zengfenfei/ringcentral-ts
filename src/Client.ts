import Service, { SERVER_PRODUCTION, SERVER_SANDBOX, SERVER_VERSION, ServiceOptions } from './RestClient';
import { MemoryTokenStore } from './Token';

export default class Client {
    service: Service;

    constructor(opts: ServiceOptions) {
        this.service = new Service(opts);
    }

    /** Ttl: time to live in seconds. */
    login(opts: {
        /** Phone number linked to account or extension in account in E.164 format with or without leading '+' sign */
        username: string;
        password: string;
        /** Extension short number. If company number is specified as a username, and extension is not specified, the server will attempt to authenticate client as main company administrator */
        extension?: string;
        /** Access token lifetime in seconds; the possible values are from 600 sec (10 min) to 3600 sec (1 hour). The default value is 3600 sec. If the value specified exceeds the default one, the default value is set. If the value specified is less than 600 seconds, the minimum value (600 sec) is set */
        accessTokenTtl?: number;
        /** Refresh token lifetime in seconds. The default value depends on the client application, but as usual it equals to 7 days. If the value specified exceeds the default one, the default value is applied. If client specifies refresh_token_ttl<=0, refresh token is not returned even if the corresponding grant type is supported */
        refreshTokenTtl?: number;
        /** List of API permissions to be used with access token (see [Application Permissions](https://developer.ringcentral.com/api-docs/latest/APIPermissions.html)). Can be omitted when requesting all permissions defined during the application registration phase */
        scope?: string[]
    }): Promise<void> {
        return this.service.auth(opts);
    }

    logout(): Promise<void> {
        return this.service.logout();
    }
    /*
        account(id?: string): Account {
            return new Account(null, id, this.service);
        }

        clientInfo(): ClientInfo {
            return new ClientInfo(null, null, this.service);
        }

        numberPool(): NumberPool {
            return new NumberPool(null, null, this.service);
        }
    */
}

export {
    Client, // For commonjs
    MemoryTokenStore,
    SERVER_PRODUCTION,
    SERVER_SANDBOX,
    SERVER_VERSION
};