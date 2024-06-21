import asyncHandler from "../middlewares/async.middleware.js";

/**
 * @desc    Terms and Conditions
 * @route   GET /api/v1/information/terms
 * @access  Public
 * @schema  Public
 */
export const viewTerms = asyncHandler(async (req, res, next) => {
  res.render("terms");
});

/**
 * @desc    Privacy and {olicy}
 * @route   GET /api/v1/information/privacy
 * @access  Public
 * @schema  Public
 */
export const viewPrivacy = asyncHandler(async (req, res, next) => {
  res.render("privacy");
});
