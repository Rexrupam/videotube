import {v2 as cloudinary} from "cloudinary"
import fs from "fs";
import dotenv from "dotenv"


cloudinary.config({ 
    cloud_name: process.env.cloud_name, 
    api_key: process.env.api_key,
    api_secret: process.env.api_secret 
});

const uploadOnCloudinary=async(localFilepath)=>{
    try{
      if(!localFilepath){ 
        return null;}
     const response= await cloudinary.uploader.upload(localFilepath,{
        resource_type: "auto"
      })
     
       fs.unlinkSync(localFilepath)
      return response;
    }catch(err){
        fs.unlinkSync(localFilepath) 
        // remove the file from server as the upload 
        // operation got failed
        return null; 
      
    }
}


export {uploadOnCloudinary, cloudinary}