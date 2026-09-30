// import { v2 as cloudinary } from 'cloudinary';

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const uploadFile = async (filePath) => {
//   try {
//     const result = await cloudinary.uploader.upload(filePath,{
//       resource_type: "auto",
//     });
//     return result;
//   } catch (e) {
//     console.error('Upload error:', e);
//     throw e;
//   }
// };

// export default uploadFile;

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME,

  api_key:
    process.env.CLOUDINARY_API_KEY,

  api_secret:
    process.env.CLOUDINARY_API_SECRET,
});

/*
|--------------------------------------------------------------------------
| UPLOAD FILE
|--------------------------------------------------------------------------
|
| Keep this as the DEFAULT export.
|
| Existing imports continue working:
|
| import uploadFile from "../utils/cloudinary.js";
|
*/

const uploadFile = async (
  filePath
) => {
  try {
    if (!filePath) {
      throw new Error(
        "File path is required."
      );
    }

    const result =
      await cloudinary.uploader.upload(
        filePath,
        {
          resource_type: "auto",
        }
      );

    return result;
  } catch (error) {
    console.error(
      "Cloudinary upload error:",
      error
    );

    throw error;
  }
};

/*
|--------------------------------------------------------------------------
| DELETE FILE
|--------------------------------------------------------------------------
|
| This is a NAMED export.
|
| Existing upload imports are NOT affected.
|
| Blog usage:
|
| import uploadFile, {
|   deleteFile,
| } from "../utils/cloudinary.js";
|
*/

export const deleteFile =
  async (
    publicId,
    resourceType = "image"
  ) => {
    try {
      if (!publicId) {
        return null;
      }

      const result =
        await cloudinary.uploader.destroy(
          publicId,
          {
            resource_type:
              resourceType,

            invalidate: true,
          }
        );

      return result;
    } catch (error) {
      console.error(
        "Cloudinary delete error:",
        error
      );

      throw error;
    }
  };

/*
|--------------------------------------------------------------------------
| DEFAULT EXPORT
|--------------------------------------------------------------------------
*/

export default uploadFile;