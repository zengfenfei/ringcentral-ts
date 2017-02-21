import RestClient, { EventLoginStart, EventLoginError, EventLoginSuccess } from "./RestClient";
import { expect } from "chai";

let config = require('../config/test.json');

let client = new RestClient(config.app);

before(() => {
    return client.auth(config.user);
});

describe("Auth", () => {

    it("fail login, empty credential", () => {
        return client.auth({ username: "", password: "" }).then(() => {
            throw "Should not login";
        }, e => {
            expect(e.code).to.equal("invalid_request");
        });
    });

    it("fail login, wrong credential", () => {
        return client.auth({ username: "xxx", password: "xxx" }).then(() => {
            throw "Should not login";
        }, e => {
            expect(e.code).to.equal("invalid_grant");
        });
    });

    it("fail login, wrong appKey/appSecret", () => {
        let service2 = new RestClient({ appKey: "xx", appSecret: "xx" });
        return service2.auth(config.user).then(() => {
            throw "Should not login:";
        }, e => {
            expect(e.code).to.equal("invalid_client");
        });
    });

    let NotLoginError = "NotLogin";
    it("Call api before login", () => {
        return client.logout().then(() => {
            return client.get("/some-api");
        }).then(() => {
            throw new Error("Should not success.");
        }, e => {
            expect(e.name).to.eq(NotLoginError);
        });
    });

    it("Refresh token before login", () => {
        return client.logout().then(() => {
            return client.refreshToken();
        }).then(() => {
            throw new Error("Should not success.");
        }, e => {
            expect(e.name).to.eq(NotLoginError);
        });
    });

    it("login with right credential", () => {
        return client.auth(config.user).then(() => {
            let token = client.tokenStore.get();
            expect(token.expired()).to.be.false;
            expect(token.refreshTokenExpired()).to.be.false;
        });
    });

    /*it("Login will try to use cached token", () => {
        let cachedAccessToken;
        let service2 = new RestClient(.app);
        return service.login(authConfig.user).then(() => {
            cachedAccessToken = service.tokenStore.get().token.accessToken;
            return service2.login(authConfig.user);
        }).then(() => {
            let cur = service2.tokenStore.get().token.accessToken;
            expect(cachedAccessToken).to.eql(cur);
        });
    });*/

    it("Allow only one refresh token request at the same time", () => {
        return client.auth(config.user).then(() => {
            let p1 = client.refreshToken();
            let p2 = client.refreshToken();
            expect(p1).to.eq(p2);
        });
    });



    it("Logout expired accessToken.");

    it("Refresh Token", () => {
        return client.auth(config.user).then(() => client.refreshToken());
    });

    it("Refresh token with wrong info");

    it("Access token and refresh token should be invalid after logout", () => {
        return client.logout();
    });
});

describe("http methods", () => {
    it("list answering rules", () => {
        return client.put("/account/~/extension/~/answering-rule/36288004", {
            callers: [{
                "callerId": "8688888"
            }, {
                "callerId": "866666"
            }, {
                "callerId": "867777"
            }]

        }).then(res => res.json()).then(data => {
            console.log(data);
        }).catch(e => {
            console.error("@@@", e)
        });
    });
});