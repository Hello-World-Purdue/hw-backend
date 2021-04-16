// import errorHandler from "errorhandler";
import express from "express";
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

const { NODE_ENV, MONGODB_URI } = CONFIG;

// /**
//  * Error Handler. Provides full stack
//  */
// if (process.env.NODE_ENV === "development") {
//     app.use(errorHandler());
// }

// /**
//  * Start Express server.
//  */
// const server = app.listen(app.get("port"), () => {
//     console.log(
//         "  App is running at http://localhost:%d in %s mode",
//         app.get("port"),
//         app.get("env")
//     );
//     console.log("  Press CTRL-C to stop\n");
// });

// export default server;

export default class Server {
  public static async createServerInstance(): Promise<Server> {
    const server = new Server();
    await server.setupDB();
    return server;
  }

  public app: express.Application;
  public mongoose: typeof mongoose;
  public httpServer: HTTPServer;

  private constructor() {
    this.app = express();
    this.setup();
  }

  public async initFrontend(): Promise<void> {
    //Setup fronted if any
  }

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
    await this.initFrontend();

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

    // Any unhandled errors will be caught in this middleware
    // this.app.use(globalError);
    // this.setupSwagger();

    this.httpServer = createHttpServer(this.app);
  }
}
