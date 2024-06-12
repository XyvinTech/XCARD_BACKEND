import express from "express";
import * as infoController from "../controllers/info.controller.js";

/**
 * @route  Information Route
 * @desc   Route used for information operations
 * @url    api/v1/information
 */
const informationRouter = express.Router({ mergeParams: true });

informationRouter.route("/terms").get(infoController.viewTerms);
informationRouter.route("/privacy").get(infoController.viewPrivacy);

export default informationRouter;
