import express from 'express';
import * as groupController from '../controllers/group.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import multer from 'multer';

/**
 * @route  Group Route
 * @desc   Route used for all group
 * @url    api/v1/group
 */
const groupRouter = express.Router({ mergeParams: true });

// Multer initialisation
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 170 * 1024 * 1024, // no larger than 170mb, you can change as needed.
    fieldSize: 3 * 1024 * 1024,
  },
});

groupRouter
  .route('/')
  .get(protect, authorize('admin'), groupController.getAllGroup);

groupRouter
  .route('/admin')
  .get(protect, authorize('super'), groupController.getAllAdminGroup);

groupRouter.route('/admin/search').get(groupController.searchAllAdminGroup);

groupRouter
  .route('/create')
  .post(protect, authorize('admin', 'super'), groupController.createGroup);

groupRouter
  .route('/:id/profile')
  .get(
    protect,
    authorize('admin', 'super'),
    groupController.getAllProfilesInGroup
  );

groupRouter
  .route('/:id/profile/search')
  .get(protect, authorize('admin', 'super'), groupController.searchProfile);

groupRouter
  .route('/edit/:id')
  .put(
    protect,
    authorize('admin', 'super'),
    upload.single('file'),
    groupController.editGroup
  );

groupRouter
  .route('/search')
  .get(protect, authorize('admin'), groupController.searchGroup);

groupRouter
  .route('/profile/move')
  .put(
    protect,
    authorize('admin', 'super'),
    groupController.moveProfileToGroup
  );

groupRouter
  .route('/:groupId/delete')
  .delete(protect, authorize('super', 'admin'), groupController.deleteGroup);

export default groupRouter;
