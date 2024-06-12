import asyncHandler from "../middlewares/async.middleware.js";
import jwt from "jsonwebtoken";
import ErrorResponse from "../utils/error.response.js";
import User from "../models/User.js";

const protect = asyncHandler(async (req, res, next) => {
  const { sign, verify } = jwt;
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    // Token is invalid, return an error
    let message = { success: "Invalid Token" };
    return res.status(401).send({ success: false, message });
  }
});

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

export { protect, authorize };
