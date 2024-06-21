import express from 'express';
import * as userController from '../controllers/user.controller.js';
import * as authController from '../controllers/auth.controller.js';
import { authorize, protect } from '../middlewares/auth.middleware.js';
import multer from 'multer';

/**
 * @route  User Route
 * @desc   Route used for user operations
 * @url    api/v1/user
 */
const userRouter = express.Router({ mergeParams: true });

// Multer initialisation
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 170 * 1024 * 1024, // no larger than 170mb, you can change as needed.
    fieldSize: 3 * 1024 * 1024,
  },
});

// Multer initialisation for excel
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const excel = multer({ storage });

userRouter.route('/appversion').get(userController.appVersion);

userRouter
  .route('/create')
  .post(
    protect,
    authorize('admin', 'super'),
    upload.array('file'),
    userController.createUserProfile
  );
userRouter
  .route('/getNotifications')
  .get(
    protect,
    authorize('user', 'admin', 'super'),
    userController.getNotifications
  );

userRouter
  .route('/createAdmin')
  .post(upload.array('file'), userController.createAdminUserProfile);

userRouter
  .route('/update')
  .post(
    protect,
    authorize('admin', 'user', 'super'),
    upload.array('file'),
    userController.updateUserProfile
  );

userRouter
  .route('/delete')
  .delete(protect, authorize('admin', 'user'), userController.deleteUser);

userRouter
  .route('/updateAdmin')
  .post(
    protect,
    authorize('super', 'admin'),
    upload.single('file'),
    userController.updateAdminUserProfile
  );
userRouter
  .route('/updateUserContact')
  .post(
    protect,
    authorize('user'),
    upload.single('file'),
    userController.updateUserContact
  );
//Super Admin Routes

userRouter
  .route('/upateSuperAdmin')
  .post(
    protect,
    authorize('super'),
    userController.updateSuperAdminUserProfile
  );
userRouter
  .route('/enableDisableUser')
  .post(
    protect,
    authorize('super'),
    upload.single('file'),
    userController.enableDisableUser
  );

userRouter
  .route('/enableDisableEditing')
  .post(
    protect,
    authorize('admin', 'super'),
    userController.enableDisableEditing
  );

userRouter
  .route('/enableDisableProfile')
  .post(
    protect,
    authorize('admin', 'super'),
    upload.single('file'),
    userController.enableDisableProfile
  );
userRouter
  .route('/admin')
  .get(protect, authorize('super'), userController.getAllAdmin);
userRouter
  .route('/admin/search')
  .get(protect, authorize('super'), userController.searchAllAdmin);
userRouter
  .route('/admin/profiles')
  .get(protect, authorize('super'), userController.getAllProfilesOfAdmin);

userRouter
  .route('/admin/profiles/search')
  .get(protect, authorize('super'), userController.searchAllProfilesOfAdmin);

userRouter
  .route('/admin/analytics')
  .get(protect, authorize('super'), userController.getSingleAdminAnalytics);

userRouter
  .route('/admin/export')
  .get(protect, authorize('super'), userController.exportAdminData);

userRouter
  .route('/analytics')
  .get(protect, authorize('super'), userController.getAdminAnalytics);

userRouter
  .route('/analytics/counts')
  .get(protect, authorize('super'), userController.getAdminCountAnalytics);

//Super Admin Routes
userRouter
  .route('/createBulk')
  .post(
    protect,
    authorize('admin', 'super'),
    excel.single('file'),
    userController.createUserProfileBulk
  );

userRouter
  .route('/createCloudBulk')
  .post(protect, authorize('admin'), userController.createUserProfileCloudBulk);

// Special Routes on demand

// userRouter
//   .route("/deleteFirebaseUsers")
//   .delete(userController.deleteFirebaseUser);

userRouter
  .route('/export/enquiry')
  .get(
    protect,
    authorize('admin', 'super', 'user'),
    userController.exportEnquiry
  );

export default userRouter;
