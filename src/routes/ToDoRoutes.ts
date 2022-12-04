const express = require("express");
const bcrypt = require('bcrypt');

const jwt_mngr = require('./../managers/jwt_mngr').JWT_token_manager;
const jwt = new jwt_mngr();

const db = require('./../managers/db_mongo_manager').db;

const router = express.Router();

async function authCheck (req : any, res : any, next : any) : Promise<boolean> {
    if(req.user === "") {
        console.log('f:authCheck in if(req.user === undefined) reached');
        res.status(401).send('You are not authorized!');
        res.end();
        return false;
    }
    return true;
}

async function shortDate(mesDate : any)  : Promise<string> {
    return `${mesDate.getFullYear()}\.${mesDate.getMonth() + 1}\.${mesDate.getUTCDate()}  ${mesDate.getHours()}:${mesDate.getMinutes()}:${mesDate.getSeconds()}:${mesDate.getMilliseconds()} GMT ${mesDate.getTimezoneOffset()/(-60)}`;
}

async function userByToken(accessToken : any) : Promise<any> {
        let payload = JSON.parse(Buffer.from(accessToken.split(' ')[1].split('.')[1], 'base64url').toString('utf8'));
        let user = await db.Users.findById(payload.ID.toString());
        return user;
}

async function signupValidation(userCredentials : any) : Promise<string | void> {
    if((await db.Users.find({ login : userCredentials.login}))[0]) {
        return 'loginAlreadyExists';
    } 
    if((await db.Users.find({ email : userCredentials.email}))[0] && userCredentials.email) {
        return 'emailAlreadyExists';
    }
}

router.use(express.urlencoded({ extended : true }));
router.use(express.json());

router.get('/me', async (req : any, res : any, next : any) => {
    try {
        if(await authCheck(req, res, next) === false) return next();
        let user = await userByToken(req.get('Authorization'));
        res.status(200).send(JSON.stringify({
            login    : user.login,
            email    : user.email,
            SignUpAt : user.SignUpAt,
            id       : user._id.toString() 
        }));
        res.end();
    } catch(e) {
        console.log("ERR! : Error message : ", e.message);
        res.status(500).send('Server internal error');
        res.end();
        return next();
    }
});
router.get('/readToDos', async (req : any, res : any, next : any) => {
    try {
        if(await authCheck(req, res, next) === false) return next();
        let limit : number, skip : number, sort : string;
        if(req.query.pagesize && req.query.page) {
            limit = req.query.pagesize;
            skip = (req.query.page - 1) * limit;
        } 
        if(req.query.sort) {
            sort = req.query.sort;
        } else {
            sort = "name"
        }
        let filters : any = {};
        filters = req.body;
        filters['author'] =  (await userByToken(req.get('Authorization')))._id.toString();
        console.log("router.get \'/readToDos\' : filters : ", filters);
        let todos = await db.ToDo.find(filters).select('name createdAt updatedAt').sort(sort).skip(skip).limit(limit);
        res.status(200).send(JSON.stringify({
            todos : todos
        }));
        res.end();
        return next();
    } catch(e) {
        console.log("ERR! : Error message : ", e.message);
        res.status(500).send('Server internal error');
        res.end();
        return next();
        
    }
});
router.post('/createToDos', async (req : any, res : any, next : any) => {
    try {
        if(await authCheck(req, res, next) === false) return next();
        //let todos = [];
        let user = await userByToken(req.get('Authorization'));
        let todos : Array<{
            name : string
        }> = req.body.todos;
        console.log('ToDoRoutes.ts : router.post(\'/createToDos\' : todos : ', todos);
        let createdTodos = [];
        for(let todo of todos) {
            let createdToDo = await db.ToDo.create({
                author    : user._id.toString(),
                name      : todo.name,
                createdAt : await shortDate(new Date())
            });
            createdTodos.push(createdToDo);
        };

        console.log('createdTodos : ', createdTodos);
        res.status(200).send(JSON.stringify({
            todos : createdTodos
        }));
        res.end();
        return next();    
    } catch(e) {
        console.log("ERR! : Error message : ", e.message);
        res.status(500).send('Server internal error');
        res.end();
        return next();
        
    }
});
router.put('/updateToDos', async (req : any, res : any, next : any) => {
    try {
        if(await authCheck(req, res, next) === false) return next();
        let todos : Array<{
            _id      : any,
            name     : string
        }> = req.body.todos;
        console.log('ToDoRoutes.ts : router.post(\'/updateToDos\' : todos : ', todos);
        let todosUpdateQuery = [];
        for(let todo of todos) {
            todosUpdateQuery.push({updateOne : {
                "filter" : {_id : todo._id.toString()},
                "update" : {name : todo.name, updatedAt : await shortDate(new Date())},
                "options" : {"upsert" : true}
            }});
        }

        res.status(200).send('ToDosUpdated');
        res.end();
        return next();
    } catch(e) {
        console.log("ERR! : Error message : ", e.message);
        res.status(500).send('Server internal error');
        res.end();
        return next();
        
    }

});
router.delete('/deleteToDos', async (req : any, res : any, next : any) => {
    try {
        if(await authCheck(req, res, next) === false) return next();
        let todos : Array<{
            _id : any
        }> = req.body.todos;
        console.log('ToDoRoutes.ts : router.post(\'/deleteToDos\' : todos : ', todos);
        let todoIds = [];
        todos.forEach((e) => {
            todoIds.push(e._id.toString());
        })
        await db.ToDo.deleteMany({_id : {"$in" : todoIds}});
        res.status(200).send('TodosDeleted');
        res.end();
        return next();
    } catch(e) {
        console.log("ERR! : Error message : ", e.message);
        res.status(500).send('Server internal error');
        res.end();
        return next();
        
    }
});
router.post('/signup', async (req : any, res : any, next : any) => {
    try {
        let userCredentials : { login : string, email : string, password : string} = req.body;
        if(userCredentials.password === undefined || userCredentials.password === undefined) {
            res.status(400).send('No user data!');
            res.end();
            return next();
        }
        switch(await signupValidation(userCredentials)) {
            case('loginAlreadyExists') : 
                res.status(400).send('loginAlreadyExists');
                res.end();
                return next();
                break;
            case('emailAlreadyExists') :
                res.status(400).send('emailAlreadyExists');
                res.end();
                return next();
                break;
        }
        let salt = await bcrypt.genSalt(10);
        let hashedPassword = await bcrypt.hash(userCredentials.password, salt);
        let user = new db.Users ({
            login     : userCredentials.login,
            password  : hashedPassword,
            SignUpAt  : await shortDate(new Date)
        });
        if(userCredentials.email) {
            user.email = userCredentials.email
        }
        let accessSecret : string = (await jwt.newSecret()).toString('base64url');
        let refreshSecret : string = (await jwt.newSecret()).toString('base64url');
        let accessToken : string = await jwt.accessTokenAsync(user._id.toString(), accessSecret, 1800);
        let refreshToken : string = await jwt.refreshTokenAsync(refreshSecret);
        let keys = await db.Keys.create({
            access_secret : accessSecret,
            refresh_secret : refreshSecret
        });
        user.keys = keys._id.toString();
        user.save();
        res.set({
            "Authorization" : accessToken,
            "Refresh" : refreshToken
        });
        res.status(200);
        res.end();
    } catch(e) {
        console.log("ERR! : Error message : ", e.message);
        res.status(500).send('Server internal error');
        res.end();
        return next();
        
    }
});
router.post('/login', async (req : any, res : any, next : any) => {
    try {
        let userCredentials : { login : string, password : string} = req.body;
        if(!userCredentials.login || !userCredentials.password) {
            res.status(400).send('No user data!');
            res.end();
            return next();
        }
        let user = (await db.Users.find({login : userCredentials.login}))[0];
        if(!user) {
            res.status(402).send('wrongLogin');
            res.end();
            return next();
        }
        if(await bcrypt.compare(userCredentials.password, user.password)) {
            let accessSecret = (await jwt.newSecret()).toString('base64url');
            let refreshSecret = (await jwt.newSecret()).toString('base64url');
            let newAccessToken = await jwt.accessTokenAsync(user._id.toString(), accessSecret, 1800);
            let newRefreshToken = await jwt.refreshTokenAsync(refreshSecret);
            await db.Keys.updateOne({_id : user.keys}, {access_secret : accessSecret, refresh_secret : refreshSecret});
            res.set({
                "Authorization" : newAccessToken,
                "Refresh" : newRefreshToken
            });
            res.status(200).send('You are logged in!');
            res.end();
        } else {
            res.status(403).send('wrongPassword');
            res.end();
            return next();
        }
    } catch(e) {
        console.log("ERR! : Error message : ", e.message);
        res.status(500).send('Server internal error');
        res.end();
        return next();
        
    }

});
router.get('/logout', async (req : any, res : any, next : any) => {
    try {
        if(await authCheck(req, res, next) === false) return next();
        res.send('killAuthHeaders');
        res.end();
        return next();
    } catch(e) {
        console.log("ERR! : Error message : ", e.message);
        res.status(500).send('Server internal error');
        res.end();
        return next();
        
    }
});


export {
    router
};