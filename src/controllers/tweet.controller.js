import {Tweet} from "../models/tweet.model.js"


export const createTweet = async(req,res)=>{
    const { content } = req.body
    
    if(!content.trim()){
        return res.status(400).send("content field is required")
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user?._id
    })

    if(!tweet){
        return res.status(500).send("tweet creation failed")
    }
 
    return res
    .status(200)
    .json({message: "tweet created successfully", tweet})

}

export const getUserTweets = async(req,res)=>{
       const tweet = await Tweet.find({
        owner: req.user?._id
       })

       if(!tweet){
        return res.status(400).send("you haven't tweeted anything")
       }

       return res
       .status(200)
       .json({tweet})
}

export const updateTweet = async(req,res)=>{
     if(!req.params.id){
        return res.status(400).send("tweet id is required")
     }

     const { content } = req.body;
     
     if(!content){
        return res.status(400).send("This field is required")
     }

     const updatedTweet = await Tweet.findByIdAndUpdate(
        req.params.id,
        {
            $set:{
                content
            }
        },
        {
        new: true
        }
     )

     return res
     .status(200)
     .json({message: "tweet updated successfully" , updatedTweet})
}

export const deleteTweet = async(req,res)=>{
     if(!req.params.id){
        return res.status(400).send("tweet id is required")
     }

     const deletedTweet = await Tweet.findByIdAndDelete(req.params.id)
     
     return res
     .status(200)
     .json({message: "tweet deleted successfully", deletedTweet})
}

