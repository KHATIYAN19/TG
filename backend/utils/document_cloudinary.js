import { v2 as cloudinary } from 'cloudinary';
import streamifier from "streamifier";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadFile = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    // FIX: Remove the .v2 here
    const stream = cloudinary.uploader.upload_stream(
      { folder: "client-documents" ,
        resource_type: "auto"
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

export default uploadFile;