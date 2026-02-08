const express = require('express');
const connect  = require("./utils/connectDb")
const dotenv = require('dotenv').config()

const { userRouter }  = require("./routes/user")
const {courseRouter} = require("./routes/course")
const {adminRouter} = require("./routes/admin")

// dotenv.config({ path: "./config/.env" }); // path to my .env varibles ( hidden )


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/user", userRouter);  
app.use("/course", courseRouter);      
app.use("/admin", adminRouter);



app.listen(PORT, () => {
  connect();
  console.log(`listening at port ${PORT}`);
}); 