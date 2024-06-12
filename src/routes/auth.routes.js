import express from "express";
import * as authController from "../controllers/auth.controller.js";
import { authorize, protect } from "../middlewares/auth.middleware.js";

/**
 * @route  Authentication Route
 * @desc   Route used for all authentications
 * @url    api/v1/auth
 */
const authRouter = express.Router({ mergeParams: true });

authRouter
  .route("/session")
  .get(
    protect,
    authorize("user", "admin", "super"),
    authController.getUserSession
  );
authRouter.route("/checkuser").post(authController.checkUser);
authRouter.route("/login").post(authController.loginUser);
authRouter.route("/login-email").post(authController.loginWithEmail);
authRouter.route("/logout").post(authController.logoutUser);

export default authRouter;
