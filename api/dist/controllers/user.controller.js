"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../models/User");
const express_1 = require("express");
const application_1 = require("../models/application");
const mongoose_1 = require("mongoose");
const bson_1 = require("bson");
const authentication_1 = require("../middleware/authentication");
const user_enums_1 = require("../enums/user.enums");
const util_1 = require("../util");
const exceptions_1 = __importStar(require("../util/exceptions"));
const globals_controller_1 = require("./globals.controller");
const globals_enums_1 = require("../enums/globals.enums");
const storage_service_1 = require("../services/storage.service");
const logger_1 = __importDefault(require("../util/logger"));
const multer_1 = __importDefault(require("multer"));
const router = express_1.Router();
//Authorization
const getAll = (req, res) => __awaiter(this, void 0, void 0, function* () {
    const order = req.query.order === "1" ? 1 : -1;
    let sortBy = `${req.query.sortBy}` || "createdAt";
    let sortingParamPresent = false;
    User_1.User.schema.eachPath((path) => {
        if (path.toUpperCase() === sortBy.toUpperCase())
            sortingParamPresent = true;
    });
    if (!sortingParamPresent)
        sortBy = "createdAt";
    const users = yield User_1.User.find()
        .sort({ [sortBy]: order })
        .lean()
        .exec();
    res.status(200).json({ users: users });
});
const getCurrentUsersApplication = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const app = yield application_1.Application.findOne({ user: req.user })
        .populate("user")
        .exec();
    if (!app)
        next(new exceptions_1.NotFoundException("No users found!"));
    else
        res.status(200).send(app);
});
const getUserApplication = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const id = req.params.id;
    if (!mongoose_1.isValidObjectId(id)) {
        //return error: the objectId is not valid
        return next(new exceptions_1.BadRequestException("The user id is invalid"));
    }
    if (req.user !== id) {
        //return error: not authorizied to see the application
        return next(new exceptions_1.UnauthorizedException("You do not have enough permissions to view the application"));
        return;
    }
    //find the user object
    const user = yield User_1.User.findById(id).exec();
    if (!user) {
        //return error: the user doesn't exist
        next(new exceptions_1.BadRequestException("The user doesn't exist"));
        return;
    }
    const applicationQuery = application_1.Application.findOne({
        user: req.user,
    }).populate("user");
    if (util_1.hasPermission(user, user_enums_1.Role.EXEC)) {
        applicationQuery.select("+statusInternal");
    }
    const application = yield applicationQuery.exec();
    res.status(200).send(application);
});
const getUserById = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const id = req.params.id;
    console.log(id);
    if (!bson_1.ObjectId.isValid(id))
        return next(new exceptions_1.BadRequestException("Invalid user id"));
    const user = yield User_1.User.findById(id).populate("application").exec();
    if (!user)
        return next(new exceptions_1.BadRequestException("User does not exist"));
    res.status(200).send(user);
});
const updateUserById = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const id = req.params.id;
    const userObject = req.body;
    const currentUser = req.user;
    if (!mongoose_1.isValidObjectId(id)) {
        //return error: invalid user id
        return next(new exceptions_1.BadRequestException("The user id is invalid!"));
    }
    const user = yield User_1.User.findById(id).exec();
    if (!user) {
        //return error: User not found
        return next(new exceptions_1.NotFoundException("The user is not found!"));
    }
    if (id !== currentUser) {
        //return error: Unauthorized to edit the profile
        return next(new exceptions_1.UnauthorizedException("You don't have enough permissions to edit this profile"));
    }
    if (!userObject ||
        !userObject.name ||
        !/([a-zA-Z']+ )+[a-zA-Z']+$/.test(userObject.name)) {
        //return error: Provide your first and last name
        return next(new exceptions_1.BadRequestException("Provide your first and last name"));
    }
    //update query
    const result = yield User_1.User.findByIdAndUpdate(id, { name: userObject.name })
        .lean()
        .exec();
    res.status(200).send({ user: result });
});
const apply = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const id = req.params.id;
    if (!bson_1.ObjectId.isValid(id))
        return next(new exceptions_1.BadRequestException("Invalid user ID"));
    const user = yield User_1.User.findById(id).exec();
    if (!user)
        return next(new exceptions_1.BadRequestException("User not found"));
    const currUser = req.user;
    if (!util_1.userMatches(currUser, id))
        return next(new exceptions_1.BadRequestException("You are not authorized to edit this application"));
    const globals = yield globals_controller_1.getGlobalValues();
    const closed = currUser.role === user_enums_1.Role.ADMIN
        ? false
        : globals.applicationsStatus === globals_enums_1.ApplicationsStatus.CLOSED;
    if (closed)
        next(new exceptions_1.UnauthorizedException("Sorry, applications are closed!"));
    const files = req.files
        ? req.files
        : [];
    const resume = files.find((file) => file.fieldname === "resume");
    const applicationBody = req.body;
    if (resume) {
        try {
            applicationBody.resume = yield storage_service_1.uploadToStorage(resume, "resumes", currUser);
        }
        catch (error) {
            logger_1.default.error("Error uploading resume:", { err: error });
            if (error.code === 429) {
                return next(new exceptions_1.BadRequestException("You are uploading your resume too fast! Please try again in 5 minutes!"));
            }
            else {
                return next(new exceptions_1.BadRequestException("Your resume couldn't be uploaded, please try again later"));
            }
        }
    }
    const appQuery = application_1.Application.findOneAndUpdate({ user }, Object.assign({}, applicationBody, { user }), {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
    }).populate("user");
    try {
        if (util_1.hasPermission(currUser, user_enums_1.Role.EXEC))
            appQuery.select("+statusInternal");
        const app = yield appQuery.exec();
        user.application = app;
        yield user.save();
        res.status(200).json({ app });
    }
    catch (error) {
        logger_1.default.error(error);
        next(new exceptions_1.default(error));
    }
});
router.use(authentication_1.logInChecker);
router.get("/", (req, res, next) => authentication_1.authorizationMiddleware(req, res, next, [user_enums_1.Role.ADMIN, user_enums_1.Role.EXEC]), getAll);
router.get("/:id/application", (req, res, next) => authentication_1.authorizationMiddleware(req, res, next, []), getUserApplication);
router.get("/application", (req, res, next) => authentication_1.authorizationMiddleware(req, res, next, []), getCurrentUsersApplication);
//route is /:id
router.get("/:id(((?!application)[a-zA-Z0-9]+)$)", (req, res, next) => authentication_1.authorizationMiddleware(req, res, next, [user_enums_1.Role.EXEC]), getUserById);
router.put("/:id", (req, res, next) => authentication_1.authorizationMiddleware(req, res, next, []), updateUserById);
router.post("/:id/apply", multer_1.default().array("resume", 1), (req, res, next) => authentication_1.authorizationMiddleware(req, res, next, []), apply);
exports.default = router;
//# sourceMappingURL=user.controller.js.map