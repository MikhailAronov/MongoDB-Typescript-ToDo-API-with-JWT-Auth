var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class JWT_token_manager {
    constructor() {
        this.crypt = require('crypto');
        this.jwt = require('jsonwebtoken');
    }
    accessTokenAsync(uniq_id, access_secret, expires = 1800) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('uniq_id: ', uniq_id);
            let accessToken = this.jwt.sign({ ID: uniq_id }, access_secret, { expiresIn: expires });
            /* console.log('Access secret ket: ', access_secret.toString('base64url'));
            console.log('Access token made by JWT module: ', accessToken);
            console.log('accessToken (jwt.sign) type of: ', typeof accessToken); */
            return 'Bearer ' + accessToken;
        });
    }
    refreshTokenAsync(refresh_secret) {
        return __awaiter(this, void 0, void 0, function* () {
            let refreshToken = this.jwt.sign({ hm: 'skibidi vapa dub' }, refresh_secret);
            /* console.log('Refresh secret ket: ', refresh_secret.toString('base64url'));
            console.log('Refresh token made by JWT module: ', refreshToken);
            console.log('refreshToken (jwt.sign) type of: ', typeof refreshToken); */
            return 'Bearer ' + refreshToken;
        });
    }
    tokenValidation(token, secret) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                token = token.split(' ')[1];
                console.log("jwt_mngr.ts : tokenValidation() : token /*after splitting*/", token);
                let payload = this.jwt.verify(token, secret);
                return true;
            }
            catch (err) {
                console.log('jwt_mngr : token invalid or error');
                return false;
            }
        });
    }
    newSecret() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.crypt.randomBytes(32);
        });
    }
}
module.exports = {
    JWT_token_manager
};
//# sourceMappingURL=jwt_mngr.js.map