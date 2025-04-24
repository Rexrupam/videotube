import connectdb from "./db/dbindex.js";
import dotenv from "dotenv"
import app from "./app.js"

dotenv.config({
    path: '../.env'
})


connectdb()
    .then(() => {
        
        app.listen(process.env.PORT, () => {
            console.log(`Server listening on port : ${process.env.PORT}`)

        })

    }).catch(err => {
        console.log("MONGODB connection error: ", err)
    })




