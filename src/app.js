import express from "express"
import cookieParser from "cookie-parser";
import cors from "cors"
import userRoutes from "./routes/user.routes.js"
import tweetRoutes from "./routes/tweet.routes.js"
import videoRoute from "./routes/video.routes.js"
import commentRoute from "./routes/comment.routes.js"
const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "16kb" }))
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

//routes
app.use('/users', userRoutes)
app.use('/usertweet', tweetRoutes)
app.use('/video', videoRoute)
app.use('/comment', commentRoute)
export default app;