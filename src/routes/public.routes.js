import express from "express";
import * as profileController from "../controllers/profile.controller.js";

/**
 * @route  Public Route
 * @desc   Route used for public operations
 * @url    api/v1/profile
 */
const publicRouter = express.Router({ mergeParams: true });

publicRouter.route("/:id").get(profileController.viewProfile);
publicRouter.route("/submitForm").post(profileController.submitForm);

export default publicRouter;
