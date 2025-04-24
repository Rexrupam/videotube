import {Video} from "../models/video.model.js"
import {cloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"

export const getAllVideos = async(req,res)=>{
     try {
      const filter = {};
      const {userid, query, page=1, limit=1, sortBy='createdAt', sortType } = req.query
      if(userid){
      filter.owner = userid
      }
      if(query){
        filter.title = { $regex: query, $options: 'i' }
      }
      const sortOptions = {
        [sortBy]: sortType && sortType==='desc'? -1:1
      }
      const video = await Video.find(filter).sort(sortOptions).skip(page).limit(limit)
      return res.status(200).json({video})
     } catch (error) {
      return res.status(500).send("something went wrong")
     }
}

export const publishVideo = async(req,res)=>{
       try {
        const { title, description } = req.body;
        if(!title.trim() && !description.trim()){
         return res.status(400).send("Title and description required")
        }
 
        const videoFileLocalPath = req.files?.videoFile[0]?.path
        const thumbnailLocalPath = req.files?.thumbnail[0]?.path
 
        if(!videoFileLocalPath){
         return res.status(400).send("Video file is required")
        }
 
        if(!thumbnailLocalPath){ 
         return res.status(400).send("Thumbnail file is required")
        }
        
        const videoFile = await uploadOnCloudinary(videoFileLocalPath);
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
 
        if(!videoFile){
         return res.status(400).send("Error on uploading the video")
        }
 
        if(!thumbnail){
         return res.status(400).send("Error on uploading thumbnail")
        }
 
          const video = await Video.create({
             title,
             description,
             VideoFile: videoFile.url,
            thumbnail: thumbnail.url,
            owner: req.user._id,
             duration: videoFile.duration
            })
 
            return res
            .status(200)
             .json({message: "video uploaded successfully", video})
    
       } catch (error) {
         res.status(500).send("failed to upload video", error)
       }
    
}

export const getVideoById = async(req,res)=>{
      try {
        const { id } = req.params;
        if(!id){
          return res.status(401).send("Video id is required")
        }
        const video = await Video.findById(id)
        return res.status(200).json({video})
      } catch (error) {
         return res.status(500).send("something went wrong")
      }
}

export const updateVideo = async(req, res)=>{
  const filter = {}
  const { title, description } = req.body;
  if(!title || !description){
    return res.status(401).send('These field are required')
  }
  filter._id = req.params.id
  filter.owner = req.user._id
  const thumbnailLocalPath = req.file?.path;
  if(!thumbnailLocalPath){
    return res.status(401).send('Thumbnail is not found')
  }
  let video = await Video.find(filter).select("thumbnail")
  if(!video){
    return res.status(400).send("No video found for this user")
  }
  const oldThumbnailProductId = video[0].thumbnail.split('/').pop().split('.')[0]
  const deleteOldThumbnail = await cloudinary.uploader.destroy(oldThumbnailProductId)
  if(!deleteOldThumbnail){
    return res.status(500).send('Failed to delete old thumbnail')
  }
  const newThumbnail = await uploadOnCloudinary(thumbnailLocalPath)
  if(!newThumbnail){
    return res.status(500).send('Failed to upload thumbnail')
  }
  video[0].thumbnail = newThumbnail.url;
  await video[0].save({ validateBeforeSave: false })
  return res.status(200).json({message: "Thumbnail updated successfully", video})
} 

export const deleteVideo = async(req, res)=>{
   const { videoId } = req.params;
   if(!videoId){
    return res.status(400).send('Need video id to process')
   }
   const filter = { 
     _id : req.params.videoId,
     owner: req.user._id
   }
   const deletedVideo = await Video.findOneAndDelete(filter)
   return res.status(200).json({message: 'video deleted successfully', deletedVideo})
  
}

export const togglePublishStatus = async(req,res)=>{
    const {videoId } = req.params;
    const filter = {
      _id : req.params.videoId,
      owner : req.user._id
    }
    const video = await Video.find(filter)
    if(!video[0]){
       return res.status(400).send('No video found for this user')
    }

    video[0].isPublished = !video[0].isPublished;

    await video[0].save({ validateBeforeSave: false })

    return res.status(200).json({ 
      message: `Video has been ${video[0].isPublished ? 'published' : 'unpublished'}.`,
      video
       })
}