const mongoose = require('mongoose');
const express = require('express');
const app = express();

// const { userRouter } = require("./routes/user")
// const {  courseRouter } = require("./routes/course")
// const { adminRouter } = require("./routes/admin")

const { userRouter }  = require("./routes/user")
const {courseRouter} = require("./routes/course")


app.use("/user", userRouter);  
app.use("/course", courseRouter);      
// app.use("/course", courseRouter)    
// app.use("/admin", adminRouter)

async function main(){               
    app.listen(3000);       

}

main();