const mongoose = require('mongoose');
const express = require('express');
const connect  = require("./utils/connectDb")

const { userRouter }  = require("./routes/user")
const {courseRouter} = require("./routes/course")
const {adminRouter} = require("./routes/admin")

const app = express();
const PORT = 3000;

app.use("/user", userRouter);  
app.use("/course", courseRouter);      
app.use("/admin", adminRouter);



app.listen(PORT, () => {
  connect();
  console.log(`listening at port ${PORT}`);
});