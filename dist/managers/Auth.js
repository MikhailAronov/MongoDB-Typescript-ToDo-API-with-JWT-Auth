"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenValidation = void 0;
const Jwt_mngr = require("./jwt_mngr").JWT_token_manager;
const jwt = new Jwt_mngr();
const db = require("./db_mongo_manager").db;
function tokenValidation(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //token validation
            console.log('app.use-get(\'Authorization\'): ', req.get('Authorization'));
            if (req.get('Authorization')) {
                let accessToken = req.get('Authorization');
                let payload = JSON.parse(Buffer.from(accessToken.split(' ')[1].split('.')[1], 'base64url').toString('utf8'));
                console.log("Auth.js : payload.ID : ", payload.ID);
                let user = yield db.Users.findById(payload.ID.toString());
                if (!user) {
                    return next();
                }
                ;
                console.log("Auth.js : user : ", user);
                let keys = yield db.Keys.findById(user.keys.toString());
                console.log("Auth.js : user : ", user, "; keys : ", keys);
                try {
                    if (yield jwt.tokenValidation(accessToken, keys.access_secret)) {
                        req.user = user.login;
                        console.log('app.use-req.user : ', req.user);
                        next();
                    }
                    else {
                        console.log('Auth.js : refreshTokenValidation is starting!');
                        yield refreshTokenValidation(req, res, next);
                        //next();
                    }
                }
                catch (_a) {
                    req.user = "";
                    console.log('app.use- try catch block req.user: ', req.user);
                    return next();
                }
            }
            else {
                req.user = "";
                return next();
            }
        }
        catch (e) {
            console.log("Error! Err message : ", e.message);
            res.status(500).send('OOPS! Something went wrong!');
            res.end();
            return next();
        }
    });
}
exports.tokenValidation = tokenValidation;
function refreshTokenValidation(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let accessToken = req.get('Authorization');
            let refreshToken = req.get('Refresh');
            let payload = JSON.parse(Buffer.from(accessToken.split(' ')[1].split('.')[1], 'base64url').toString('utf8'));
            let user = yield db.Users.findById(payload.ID);
            let keys = yield db.Keys.findById(user.keys.toString());
            console.log("Auth.js : refreshTokenValidation : keys.refresh_secret : ", keys.refresh_secret);
            if (yield jwt.tokenValidation(refreshToken, keys.refresh_secret)) {
                let accessSecret = (yield jwt.newSecret()).toString('base64url');
                let refreshSecret = (yield jwt.newSecret()).toString('base64url');
                let newAccessToken = yield jwt.accessTokenAsync(payload.ID, accessSecret, 1800);
                let newRefreshToken = yield jwt.refreshTokenAsync(refreshSecret);
                yield keys.updateOne({ access_secret: accessSecret, refresh_secret: refreshSecret });
                req.user = user.login;
                res.set({
                    "Authorization": newAccessToken,
                    "Refresh": newRefreshToken
                });
                return next();
            }
            else {
                req.user = "";
                return next();
            }
        }
        catch (_a) {
            res.status(500).send('OOPS! Something went wrong! ()');
            res.end();
            return next();
        }
    });
}
//# sourceMappingURL=Auth.js.map