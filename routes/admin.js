const { Router } = require("express")        
const adminRouter = Router();
const {adminModel} = require("../schemas")

adminRouter.post("/signup", function(req, res){   
    res.json({
        message: "Signup endpoint"
    })
})

adminRouter.post("/signin", function(req, res){
    res.json({
        message: "Signup endpoint"
    })
})

module.exports = {
    adminRouter: adminRouter
}