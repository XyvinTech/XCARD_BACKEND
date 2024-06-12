import asyncHandler from '../middlewares/async.middleware.js';
import admin from 'firebase-admin';
import User from '../models/User.js';
import axios from 'axios';
import Profile from '../models/Profile.js';
import ErrorResponse from '../utils/error.response.js';
import { uploadFiles, uploadFile } from '../utils/file.upload.js';
import getRandomFileName from '../helpers/filename.helper.js';
import QRCode from 'qrcode';
import { nanoid, customAlphabet } from 'nanoid';
const randomId = customAlphabet('0123456789ABCDEFGHIJKLMNOP', 8);

/**
 * @desc    Get user profile by id
 * @route   GET /api/v1/profile/:id
 * @access  Private/Admin Private/User
 * @schema  Private
 */
export const getProfile = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findById(req?.params?.id).populate({
    path: 'group',
  });
  let message = { success: 'Profile Fetched Successfuly' };
  return res.status(200).send({ success: true, message, data: profile });
});

/**
 * @desc    Write Profile Write COunt
 * @route   POST /api/v1/profile/:id
 * @access  Private/Admin
 * @schema  Private
 */
export const updateProfile = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findByIdAndUpdate(
    req?.params?.id,
    {
      $inc: { 'card.cardWrited': 1 },
    },
    { new: true }
  ).populate({
    path: 'group',
  });
  let message = { success: 'Profile Writted Successfuly' };
  return res.status(200).send({ success: true, message, data: profile });
});

/**
 * @desc    Delete Profile
 * @route   DELETE /api/v1/profile/:id
 * @access  Private/Admin
 * @schema  Private
 */
export const deleteProfile = asyncHandler(async (req, res, next) => {
  const { id } = req?.params;
  const checkProfile = await Profile.findById(id).populate({
    path: 'user',
  });
  const userProfilesCount = await Profile.find({
    user: checkProfile?.user._id,
  }).count();
  //Delete User If The User Has One Profle
  if (userProfilesCount == 1) {
    return admin
      .auth()
      .deleteUser(checkProfile?.user.uid)
      .then(async () => {
        //TODO: Delete All Profile, Product Images
        // Delete Mongo User Profile
        await User.findByIdAndDelete(checkProfile?.user?._id);
        await Profile.findByIdAndDelete(id);
        let message = { success: 'Profile Deleted' };
        return res.status(200).send({ success: true, message });
      })
      .catch((err) => {
        return next(
          new ErrorResponse(`Something went wrong ${err?.errorInfo?.code}`, 400)
        );
      });
  }
  //TODO: Delete All Profile, Product Images
  await Profile.findByIdAndDelete(id);
  let message = { success: 'Profile Deleted' };
  return res.status(200).send({ success: true, message });
});

/**
 * @desc    Public User EJS
 * @route   GET /api/v1/profile/view/:id
 * @access  Public
 * @schema  Public
 */
export const viewProfile = asyncHandler(async (req, res, next) => {
  console.log('viewProfile called');
  const profile = await Profile.findOneAndUpdate(
    { 'card.cardId': req?.params?.id },
    { $inc: { visitCount: 1 } }
  );
  const profileTheme = profile?.card?.theme;
  /*
  Themes

    'gold&black',
    'white&black',
    'violet&green',
    'orange&black',
    'white&blue',
    'blue&black'
    'restaturants'

  */

  if (profileTheme == 'gold&black') {
    res.render('gold-black', { data: profile });
  } else if (profileTheme == 'white&black') {
    res.render('white-black', { data: profile });
  } else if (profileTheme == 'orange&black') {
    res.render('orange-black', { data: profile });
  } else if (profileTheme == 'white&blue') {
    res.render('white-blue', { data: profile });
  } else if (profileTheme == 'blue&black') {
    res.render('blue-black', { data: profile });
  } else if (profileTheme == 'aero&black') {
    res.render('sky-blue', { data: profile });
  } else if (profileTheme == 'restaturants') {
    res.render('sienna', { data: profile });
  } else {
    res.render('index', { data: profile });
  }
});
/**
 * @desc    Public User EJS
 * @route   GET /api/v1/profile/view/:id
 * @access  Public
 * @schema  Public
 */
export const submitForm = asyncHandler(async (req, res, next) => {
  try {
    const { id, name, phone, email, message } = req.body;
    const profile = await Profile.findByIdAndUpdate(
      { _id: id },
      {
        $push: {
          'form.forms': {
            name: name,
            phone: phone,
            email: email,
            message: message,
          },
        },
        $inc: { 'form.status': 1 },
      },
      { new: true }
    ).populate('user', 'fcm_token');
    if (!profile || !profile.user) {
      throw new Error('Profile not found or user reference not available.');
    }
    let payload = {};
    const tokens = profile.user.fcm_token;
    const messaging = admin.messaging();
    const notificationStatus =
      profile.form.status == null ? 0 : profile.form.status;
    console.log(notificationStatus);
    await tokens.forEach(async (element) => {
      payload = {
        token: element,
        notification: {
          title: name,
          body: `${email}\nPhone: ${phone}\n${message}`,
          sound: 'default',
        },
        data: {
          status: `${notificationStatus}`,
          ...req.body,
        },
        android: {
          priority: 'high',
        },
        apns: {
          payload: {
            aps: {
              'content-available': true,
            },
          },
          fcm_options: {},
        },
      };
      await messaging.send(payload).then((message) => {
        console.log('message sent');
      });
    });
    res.status(200).json({ message: 'Form submission successful' });
  } catch (e) {
    console.log(e);
    res.status(500).json({ e });
  }
});

export const duplicateProfile = async (req, res, next) => {
  try {
    const { profileId } = req.params;
    const { name, email, phone } = req.body; // New phone number from the request body

    let newProfile;
    // Find the profile to duplicate
    const profileToDuplicate = await Profile.findById(profileId);
    if (!profileToDuplicate) {
      return res
        .status(404)
        .send({ success: false, message: 'Profile not found' });
    }
    // Generate cardId and profileLink
    const cardId = `${name
      .toLowerCase()
      .split(' ')
      .join('')}-${randomId().toLowerCase()}`;
    const profileLink = `${process.env.HOST_URL_HTTPS}/profile/${cardId}`;

    // Generate QR Code
    const qrOptions = {
      scale: 34,
      color: { dark: '#BEFF6C', light: '#1C1C1E' },
    }; // Adjust these options as needed
    const qrCode = await QRCode.toBuffer(profileLink, qrOptions);
    const qrFile = { buffer: qrCode, mimetype: 'image/jpeg' };
    const qrImageUrl = await uploadFile(
      qrFile,
      'cards',
      getRandomFileName('card-')
    );

    await admin
      .auth()
      .createUser({
        email: email,
        password: phone, // User's password
        phoneNumber: phone,
        displayName: name,
        disabled: false,
      })
      .then(async (userRecord) => {
        //If new user enters create single user and profile.
        const user = await User.create({
          username: phone,
          uid: userRecord?.uid,
          role: 'user',
          providerData: userRecord?.providerData,
        });

        // Convert to a plain object and remove the _id to ensure a new document is created
        const duplicatedData = profileToDuplicate.toObject();
        delete duplicatedData._id;

        // Update the Profile name
        duplicatedData.profile.name = name;

        // Replace the phone number in the contacts
        if (duplicatedData.contact && duplicatedData.contact.contacts) {
          duplicatedData.contact.contacts = duplicatedData.contact.contacts.map(
            (contact) => {
              if (contact.type === 'phone') {
                return { ...contact, value: phone }; // Set the new phone number
              }
              if (contact.type === 'email') {
                return { ...contact, value: email }; // Set the new email
              }
              return contact;
            }
          );
        }
        duplicatedData.user = user?.id;
        duplicatedData.card = {
          ...duplicatedData.card,
          cardId,
          theme: duplicatedData.card?.theme,
        }; // Assuming 'theme' is part of the card object
        duplicatedData.profile = {
          ...duplicatedData.profile,
          profileLink,
          profileQR: qrImageUrl,
        };
        duplicatedData.visitCount = 0;
        duplicatedData.form = {
          status: 0,
          forms: [],
        };

        // Create the new profile
        newProfile = new Profile(duplicatedData);
        await newProfile.save();
      })
      .catch(async (error) => {
        //If User already exisits create second or third profile
        if (
          error?.errorInfo?.code === 'auth/phone-number-already-exists' ||
          error?.errorInfo?.code === 'auth/email-already-exists'
        ) {
          let userRecord;
          // If email already exists, try to get the user by email
          if (error?.errorInfo?.code === 'auth/email-already-exists') {
            console.log('Fetching user details by email from Firebase');
            userRecord = await admin.auth().getUserByEmail(email);
          }
          // If phone number already exists, try to get the user by phone number
          else if (
            error?.errorInfo?.code === 'auth/phone-number-already-exists'
          ) {
            console.log('Fetching user details by phone number from Firebase');
            userRecord = await admin.auth().getUserByPhoneNumber(phone);
          }
          let user = await User.findOne({ username: phone });

          if (user == null) {
            user = await User.create({
              username: phone,
              uid: userRecord?.uid,
              role: 'user',
              providerData: userRecord?.providerData,
            });
          }
          const duplicatedData = profileToDuplicate.toObject();
          delete duplicatedData._id;

          // Update the Profile name
          duplicatedData.profile.name = name;

          // Replace the phone number in the contacts
          if (duplicatedData.contact && duplicatedData.contact.contacts) {
            duplicatedData.contact.contacts =
              duplicatedData.contact.contacts.map((contact) => {
                if (contact.type === 'phone') {
                  return { ...contact, value: phone }; // Set the new phone number
                }
                if (contact.type === 'email') {
                  return { ...contact, value: email }; // Set the new email
                }
                return contact;
              });
          }
          duplicatedData.user = user?.id;
          duplicatedData.card = {
            ...duplicatedData.card,
            cardId,
            theme: duplicatedData.card?.theme,
          }; // Assuming 'theme' is part of the card object
          duplicatedData.profile = {
            ...duplicatedData.profile,
            profileLink,
            profileQR: qrImageUrl,
          };
          duplicatedData.visitCount = 0;
          duplicatedData.form = {
            status: 0,
            forms: [],
          };

          // Create the new profile
          newProfile = new Profile(duplicatedData);
          await newProfile.save();
        }
      });

    // Send back the new profile data
    res.status(201).send({ success: true, data: newProfile });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
