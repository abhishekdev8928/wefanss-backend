const UserModel = require("../models/user-model");
const jwt = require("jsonwebtoken"); 

const authenticate = async (req, res, next) => {
  console.log(req.headers.authorization)
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    
    const token = authHeader.split(" ")[1];
    
    let decoded;
    try {
      if (!process.env.JWT_SECRET_KEY) {
        throw new Error("JWT_SECRET_KEY not configured");
      }
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: err.name === "TokenExpiredError"
          ? "Session expired. Please login again."
          : "Invalid token"
      });
    }

   
    
   
    const user = await UserModel.findById(decoded.sub).select("-password");
    console.log("User:", user);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }
    
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Account inactive"
      });
    }
    
    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;
    next();
  } catch (err) {
    console.error("Auth error:", err); 
    return res.status(500).json({
      success: false,
      message: "Authentication failed"
    });
  }
};

module.exports = authenticate;