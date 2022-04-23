// import errorHandler from "errorhandler";
import express, { NextFunction } from "express";
import compression from "compression";
import cors from "cors";
// import session from "express-session";
import cookieParser from "cookie-parser";
// import bodyParser from "body-parser";
import morgan from "morgan";
import mongoose from "mongoose";
import { createLogger } from "winston";
import "reflect-metadata";
import { createServer as createHttpServer, Server as HTTPServer } from "http";
// import app from "./app";
// import { any } from "bluebird";
import CONFIG from "./config";
import logger from "./util/logger";
import { AddressInfo } from "net";
import userRouter from "./controllers/user.controller";
import announcementRouter from "./controllers/announcement.controller";
import authRouter from "./controllers/auth.controller";
import { standardErrorHandler } from "./middleware/errorHandler";
// import next from "next";
import { join } from "path";
import { setUpAnnouncements } from "./services/announcement.service";

const { NODE_ENV, MONGODB_URI } = CONFIG;

export default class Server {
  public static async createServerInstance(): Promise<Server> {
    const server = new Server();
    await server.setupDB();
    return server;
  }

  public app: express.Application;
  public mongoose: typeof mongoose;
  public httpServer: HTTPServer;
  // public nextApp;

  private constructor() {
    this.app = express();
    this.setup();
    // this.nextApp = next({
    //   dev: NODE_ENV === "production",
    //   dir: join(__dirname, "/../../frontend"),
    // });
  }

  // public async initFrontend(): Promise<void> {
  //   try {
  //     // await this.nextApp.prepare();
  //     // const handle = this.nextApp.getRequestHandler();
  //     // if (CONFIG.NODE_ENV === "production") {
  //     //   this.app.use(
  //     //     "/service-worker.js",
  //     //     express.static("dist/.next/service-worker.js")
  //     //   );
  //     // } else {
  //     //   this.app.use(
  //     //     "/service-worker.js",
  //     //     express.static("../frontend/service-worker.js")
  //     //   );
  //     // }
  //     // this.app.use(
  //     //   "/manifest.json",
  //     //   express.static("../frontend/static/manifest.json")
  //     // );
  //     //this.app.use("/robots.txt", express.static("frontend/static/robots.txt"));
  //     this.app.get("*", (req, res) => {
  //       return handle(req, res);
  //     });
  //   } catch (error) {
  //     logger.error("Error setting up frontend:", error);
  //     throw error;
  //   }
  // }

  private setupMiddleware(): void {
    if (CONFIG.NODE_ENV !== "test") {
      const logFormat = CONFIG.NODE_ENV !== "production" ? "dev" : "tiny";
      this.app.use(morgan(logFormat));
    }
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    this.app.use(cors());
    this.app.use(compression());
  }

  private setupApiRouters(): void {
    this.app.use("/api/users/", userRouter);
    this.app.use("/api/auth/", authRouter);
    this.app.use("/api/announcement/", announcementRouter);
  }

  private setupErrorHandler(): void {
    this.app.use(standardErrorHandler);
  }

  private async setupDB() {
    try {
      this.mongoose = await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
      });
      this.mongoose.Promise = Promise;
      logger.info("Connected to MongoDB");
      return this.mongoose;
    } catch (error) {
      logger.error("Error connecting to mongo:", error);
      // throw error;
    }
  }

  public async start(): Promise<any> {
    // await this.initFrontend();
    this.httpServer.listen(CONFIG.PORT, () => {
      CONFIG.PORT = (this.httpServer.address() as AddressInfo).port;
      console.log("CONFIG:", CONFIG);
      logger.info(`Listening on port: ${CONFIG.PORT}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async () => {
      console.log("Graceful shut down initiated");
      await this.mongoose.disconnect();
      await new Promise((resolve, reject) =>
        this.httpServer.close((err) =>
          err ? reject(err) : resolve("No Error")
        )
      );
      process.exit(0);
    };
    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);
    return this;
  }

  public async stop(): Promise<any> {
    if (this.mongoose) {
      await this.mongoose.disconnect();
    }
    if (this.httpServer) {
      await new Promise((resolve, reject) =>
        this.httpServer.close((err) =>
          err ? reject(err) : resolve("No Error")
        )
      );
    }
    return this;
  }

  private setup(): void {
    this.setupMiddleware();

    this.setupApiRouters();
    this.setupErrorHandler();

    this.httpServer = createHttpServer(this.app);

    setUpAnnouncements(this.httpServer);
  }
}
