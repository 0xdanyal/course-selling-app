const jwt = require("jsonwebtoken");
function authMiddleware(req, res, next){
    const token = req.headers.token;
    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);
        // Set the userId in the request object from the decoded token for later use
        // console.log(decoded.id)
        req.userId = decoded.id;
        next();
    }catch(e){
        return res.status(403).json({
            message: "You are not signed in!",
        });
    }
}


module.exports = {
    authMiddleware: authMiddleware
}