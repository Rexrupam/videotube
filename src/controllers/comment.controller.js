import {Comment} from "../models/comment.model.js"

export const addcomment = async(req,res)=>{
    const { videoId } = req.params;
    const { content } = req.body;
    if(!content){
        return res.status(400).send('Content is missing')
    }
    
    const video = await Comment.findById()

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    })

    if(!comment){
        return res.status(401).send('Failed to create comment')
    }

    return res.status(200).json({
        message: "Comment created successfully",
        comment
    })
}