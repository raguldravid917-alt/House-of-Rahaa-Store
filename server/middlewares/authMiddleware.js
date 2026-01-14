import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

// --- 1. REQUIRE SIGN IN (User Login Check) ---
export const requireSignIn = async (req, res, next) => {
  try {
    // Header இருக்கிறதா என்று பார்ப்போம்
    if (!req.headers.authorization) {
      return res.status(401).send({
        success: false,
        message: "Login Required (Token Missing)",
      });
    }

    // Token-ஐ டீகோட் செய்கிறோம்
    const decode = JWT.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    
    // டீகோட் செய்த தகவலை req.user-ல் வைக்கிறோம்
    req.user = decode;
    next();
  } catch (error) {
    console.log("Auth Error:", error.message);
    res.status(401).send({
      success: false,
      message: "Invalid Token or Session Expired",
    });
  }
};

// --- 2. IS ADMIN (Admin Role Check) ---
export const isAdmin = async (req, res, next) => {
  try {
    // req.user._id என்பது லாகின் செய்தவரின் ஐடி
    const user = await userModel.findById(req.user._id);

    // ரோல் 1 இல்லையென்றால் லாக் பண்ணிவிடுவோம்
    if (user.role !== 1) {
      return res.status(401).send({
        success: false,
        message: "Gallery vault is temporarily locked", // உன் விருப்பப்படி மாற்றப்பட்டது
      });
    } else {
      // அட்மின் என்றால் அடுத்த கட்டத்திற்கு அனுமதி
      next();
    }
  } catch (error) {
    console.log("Admin Middleware Error:", error);
    res.status(401).send({
      success: false,
      error: error.message,
      message: "Error in admin middleware",
    });
  }
};