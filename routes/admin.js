const { Router } = require("express")        
const adminRouter = Router();
const {adminModel} = require("../schemas")
const {courseModel} = require("../schemas")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const z = require("zod");
const { authMiddleware } = require("../middleware/Authmiddleware");


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



// admin route for creating a course============================================
adminRouter.post("/create-course", authMiddleware, async function(req,res) {
    // Get the adminId from the request object
    const adminId = req.userId;
    // console.log(req.userId);

    // Validate the request body data using zod schema
    const requireBody = z.object({
        title: z.string().min(3),
        description: z.string().min(10),
        imageUrl: z.url(),
        price: z.number().positive(),
    });
    // Parse and validate the request body data
    const parseDataWithSuccess = requireBody.safeParse(req.body);

    // If the data format is incorrect, send an error message to the client
    if(!parseDataWithSuccess){
        return res.json({
            message: "Incorrect data format",
            error: parseDataWithSuccess.error,
        });
    }

    // Get title, description, imageURL, price from the request body
    const {title,description,imageUrl,price} = req.body;

    // Create a new course with the given title, description, imageURL, price, creatorId
    const course = await courseModel.create({
        title:title,
        description:description,
        imageUrl:imageUrl,
        price:price,
        creatorId:adminId,
    });

    // Respond with a success message if the course is created successfully
    res.status(201).json({
        message: "Course Created",
        courseId: course._id,
    });
});

// admin to upadte a course========================================================
adminRouter.put("/update-course", authMiddleware, async function(req,res) {
    // Get the adminId from the request object, set by the admin middleware
    const adminId = req.userId;

    // Define a schema using zod to validate the request body for updating a course
    const requireBody = z.object({
        courseId: z.string().min(5), // Ensure course ID is at least 5 characters
        title: z.string().min(3).optional(), // Title is optional
        description: z.string().min(5).optional(), // Description is optional
        imageUrl: z.string().min(5).optional(), // Image URL is optional
        price: z.number().positive().optional(), // Price is optional
    });

    // Parse and validate the incoming request body against the schema
    const parseDataWithSuccess = requireBody.safeParse(req.body);

    // If validation fails, respond with an error message and the details of the error
    if(!parseDataWithSuccess){
        return res.json({
            message: "Incorrect data format",
            error: parseDataWithSuccess.error,
        });
    }

    // Destructure the validated fields from the request body
    const {title,description,imageUrl,price,courseId} = req.body;

    // Attempt to find the course in the database using the provided courseId and adminId
    const course = await courseModel.findOne({
        _id: courseId, // Match the course by ID
        creatorId: adminId, // Ensure the admin is the creator
    });

    // If the course is not found, respond with an error message
    if(!course){
        return res.status(404).json({
            message: "Course not found!", // Inform the client that the specified course does not exist
        });
    }

    // Update the course details in the database using the updates object
    await courseModel.updateOne({
        // below these two lines can protect admins update each other courses.
        _id: courseId, // Match the course by ID
        creatorId: adminId, // Ensure the admin is the creator
    },
    {
        // It uses the provided courseId and adminId to identify the course. For each field (title, description, imageUrl, price), if a new value is provided, it is used to update the course. If a field is not provided, the existing value from the database is kept.
        title: title || course.title,
        description: description || course.description,
        imageUrl: imageUrl || course.imageUrl,
        price: price || course.price,
    });

    // Respond with a success message upon successful course update
    res.status(200).json({
        message: "Course updated!", // Successfully course updated or not
    });
});


// admin routes for getting all courses at once
adminRouter.get("/courses", authMiddleware, async function(req,res){
    // Get the adminId from the request object of the middleware
    const adminId = req.adminId;

    // Find all the courses with given creatorId
    const courses = await courseModel.find({
        creatorId: adminId,
    });

    // Respond with the courses if they are found successfully
    res.json({
        message: "Courses fetched successfuly!",
        courses: courses,
    });
});

module.exports = {
    adminRouter: adminRouter
}



