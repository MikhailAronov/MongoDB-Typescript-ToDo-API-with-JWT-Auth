var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const mongoose = require('mongoose');
function testDataBAZAandQueries(db) {
    return __awaiter(this, void 0, void 0, function* () {
        //await createUsers(db);
        //await createToDos(db);
        /* console.log("await db.Users.find({}) : ", await db.Users.find({}));
        console.log("(await db.Users.find({}).select(\"_id\")))[0]._id.toString() : ", (await db.Users.find({}).select("_id"))[0]._id.toString());
        console.log("await db.Users.find({}).select(\"_id\")).lean() : ", await db.Users.find({}).select("_id").lean());
        console.log("await db.ToDo.find({}) : ", await db.ToDo.find({}));
        console.log("await db.ToDo.find({author : \"(await db.Users.find({}).select(\"_id\"))[0]._id.toString()\"}) : ", await db.ToDo.find({author : (await db.Users.find({}).select("_id"))[0]._id.toString()}));
        console.log("await db.Users.findById((await db.ToDo.find({name : \"Fuck my ass hard please\"}))[0].author) : ", await db.Users.findById((await db.ToDo.find({name : "Fuck my ass hard please"}))[0].author));
         */
        //console.log("await db.ToDo.updateMany({_id : {\"$in\" : [\"637e8528966d6ad1509e26ff\", \"637e8528966d6ad1509e2700\", '637e7caebd850b5b669adc94', '637e7caebd850b5b669adc94']}}, {\"$set\" : {name : 'WEAREALLUPDATED'}})", await db.ToDo.updateMany({_id : {"$in" : ["637e8528966d6ad1509e26ff", "637e8528966d6ad1509e2700", "637e8528966d6ad1509e2701", "637e8528966d6ad1509e2702"]}}, {"$set" : {name : 'WEAREALLUPDATED'}}));
        let todos = [
            {
                _id: "637e8528966d6ad1509e26ff",
                name: "FemBoyToDoUpdated"
            },
            {
                _id: "637e8528966d6ad1509e2701",
                name: "CadaversEaterToDoUpdated"
            },
        ];
        let todosUpdateQuery = [];
        todos.forEach((e) => {
            todosUpdateQuery.push({ updateOne: {
                    "filter": { _id: e._id },
                    "update": { name: e.name }
                } });
        });
        yield db.ToDo.bulkWrite(todosUpdateQuery);
        //console.log(await db.ToDo.find())
    });
}
function createUsers(db) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('db.Users : ', db.Users);
        yield db.Users.insertMany([{
                login: "HornyFemboySlut",
                password: "JesusHatesMe",
                keys: "OnlyTruthIsVoid",
                SignUpAt: "IAmKillingMyselfConstantly"
            }, {
                login: "CadaversEater",
                password: "IserveToMany",
                keys: "KeyToMeIsYourMeat",
                SignUpAt: "IharvestSoulsForMyself"
            }, {
                login: "DestroyersOfSubmissiveNonentities",
                password: "IwillTurnYouToMySlave",
                keys: "YouAreMiserableBitch",
                SignUpAt: "YourSufferingIsHoneyToMyBlackSelf"
            }, {
                login: "???",
                password: "dele--../ISEEYOUcds0",
                keys: "...",
                SignUpAt: "DELETED"
            }, {
                login: "YourMiserableCumdump",
                password: "JesusHatesMe",
                keys: "OnlyTruthIsVoid",
                SignUpAt: "IAmKillingMyselfConstantly"
            }]);
    });
}
function createToDos(db) {
    return __awaiter(this, void 0, void 0, function* () {
        yield db.ToDo.insertMany([{
                author: "637e7caebd850b5b669adc93",
                name: 'Fuck my ass hard please',
                createdAt: "When I am so fucking horny"
            }, {
                author: "637e7caebd850b5b669adc93",
                name: 'And cum inside, I am begging you',
                createdAt: "Whenever you want"
            }, {
                author: "637e7caebd850b5b669adc94",
                name: 'bitter flesh...',
                createdAt: "at night"
            }, {
                author: "637e7caebd850b5b669adc94",
                name: 'I know where you live',
                createdAt: "soon..."
            }]);
    });
}
function showAllCollections(db) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Users collection : ', yield db.Users.find({}));
        console.log('Keys collection  : ', yield db.Keys.find({}));
        console.log('ToDo collection  : ', yield db.ToDo.find({}));
    });
}
function cleanAll(db) {
    return __awaiter(this, void 0, void 0, function* () {
        yield db.Users.deleteMany({});
        yield db.Keys.deleteMany({});
        yield db.ToDo.deleteMany({});
    });
}
function mongo() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const uri = 'mongodb+srv://IvIjDBr:LLvFyrt@womanupmongo.bepahne.mongodb.net/?retryWrites=true&w=majority';
            mongoose.connect(uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            const connection = mongoose.connection;
            connection.on("error", console.error.bind(console, "connection error: "));
            connection.once("open", function () {
                console.log("Connected successfully");
            });
            const UserSchema = new mongoose.Schema({
                login: {
                    type: String,
                    required: true
                },
                email: {
                    type: String
                },
                password: {
                    type: String,
                    required: true
                },
                keys: {
                    type: String
                },
                SignUpAt: {
                    type: String,
                    required: true,
                    immutable: true
                }
            });
            const ToDoSchema = new mongoose.Schema({
                author: {
                    type: String,
                    required: true
                },
                name: {
                    type: String,
                    required: true
                },
                createdAt: {
                    type: String,
                    required: true
                },
                updatedAt: {
                    type: String
                }
            });
            const KeysSchema = new mongoose.Schema({
                access_secret: {
                    type: String,
                    required: true
                },
                refresh_secret: {
                    type: String,
                    required: true
                }
            });
            const db = {
                Users: mongoose.model('Users', UserSchema),
                ToDo: mongoose.model('ToDo', ToDoSchema),
                Keys: mongoose.model('Keys', KeysSchema)
            };
            //await testDataBAZAandQueries(db);
            //await cleanAll(db);
            module.exports.db = db;
            yield showAllCollections(db);
        }
        catch (e) {
            console.log('mongo db: connection to cluster failed. Error : ', e);
        }
    });
}
mongo();
//# sourceMappingURL=db_mongo_manager.js.map