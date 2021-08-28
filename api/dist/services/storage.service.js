"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../config"));
const storage_1 = require("@google-cloud/storage");
const exceptions_1 = require("../util/exceptions");
const storage = new storage_1.Storage({
    projectId: config_1.default.GC_PROJECT_ID,
    keyFilename: config_1.default.GC_KEY_FILE,
});
const bucket = storage.bucket(config_1.default.GC_BUCKET);
exports.uploadToStorage = (file, folder, user) => __awaiter(this, void 0, void 0, function* () {
    if (!file)
        throw new Error("No image file");
    else if (folder === "pictures" &&
        !file.originalname.match(/\.(jpg|jpeg|png|gif)$/i))
        throw new Error(`File: ${file.originalname} is an invalid image type`);
    else if (folder === "resumes" && !file.originalname.match(/\.(pdf)$/i))
        throw new exceptions_1.BadRequestException(`File: ${file.originalname} must be a .pdf file`);
    const fileName = `${folder}/${user.email.replace("@", "_")}`;
    const fileUpload = bucket.file(fileName);
    return new Promise((resolve, reject) => {
        const blobStream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype,
                cacheControl: "no-cache, max-age=0",
            },
        });
        blobStream.on("error", (error) => {
            console.error("Error uploading file to folder:", folder, error);
            reject(error);
        });
        blobStream.on("finish", () => {
            // The public URL can be used to directly access the file via HTTP.
            resolve(`https://storage.googleapis.com/${config_1.default.GC_BUCKET}/${fileName}`);
        });
        blobStream.end(file.buffer);
    });
});
//# sourceMappingURL=storage.service.js.map