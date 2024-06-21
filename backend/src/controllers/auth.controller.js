import asyncHandler from '../middlewares/async.middleware.js';
import admin from 'firebase-admin';
import User from '../models/User.js';
import ErrorResponse from '../utils/error.response.js';
import Profile from '../models/Profile.js';
import sendSMS from '../utils/sms.sender.js';

/**
 * @desc    Number Sign In User
 * @route   POST /api/v1/auth/login
 * @access  Private/User
 * @schema  Private
 */
export const loginUser = asyncHandler(async (req, res, next) => {
  // Get the Google OAuth token from the request
  const idToken = req.body.clientToken;

  // Verify the token with Firebase
  admin
    .auth()
    .verifyIdToken(idToken)
    .then(async function (decodedToken) {
      // Token is valid, create a custom token for the user
      const uid = decodedToken.uid;
      const user = await User.findOneAndUpdate(
        {
          uid: uid,
        },
        {
          $addToSet: {
            fcm_token: req.body.fcm_token,
          },
        }
      );
      let profiles, userProfile;
      // To show the users admin in drawer,
      let profile;
      if (user?.role == 'admin' || user?.role == 'super') {
        profiles = await Profile.findOne({ user: user.id });
      } else {
        profiles = await Profile.find({
          user: user.id,
          $or: [
            { isDisabled: { $exists: false } }, // Check if the field doesn't exist
            { isDisabled: false }, // Check if the field is explicitly set to false
          ],
        }).populate({
          path: 'group',
        });
        // const adminUser = await User.findById(profiles[0].group?.groupAdmin);
        // profile = await Profile.findOne({ user: adminUser._id });
        // profile = await Profile.findOne({ user: user.id });
        userProfile = await Profile.findOne({ user: user.id }).populate({
          path: 'group',
        });
        const adminUser = await User.findById(userProfile.group?.groupAdmin);
        profile = await Profile.findOne({ user: adminUser._id });
      }

      const token = user.getSignedJwtToken();
      return { user: user, profiles, userProfile, profile, token: token };
    })
    .then(function (customToken) {
      const options = {
        expires: new Date(
          Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
      };
      // Send the custom token back to the client
      let message = { success: 'Logged Successuly' };
      return res.status(200).cookie('token', customToken?.token, options).send({
        success: true,
        message,
        data: customToken,
        role: customToken?.user?.role,
      });
    })
    .catch(function (error) {
      // Token is invalid, return an error
      console.log('Error while login--->', error);
      let message = { success: 'Invalid Token' };
      return res.status(401).send({ success: false, message });
    });
});

export const loginWithEmail = asyncHandler(async (req, res, next) => {
  // Get the Google OAuth token from the request
  const uid = req.body.uid;

  // Verify the token with Firebase
  admin
    .auth()
    .getUser(uid)
    .then(async function (userRecord) {
      // Token is valid, create a custom token for the user
      const uid = userRecord.uid;
      const user = await User.findOneAndUpdate(
        {
          uid: uid,
        },
        {
          $addToSet: {
            fcm_token: req.body.fcm_token,
          },
        }
      );
      let profiles, userProfile;
      // To show the users admin in drawer,
      let profile;
      if (user?.role == 'admin' || user?.role == 'super') {
        profiles = await Profile.findOne({ user: user.id });
      } else {
        profiles = await Profile.find({
          user: user.id,
          $or: [
            { isDisabled: { $exists: false } }, // Check if the field doesn't exist
            { isDisabled: false }, // Check if the field is explicitly set to false
          ],
        }).populate({
          path: 'group',
        });
        // const adminUser = await User.findById(profiles[0].group?.groupAdmin);
        // profile = await Profile.findOne({ user: adminUser._id });
        // profile = await Profile.findOne({ user: user.id });
        userProfile = await Profile.findOne({ user: user.id }).populate({
          path: 'group',
        });
        const adminUser = await User.findById(userProfile.group?.groupAdmin);
        profile = await Profile.findOne({ user: adminUser._id });
      }

      const token = user.getSignedJwtToken();
      return { user: user, profiles, userProfile, profile, token: token };
    })
    .then(function (customToken) {
      const options = {
        expires: new Date(
          Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
      };
      // Send the custom token back to the client
      let message = { success: 'Logged Successuly' };
      return res.status(200).cookie('token', customToken?.token, options).send({
        success: true,
        message,
        data: customToken,
        role: customToken?.user?.role,
      });
    })
    .catch(function (error) {
      // Token is invalid, return an error
      let message = { success: 'Invalid Token' };
      return res.status(401).send({ success: false, message });
    });
});

/**
 * @desc    Check if user registered
 * @route   POST /api/v1/auth/checkuser
 * @access  Private/User
 * @schema  Private
 */
export const checkUser = asyncHandler(async (req, res, next) => {
  if (!req?.body?.phone) {
    return next(new ErrorResponse('Please pass phone number', 400));
  }
  const user = await User.findOne({ username: req?.body?.phone });
  if (user && user.isDisabled)
    return res
      .status(420)
      .send({ success: false, message: 'User is disabled' });
  if (user) {
    const customAuthToken = await admin.auth().createCustomToken(user.uid);
    let message = { success: 'User Registered' };
    return res.json({
      success: true,
      message,
      authToken: customAuthToken,
      otp: 1234,
    });
  } else if (req?.body?.isContactUpdate == true) {
    let message = { success: 'User created successfully' };
    let usr;
    try {
      usr = await admin.auth().getUserByPhoneNumber(req?.body?.phone);
    } catch (e) {
      usr = null;
    }
    if (usr == null)
      usr = await admin.auth().createUser({
        phoneNumber: req?.body?.phone,
        displayName: '',
        disabled: false,
      });
    const customAuthToken = await admin.auth().createCustomToken(usr?.uid);
    return res.status(400).json({
      success: true,
      message,
      authToken: customAuthToken,
      otp: 1234,
    });
  }
  return next(new ErrorResponse('User not registered', 400));
});

/**
 * @desc    Get User Session
 * @route   GET /api/v1/auth/session
 * @access  Private/User
 * @schema  Private
 */
export const getUserSession = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (user && user.isDisabled)
    return res
      .status(420)
      .json({ success: false, message: 'User is disabled' });
  let profiles, userProfile;
  // To show the users admin in drawer,
  let profile;
  if (user?.role == 'admin' || user?.role == 'super') {
    profiles = await Profile.findOne({ user: user.id });
  } else {
    profiles = await Profile.find({
      user: user.id,
      $or: [
        { isDisabled: { $exists: false } }, // Check if the field doesn't exist
        { isDisabled: false }, // Check if the field is explicitly set to false
      ],
    }).populate({
      path: 'group',
    });

    userProfile = await Profile.findOne({ user: user.id }).populate({
      path: 'group',
    });
    const adminUser = await User.findById(userProfile.group?.groupAdmin);
    profile = await Profile.findOne({ user: adminUser._id });
  }

  let message = { success: 'User Fetched' };
  return res.json({
    success: true,
    message,
    data: { user, profiles, profile, userProfile },
    role: user?.role,
  });
});

/**
 * @desc    logout
 * @route   POST /api/v1/auth/logout
 * @access  Private/User
 * @schema  Private
 */

export const logoutUser = asyncHandler(async (req, res, next) => {
  try {
    await User.updateOne(
      { _id: req.body.id },
      { $pull: { fcm_token: req.body.fcm_token } }
    );
    res.status(200).json({ message: 'Successfully logged out' });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: e });
  }
});
