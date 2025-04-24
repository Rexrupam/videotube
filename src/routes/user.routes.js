import {Router} from "express"
import { getChannelInfo,updateCoverImage, updateAvatar, updateAccountDetails, getCurrentUser, changeCurentPassword, refreshAccessToken, logoutUser, LogInUser, getalluser, registerUser } from "../controllers/user.controller.js"
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router();
import upload from "../middlewares/multer.middleware.js"

router.post('/register',
      upload.fields([
         {
             name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
     ])
    ,registerUser)


router.post('/login', upload.none(), LogInUser )
router.post('/logout',verifyJwt, logoutUser ) 
router.post("/refresh-token", refreshAccessToken)
router.post("/changePassword", verifyJwt, changeCurentPassword)
router.get("/getCurrentUser", verifyJwt, getCurrentUser)
router.post("/updateAccountDetails", verifyJwt, updateAccountDetails)
router.patch("/updateAvatar", verifyJwt, upload.single('avatar'), updateAvatar)
router.patch("/updateCoverImage", verifyJwt, upload.single('coverImage'), updateCoverImage)
router.get('/c/:username', verifyJwt, getChannelInfo)
router.get('/getAllUser', getalluser)

export default router; 