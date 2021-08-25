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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import errorHandler from "errorhandler";
const express_1 = __importDefault(require("express"));
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
// import session from "express-session";
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// import bodyParser from "body-parser";
const morgan_1 = __importDefault(require("morgan"));
const mongoose_1 = __importDefault(require("mongoose"));
require("reflect-metadata");
const http_1 = require("http");
// import app from "./app";
// import { any } from "bluebird";
const config_1 = __importDefault(require("./config"));
const logger_1 = __importDefault(require("./util/logger"));
const user_controller_1 = __importDefault(require("./controllers/user.controller"));
const auth_controller_1 = __importDefault(require("./controllers/auth.controller"));
const errorHandler_1 = require("./middleware/errorHandler");
const next_1 = __importDefault(require("next"));
const path_1 = require("path");
const { NODE_ENV, MONGODB_URI } = config_1.default;
class Server {
    constructor() {
        this.app = express_1.default();
        this.setup();
        this.nextApp = next_1.default({
            dev: NODE_ENV === "development",
            dir: path_1.join(__dirname, "/../frontend"),
        });
    }
    static createServerInstance() {
        return __awaiter(this, void 0, void 0, function* () {
            const server = new Server();
            yield server.setupDB();
            return server;
        });
    }
    initFrontend() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.nextApp.prepare();
                const handle = this.nextApp.getRequestHandler();
                if (config_1.default.NODE_ENV === "production") {
                    this.app.use("/service-worker.js", express_1.default.static("frontend/.next/service-worker.js"));
                }
                else {
                    this.app.use("/service-worker.js", express_1.default.static("frontend/service-worker.js"));
                }
                this.app.use("/manifest.json", express_1.default.static("frontend/static/manifest.json"));
                this.app.use("/robots.txt", express_1.default.static("frontend/static/robots.txt"));
                this.app.get("*", (req, res) => {
                    return handle(req, res);
                });
            }
            catch (error) {
                logger_1.default.error("Error setting up frontend:", error);
                throw error;
            }
        });
    }
    setupMiddleware() {
        if (config_1.default.NODE_ENV !== "test") {
            const logFormat = config_1.default.NODE_ENV !== "production" ? "dev" : "tiny";
            this.app.use(morgan_1.default(logFormat));
        }
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use(cookie_parser_1.default());
        this.app.use(cors_1.default());
        this.app.use(compression_1.default());
    }
    setupApiRouters() {
        this.app.use("/api/users/", user_controller_1.default);
        this.app.use("/api/auth/", auth_controller_1.default);
    }
    setupErrorHandler() {
        this.app.use(errorHandler_1.standardErrorHandler);
    }
    setupDB() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.mongoose = yield mongoose_1.default.connect(MONGODB_URI, {
                    useNewUrlParser: true,
                    useCreateIndex: true,
                    useFindAndModify: false,
                    useUnifiedTopology: true,
                });
                this.mongoose.Promise = Promise;
                logger_1.default.info("Connected to MongoDB");
                return this.mongoose;
            }
            catch (error) {
                logger_1.default.error("Error connecting to mongo:", error);
                // throw error;
            }
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            //await this.initFrontend();
            this.httpServer.listen(config_1.default.PORT, () => {
                config_1.default.PORT = this.httpServer.address().port;
                console.log("CONFIG:", config_1.default);
                logger_1.default.info(`Listening on port: ${config_1.default.PORT}`);
            });
            // Graceful shutdown
            const gracefulShutdown = () => __awaiter(this, void 0, void 0, function* () {
                console.log("Graceful shut down initiated");
                yield this.mongoose.disconnect();
                yield new Promise((resolve, reject) => this.httpServer.close((err) => err ? reject(err) : resolve("No Error")));
                process.exit(0);
            });
            process.on("SIGTERM", gracefulShutdown);
            process.on("SIGINT", gracefulShutdown);
            return this;
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.mongoose) {
                yield this.mongoose.disconnect();
            }
            if (this.httpServer) {
                yield new Promise((resolve, reject) => this.httpServer.close((err) => err ? reject(err) : resolve("No Error")));
            }
            return this;
        });
    }
    setup() {
        this.setupMiddleware();
        this.setupApiRouters();
        this.setupErrorHandler();
        this.httpServer = http_1.createServer(this.app);
    }
}
exports.default = Server;
//# sourceMappingURL=server.js.map