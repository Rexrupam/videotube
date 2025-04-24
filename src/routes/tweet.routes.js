import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller.js";
import {Router} from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router();

router.post('/tweet',verifyJwt, createTweet)
router.get('/getUserTweet', verifyJwt, getUserTweets )
router.post('/update-tweet/:id', verifyJwt, updateTweet)
router.delete('/delete-tweet/:id', verifyJwt, deleteTweet)

export default router;