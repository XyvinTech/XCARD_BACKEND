import express from 'express';
import * as profileController from '../controllers/profile.controller.js';
import { authorize, protect } from '../middlewares/auth.middleware.js';
import multer from 'multer';

/**
 * @route  Profile Route
 * @desc   Route used for profile operations
 * @url    api/v1/profile
 */
const profileRouter = express.Router({ mergeParams: true });

// Multer initialisation
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 170 * 1024 * 1024, // no larger than 170mb, you can change as needed.
    fieldSize: 3 * 1024 * 1024,
  },
});

profileRouter
  .route('/:id')
  .get(
    // protect,
    // authorize('admin', 'user', 'super'),
    profileController.getProfile
  )
  .post(protect, authorize('admin', 'super'), profileController.updateProfile)
  .delete(
    protect,
    authorize('admin', 'super'),
    profileController.deleteProfile
  );

profileRouter
  .route('/view/:id')
  .get(protect, authorize('admin', 'user'), profileController.getProfile);

profileRouter
  .route('/duplicate/:profileId')
  .post(
    protect,
    authorize('admin', 'super'),
    profileController.duplicateProfile
  );

export default profileRouter;
