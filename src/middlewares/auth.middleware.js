import jwt from "jsonwebtoken"
import {User} from "../models/user.model.js"
import dotenv from "dotenv"

// dotenv.config({
//   path: "./.env"
// })
export const verifyJwt = async(req,res,next)=>{
  try {
    
    const token = req.cookies?.accessToken || req.header
    ("Authorization")?.replce("Bearer ","");
  
    if(!token){
      return res.status(401).send("Unauthorised access");
    }
  
    // const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    // const user = await User.findById(decodedToken._id).select("-password -refreshToken")
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
    const user = await User.findById(decodedToken._id).select("-password -refreshToken")
  
    if(!user){
      return res.status(401).send("Invalid access token")
    }
  
    req.user = user
  
    next()
  } catch (err) {
     console.log("Invalid access token:", err)
  }
}