import {uploadOnCloudinary, cloudinary} from "../utils/cloudinary.js"
import {User} from "../models/user.model.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

const getChannelInfo = async(req,res)=>{
    const {username} = req.params;

    if(!username?.trim()){
      return res.status(400).send("username is missing")
    }

    const channel = await User.aggregate([
      {
          $match: {
              username: username?.toLowerCase()
          }
      },
      {
          $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscribers"
          }
      },
      {
          $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "subscriber",
              as: "subscribedTo"
          }
      },
      {
          $addFields: {
              subscribersCount: {
                  $size: "$subscribers"
              },
              channelsSubscribedToCount: {
                  $size: "$subscribedTo"
              },
              isSubscribed: {
                  $cond: {
                      if: {$in: [new mongoose.Types.ObjectId(req.user?._id), "$subscribers.subscriber"]},
                      then: true,
                      else: false
                  }
              }
          }
      },
      {
          $project: {
              fullName: 1,
              username: 1,
              subscribersCount: 1,
              channelsSubscribedToCount: 1,
              isSubscribed: 1,
              avatar: 1,
              coverImage: 1,
              email: 1

          }
      }
  ])
    
    if(!channel?.length){
      return res.status(404).send("channel does not exist")
    }
     
    return res
    .status(200)
    .json({message: "channel info fetched successfully", channel})
   

 }

const generateAccessAndRefreshTokens=async(userId)=>{
  try{   

  const user = await User.findById(userId)
  const accessToken = await user.generateAccessToken()
  if(!accessToken){ console.log("Cannot generate access token"); return }
  const refreshToken = await user.generateRefreshToken()
  if(!refreshToken){ console.log("Cannot generate refresh token"); return }
  
  user.refreshToken = refreshToken;

  await user.save({ validateBeforeSave: false })

  return {accessToken, refreshToken}

  }catch(err){
    console.log("Something went wrong:", err.message)
  }
}

const updateAvatar = async(req,res)=>{

    const avatarLocalPath = req.file.path;

    if(!avatarLocalPath){
      return res.status(400).send("could not find avatar local path")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
     
    if(!avatar){
      return res.status(400).send("Avatar file could not be uploaded")
    }

    const user = await User.findById(req.user._id).select("-password")
    if(!user){
      return res.status(400).send("Could not find user")
    }
    const oldavatar = user.avatar.split('/').pop().split('.')[0];
    
    const deleteResponse = await cloudinary.uploader.destroy(oldavatar)
    if(!deleteResponse){
      return res.status(500).send("Old avatar can not be deleted from cloudinary")
    }
    user.avatar = avatar.url;
    await user.save({ validateBeforeSave: false })
    res.status(200).json({user})
}

const updateCoverImage = async(req,res)=>{
      const coverImageLocalPath = req.file.path

      if(!coverImageLocalPath){
        return res.status(400).send("Could not find cover image local path")
      }
      const coverImage = await uploadOnCloudinary(coverImageLocalPath)
       
      if(!coverImage){
        return res.status(400).send("Could not upload cover image")
      }

      const user = await User.findById(req.user._id).select("-password")

      const oldCoverImage = user.coverImage.split('/').pop().split('.')[0]
 
      const deleteResponse = await cloudinary.uploader.destroy(oldCoverImage)
       
      if(!deleteResponse){
        return res.status(500).send("cannot delete old cover image")
      }

      user.coverImage = coverImage.url
      
      await user.save({ validateBeforeSave: false })

      return res.status(200).json({message: "Cover image updated successfully", user})

}


const updateAccountDetails = async(req,res)=>{
      const {fullname, email} = req.body;

      if(!fullname || !email){
        return res.status(400).send("All fields are required")
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        {
          $set:{
            fullname,
            email
          }
        },{
          new: true
        }
      ).select("-password")
      return res.status(200).json({message: "User updated successfully", updatedUser: user})
}

const getCurrentUser = async(req,res)=>{
     return res.status(200).json({message: "Current user fetched successfully", userInfo: req.user})
}

const changeCurentPassword=async(req,res)=>{
   try {
    const {oldPassword, newPassword} = req.body;
    const user = await User.findById(req.user?._id)
    if(!user){
     return res.status(400).send("Unauthrised access")
    }
 
    const verifyPassword=await user.isPasswordCorrect(oldPassword)
    if(!verifyPassword){
       return res.status(400).send("Please enter correct password")
    }
 
    user.password = newPassword;
    user.save({ validateBeforeSave: false })
     
    return res.status(200).json({message: "Password changed successfully"})
   } catch (error) {
       console.log("Error occured while changing password:", error.message)
   }

}
const refreshAccessToken=async(req,res)=>{
   try {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
      return res.status(400).send("Refresh token not found")
    }
    
    const decodedToken = jwt.verify(
       incomingRefreshToken,
       process.env.REFRESH_TOKEN_SECRET
    )
    const user = await User.findById(decodedToken._id)
    if(!user){
     return res.status(400).send("Unauthorised access")
    }
 
    if(incomingRefreshToken!=user.refreshToken){
     return res.status(400).send("Unauthorised access")
    }
 
    const options={
     httpOnly: true,
     secure: true
    }
 
    const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)
 
    return res
    .cookies("accessToken", accessToken, options)
    .cookies("refrshToken", newRefreshToken, options)
    .json({message: "Access token refreshed successfully", accessToken, refreshToken: newRefreshToken})
   } catch (error) {
        console.log("Something went wrong", error.message)
   }

}


const logoutUser = async(req,res)=>{ 
await User.findByIdAndUpdate(
      req.user._id,
      {
        $unset:{
          refreshToken: 1
        }
      },
      {
        new: true
      }
)
   const options={
      httpOnly: true,
      secure: true
   }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({message: "User logged out successfully"})

}

const LogInUser = async(req,res)=>{
   const {username, email, password}=req.body;

   if(!username && !email)
    return res.status(400).send("Either username or email is required")

   const user = await User.findOne({
    $or: [{username},{email}]
   })

    if(!user)
    return res.status(400).send("user doesnot exist")

     const isPasswordvalid = await user.isPasswordCorrect(password)
    
    if(!isPasswordvalid)
   return res.status(400).send("Invalid credentials")
  
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")
 
    const options = {
      httpOnly: true,
      secure: true
    }
    
    //sending both tokens in a single cookie
    // const combinedToken = `${accessToken}|${refreshToken}`;
    // return res
    //     .status(200)
    //     .cookie("authTokens", combinedToken, options)
    //     .send({ message: "User logged in successfully", loggedInUser });
  


      return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .send({message: "User logged in successfully", loggedInUser})
}


const registerUser = async(req,res)=>{
    const {fullname, email, username, password}=req.body;
     
    
      if([fullname, email, username, password].some((field)=>field=="")){
        return res.status(400).send("all field must be filled")
      }
      const existedUser= await User.findOne({
        $or: [{ username },{ email }]
      })

       if(existedUser){
         return res.status(409).send("User with email or username is already exists")
       }
      const avatarLocalPath = req.files?.avatar[0]?.path;
      //const coverImageLocalPath = req.files?.coverImage[0]?.path;
      
      if(req.files.coverImage){
        const coverImageLocalPath = req.files?.coverImage[0]?.path;
        const coverImage=await uploadOnCloudinary(coverImageLocalPath)
      }
  
       if(!avatarLocalPath){
         return res.status(400).send("Avatar file is required")
       }
      
       const avatar=await uploadOnCloudinary(avatarLocalPath)
       //const coverImage=await uploadOnCloudinary(coverImageLocalPath)
       
       if(!avatar){
        return res.status(400).send("Avtar file is required")
       }
      
       
       let user = await User.create({
         fullname,
         email,
         username: username.toLowerCase(),
         password,
         avatar: avatar.url,
         coverImage: req.files?.coverImage[0]?.url || ""
       })
       user = await User.findById(user._id)
       res.status(200).json({message: "User successfully registed", user})
      
    }

const getalluser = async(req,res)=>{
  try{
    const alluser = await User.find()
    res.send(alluser)
  }catch(err){
    console.log("error occured while fetching all user", err.message)
  }
}
export {registerUser, 
    getalluser, 
    LogInUser, 
    logoutUser, 
    refreshAccessToken,
    changeCurentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage,
    getChannelInfo
  }