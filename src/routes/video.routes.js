import {Router} from "express"
import upload from "../middlewares/multer.middleware.js";
import { publishVideo, getVideoById, getAllVideos, updateVideo, deleteVideo, togglePublishStatus} from "../controllers/video.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router();

router.get('/getAllVideos', verifyJwt, getAllVideos)
router.post('/upload-video',
    upload.fields([
        {
          name: 'videoFile',
          maxCount: 1          
        },
        {
           name: 'thumbnail',
           maxCount: 1 
        }
    ]), 
    verifyJwt,
    publishVideo
)
router.get('/getVideoById/:id', getVideoById )
router.post('/updateVideo/:id', upload.single('thumbnail'), verifyJwt, updateVideo)
router.delete('/deleteVideo/:videoId',verifyJwt, deleteVideo)
router.patch('/togglePublishStatus/:videoId',verifyJwt, togglePublishStatus)
export default router;