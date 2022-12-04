const Jwt_mngr = require("./jwt_mngr").JWT_token_manager;
const jwt = new Jwt_mngr();

const db = require("./db_mongo_manager").db;

async function tokenValidation (req : any, res : any, next : any) : Promise<void> {
    try {
        //token validation
        console.log('app.use-get(\'Authorization\'): ', req.get('Authorization'));
        if (req.get('Authorization')) {
            let accessToken : string = req.get('Authorization');
            let payload = JSON.parse(Buffer.from(accessToken.split(' ')[1].split('.')[1], 'base64url').toString('utf8'));
            console.log("Auth.js : payload.ID : ", payload.ID);
            let user = await db.Users.findById(payload.ID.toString());
            if(!user) {
                return next();
                };
            console.log("Auth.js : user : ", user);
            let keys = await db.Keys.findById(user.keys.toString());
            console.log("Auth.js : user : ", user, "; keys : ", keys);
            try {
                if(await jwt.tokenValidation(accessToken, keys.access_secret)) {
                    req.user = user.login;
                    console.log('app.use-req.user : ', req.user);
                    next();
                } else  {
                    console.log('Auth.js : refreshTokenValidation is starting!');
                    await refreshTokenValidation(req, res, next);
                    //next();
                }
            } catch {
                req.user = "";
                console.log('app.use- try catch block req.user: ', req.user);
                return next();
            }
        } else {
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
}

async function refreshTokenValidation (req : any, res : any, next : any) : Promise<void> {
    try {
        let accessToken : string = req.get('Authorization');
        let refreshToken : string = req.get('Refresh');
        let payload = JSON.parse(Buffer.from(accessToken.split(' ')[1].split('.')[1], 'base64url').toString('utf8'));
        let user = await db.Users.findById(payload.ID);
        let keys = await db.Keys.findById(user.keys.toString());
        console.log("Auth.js : refreshTokenValidation : keys.refresh_secret : ", keys.refresh_secret);
        if (await jwt.tokenValidation(refreshToken, keys.refresh_secret)) {
            let accessSecret : string = (await jwt.newSecret()).toString('base64url');
            let refreshSecret : string = (await jwt.newSecret()).toString('base64url');
            let newAccessToken = await jwt.accessTokenAsync(payload.ID, accessSecret, 1800);
            let newRefreshToken = await jwt.refreshTokenAsync(refreshSecret);
            await keys.updateOne({access_secret : accessSecret, refresh_secret : refreshSecret});
            req.user = user.login;
            res.set({
                "Authorization" : newAccessToken,
                "Refresh"       : newRefreshToken
            });
            return next();
        } else {
            req.user = "";
            return next();
        }
    } 
    catch {
        res.status(500).send('OOPS! Something went wrong! ()');
        res.end();
        return next();
    }
}

export {
    tokenValidation
}