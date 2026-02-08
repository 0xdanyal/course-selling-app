const { Router } = require("express")        
const userRouter = Router();



// Import the required dependencies 
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const z = require("zod");
const { userModel } = require("../schemas");

// Post router for user to Signup
userRouter.post("/signup", async function(req, res){      

    console.log("REQ BODY:", req.body);
    //input validation using zod 
    const requiredBody = z.object({
        email: z.email(),
        password: z.string().min(3).max(100),
        firstName: z.string().min(3).max(30),
        lastName: z.string().min(3).max(30),
    });

    // Parse the request body using the requireBody.safeParse() method to validate the data format
    // "safe" parsing (doesn't throw error if validation fails)
    const parsedDataSuccess = requiredBody.safeParse(req.body);         

    //If data is not correct then return this response
    if(!parsedDataSuccess.success){                     
        return res.json({
            message: "Incorrect Format",
            error: parsedDataSuccess.error
        })
    }

    // else simply extract validated email, password, firstName, and lastName from the request body
    const {email, password, firstName, lastName} = req.body;

    // Hash the user's password using bcrypt with a salt rounds of 5
    const hashedPassword = await bcrypt.hash(password, 5)
    
    // Creating a new user in the database
    try{
        // Create a new user entry with the provided email, hashed password, firstName, lastName
        await userModel.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,   
        });
    } catch(e){
        // If there is an error during user creation, return a error message
        return res.status(400).json({
            // Provide a message indicating signup failure
            message: "You are already signup",
        });
    }
    // Send a success response back to client indicating successfully singup
    res.json({
        message: "Signed up Successfull"
    });
});

// ==========================================

userRouter.post("/signin", function(req, res){
    res.json({
        message: "Signup endpoint"
    })
})


userRouter.get("/purchases", function(req, res){         
    res.json({
        message: "Signup endpoint"
    })
})

module.exports = {                          
    userRouter: userRouter
}