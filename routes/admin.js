const { Router } = require("express")        
const adminRouter = Router();
const {adminModel} = require("../schemas")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const z = require("zod");


adminRouter.post("/signup", async function(req, res){   
   // console.log("REQ BODY:", req.body);
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
   
       // Hash the admin's password using bcrypt with a salt rounds of 5
       const hashedPassword = await bcrypt.hash(password, 5)
       
       // Creating a new admin in the database
       try{
           // Create a new admin entry with the provided email, hashed password, firstName, lastName
           await adminModel.create({
               email,
               password: hashedPassword,
               firstName,
               lastName,   
           });
       } catch(e){
           // If there is an error during admin creation, return a error message
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


   // =================================================================

adminRouter.post("/signin", async function(req, res){

   // Define the schema for validating the request body data using zod
    const requireBody = z.object({
        email: z.email(),
        password: z.string().min(6)
    });
    // Parse and validate the incomng request body data
    const parsedDataWithSuccess = requireBody.safeParse(req.body);

    // If validation fails, return a error with the validation error details
    if(!parsedDataWithSuccess.success){
        return res.json({
            message: "Incorrect Data Fotrmat",
            error: parsedDataWithSuccess.error,
        });
    };

    // Extract validated email and password from the body
    const { email, password } = req.body
    // fetch the admin from DB
    const user = await adminModel.findOne({
        email: email,
    });

    // If the user is not found, return a error indicating incorrect credentials
    if(!user){
        return res.status(403).json({
            message:"User doesn't exist!"
        });
    }

    // Compare the provided password with the stored hashed password using bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);

    // If the password matches, create a jwt token and send it to the client
    if(passwordMatch){

                // console.log("JWT SECRET KEY =", process.env.JWT_SECRET_KEY);

        // Create a jwt token using the jwt.sign() method
        const token = jwt.sign(
            {id: user._id},
            process.env.JWT_SECRET_KEY,
            { expiresIn: "1d" }
        );


        // Send the generated token back to client
        res.status(200).json({
      msg: "Login successful",
      token: token,
    });

    }else{
        // If the password does not match, return a error indicating the invalid credentials
        res.status(403).json({
            // Error message for failed password comparison
            message:"Invalid password!"
        })
    }
});

module.exports = {
    adminRouter: adminRouter
}
