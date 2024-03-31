import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    //uploading on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      media_metadata: true,
    });

    //on file upload success
    console.log("file is uploaded on cloudainary ", response.url);
    console.log("response :>> ", response);

    //deleting file from local storage
    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    console.log("Error Occured: ", error);
    //deleting file from local storage
    fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteOnCloudinary = async (fileURL, resource_type = null) => {
  try {
    const fileId = fileURL.slice(fileURL.lastIndexOf("/")+1, fileURL.lastIndexOf("."));
    let deleteFile;
    if (resource_type) {
      deleteFile = await cloudinary.uploader.destroy(fileId, { resource_type });
    } else {
      deleteFile = await cloudinary.uploader.destroy(fileId);
    }
    return deleteFile?.result;
  } catch (error) {
    console.log("Error Occured: ", error);
    return null;
  }
};

export { uploadOnCloudinary, deleteOnCloudinary };