import CONFIG from "../config";
import { Storage } from "@google-cloud/storage";
import { UserDto } from "../models/User";
import { BadRequestException } from "../util/exceptions";

const storage = new Storage({
  projectId: CONFIG.GC_PROJECT_ID,
  keyFilename: CONFIG.GC_KEY_FILE,
});

const bucket = storage.bucket(CONFIG.GC_BUCKET);

export const uploadToStorage = async (
  file: Express.Multer.File,
  folder: "pictures" | "resumes",
  user: UserDto
): Promise<any> => {
  if (!file) throw new Error("No image file");
  else if (
    folder === "pictures" &&
    !file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)
  )
    throw new Error(`File: ${file.originalname} is an invalid image type`);
  else if (folder === "resumes" && !file.originalname.match(/\.(pdf)$/i))
    throw new BadRequestException(
      `File: ${file.originalname} must be a .pdf file`
    );

  const fileName = `${folder}/${user.email.replace("@", "_")}`;
  const fileUpload = bucket.file(fileName);

  return new Promise<string>((resolve, reject) => {
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
      resolve(`https://storage.googleapis.com/${CONFIG.GC_BUCKET}/${fileName}`);
    });

    blobStream.end(file.buffer);
  });
};
