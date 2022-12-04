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
exports.router = void 0;
const express = require("express");
const bcrypt = require('bcrypt');
const jwt_mngr = require('./../managers/jwt_mngr').JWT_token_manager;
const jwt = new jwt_mngr();
const db = require('./../managers/db_mongo_manager').db;
const router = express.Router();
exports.router = router;
function authCheck(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.user === "") {
            console.log('f:authCheck in if(req.user === undefined) reached');
            res.status(401).send('You are not authorized!');
            res.end();
            return false;
        }
        return true;
    });
}
function shortDate(mesDate) {
    return __awaiter(this, void 0, void 0, function* () {
        return `${mesDate.getFullYear()}\.${mesDate.getMonth() + 1}\.${mesDate.getUTCDate()}  ${mesDate.getHours()}:${mesDate.getMinutes()}:${mesDate.getSeconds()}:${mesDate.getMilliseconds()} GMT ${mesDate.getTimezoneOffset() / (-60)}`;
    });
}
function userByToken(accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
        let payload = JSON.parse(Buffer.from(accessToken.split(' ')[1].split('.')[1], 'base64url').toString('utf8'));
        let user = yield db.Users.findById(payload.ID.toString());
        return user;
    });
}
function signupValidation(userCredentials) {
    return __awaiter(this, void 0, void 0, function* () {
        if ((yield db.Users.find({ login: userCredentials.login }))[0]) {
            return 'loginAlreadyExists';
        }
        if ((yield db.Users.find({ email: userCredentials.email }))[0] && userCredentials.email) {
            return 'emailAlreadyExists';
        }
    });
}
router.use(express.urlencoded({ extended: true }));
router.use(express.json());
router.get('/me', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if ((yield authCheck(req, res, next)) === false)
            return next();
        let user = yield userByToken(req.get('Authorization'));
        res.status(200).send(JSON.stringify({
            login: user.login,
            email: user.email,
            SignUpAt: user.SignUpAt,
            id: user._id.toString()
        }));
        res.end();
    }
    catch (e) {
        console.log("ERR! : Error message : ", e.message);
        res.status(500).send('Server internal error');
        res.end();
        return next();
    }
}));
router.get('/readToDos', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if ((yield authCheck(req, res, next)) === false)
            return next();
        let limit, skip, sort;
        if (req.query.pagesize && req.query.page) {
            limit = req.query.pagesize;
            skip = (req.query.page - 1) * limit;
        }
        if (req.query.sort) {
            sort = req.query.sort;
        }
        else {
            sort = "name";
        }
        let filters = {};
        filters = req.body;
        filters['author'] = (yield userByToken(req.get('Authorization')))._id.toString();
        console.log("router.get \'/readToDos\' : filters : ", filters);
        let todos = yield db.ToDo.find(filters).select('name createdAt updatedAt').sort(sort).skip(skip).limit(limit);
        res.status(200).send(JSON.stringify({
            todos: todos
        }));
        res.end();
        return next();
    }
    catch (e) {
        console.log("ERR! : Error message : ", e.message);
        res.status(500).send('Server internal error');
        res.end();
        return next();
    }
}));
router.post('/createToDos', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if ((yield authCheck(req, res, next)) === false)
            return next();
        //let todos = [];
        let user = yield userByToken(req.get('Authorization'));
        let todos = req.body.todos;
        console.log('ToDoRoutes.ts : router.post(\'/createToDos\' : todos : ', todos);
        let createdTodos = [];
        for (let todo of todos) {
            let createdToDo = yield db.ToDo.create({
                author: user._id.toString(),
                name: todo.name,
                createdAt: yield shortDate(new Date())
            });
            createdTodos.push(createdToDo);
        }
        ;
        console.log('createdTodos : ', createdTodos);
        res.status(200).send(JSON.stringify({
            todos: createdTodos
        }));
        res.end();
        return next();
    }
    catch (e) {
        console.log("ERR! : Error message : ", e.message);
        res.status(500).send('Server internal error');
        res.end();
        return next();
    }
}));
router.put('/updateToDos', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if ((yield authCheck(req, res, next)) === false)
            return next();
        let todos = req.body.todos;
        console.log('ToDoRoutes.ts : router.post(\'/updateToDos\' : todos : ', todos);
        let todosUpdateQuery = [];
        for (let todo of todos) {
            todosUpdateQuery.push({ updateOne: {
                    "filter": { _id: todo._id.toString() },
                    "update": { name: todo.name, updatedAt: yield shortDate(new Date()) },
                    "options": { "upsert": true }
                } });
        }
        res.status(200).send('ToDosUpdated');
        res.end();
        return next();
    }
    catch (e) {
        console.log("ERR! : Error message : ", e.message);
        res.status(500).send('Server internal error');
        res.end();
        return next();
    }
}));
router.delete('/deleteToDos', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if ((yield authCheck(req, res, next)) === false)
            return next();
        let todos = req.body.todos;
        console.log('ToDoRoutes.ts : router.post(\'/deleteToDos\' : todos : ', todos);
        let todoIds = [];
        todos.forEach((e) => {
            todoIds.push(e._id.toString());
        });
        yield db.ToDo.deleteMany({ _id: { "$in": todoIds } });
        res.status(200).send('TodosDeleted');
        res.end();
        return next();
    }
    catch (e) {
        console.log("ERR! : Error message : ", e.message);
        res.status(500).send('Server internal error');
        res.end();
        return next();
    }
}));
router.post('/signup', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userCredentials = req.body;
        if (userCredentials.password === undefined || userCredentials.password === undefined) {
            res.status(400).send('No user data!');
            res.end();
            return next();
        }
        switch (yield signupValidation(userCredentials)) {
            case ('loginAlreadyExists'):
                res.status(400).send('loginAlreadyExists');
                res.end();
                return next();
                break;
            case ('emailAlreadyExists'):
                res.status(400).send('emailAlreadyExists');
                res.end();
                return next();
                break;
        }
        let salt = yield bcrypt.genSalt(10);
        let hashedPassword = yield bcrypt.hash(userCredentials.password, salt);
        let user = new db.Users({
            login: userCredentials.login,
            password: hashedPassword,
            SignUpAt: yield shortDate(new Date)
        });
        if (userCredentials.email) {
            user.email = userCredentials.email;
        }
        let accessSecret = (yield jwt.newSecret()).toString('base64url');
        let refreshSecret = (yield jwt.newSecret()).toString('base64url');
        let accessToken = yield jwt.accessTokenAsync(user._id.toString(), accessSecret, 1800);
        let refreshToken = yield jwt.refreshTokenAsync(refreshSecret);
        let keys = yield db.Keys.create({
            access_secret: accessSecret,
            refresh_secret: refreshSecret
        });
        user.keys = keys._id.toString();
        user.save();
        res.set({
            "Authorization": accessToken,
            "Refresh": refreshToken
        });
        res.status(200);
        res.end();
    }
    catch (e) {
        console.log("ERR! : Error message : ", e.message);
        res.status(500).send('Server internal error');
        res.end();
        return next();
    }
}));
router.post('/login', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userCredentials = req.body;
        if (!userCredentials.login || !userCredentials.password) {
            res.status(400).send('No user data!');
            res.end();
            return next();
        }
        let user = (yield db.Users.find({ login: userCredentials.login }))[0];
        if (!user) {
            res.status(402).send('wrongLogin');
            res.end();
            return next();
        }
        if (yield bcrypt.compare(userCredentials.password, user.password)) {
            let accessSecret = (yield jwt.newSecret()).toString('base64url');
            let refreshSecret = (yield jwt.newSecret()).toString('base64url');
            let newAccessToken = yield jwt.accessTokenAsync(user._id.toString(), accessSecret, 1800);
            let newRefreshToken = yield jwt.refreshTokenAsync(refreshSecret);
            yield db.Keys.updateOne({ _id: user.keys }, { access_secret: accessSecret, refresh_secret: refreshSecret });
            res.set({
                "Authorization": newAccessToken,
                "Refresh": newRefreshToken
            });
            res.status(200).send('You are logged in!');
            res.end();
        }
        else {
            res.status(403).send('wrongPassword');
            res.end();
            return next();
        }
    }
    catch (e) {
        console.log("ERR! : Error message : ", e.message);
        res.status(500).send('Server internal error');
        res.end();
        return next();
    }
}));
router.get('/logout', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if ((yield authCheck(req, res, next)) === false)
            return next();
        res.send('killAuthHeaders');
        res.end();
        return next();
    }
    catch (e) {
        console.log("ERR! : Error message : ", e.message);
        res.status(500).send('Server internal error');
        res.end();
        return next();
    }
}));
//# sourceMappingURL=ToDoRoutes.js.map