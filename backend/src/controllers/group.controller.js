import asyncHandler from '../middlewares/async.middleware.js';
import admin from 'firebase-admin';
import { getStorage, ref, uploadBytes, deleteObject } from 'firebase/storage';
import User from '../models/User.js';
import ErrorResponse from '../utils/error.response.js';
import Group from '../models/Group.js';
import fs from 'fs';
import { uploadFile, deleteFile } from '../utils/file.upload.js';
import getRandomFileName from '../helpers/filename.helper.js';
import { group } from 'console';
import Profile from '../models/Profile.js';
import { Types } from 'mongoose';

/**
 * @desc    Create new group
 * @route   POST /api/v1/group/create
 * @access  Private/Admin/Super
 * @schema  Private
 */
export const createGroup = asyncHandler(async (req, res, next) => {
  const { name, userId } = req?.body;
  let adminId;
  if (!name) {
    return next(new ErrorResponse('Please provide group name', 400));
  }
  if (userId) {
    adminId = userId;
  } else {
    adminId = req?.user?.id;
  }
  const group = await Group.create({ name, groupAdmin: adminId });
  let message = { success: 'Group Created' };
  return res.status(201).send({ success: true, message, data: group });
});

/**
 * @desc    Edit group by id
 * @route   PUT /api/v1/group/edit/:id
 * @access  Private/Admin
 * @schema  Private
 */
export const editGroup = asyncHandler(async (req, res, next) => {
  const file = req?.file;

  const checkGroup = await Group.findById(req?.params?.id);
  if (!checkGroup) {
    return next(new ErrorResponse("Group doesn't exists", 400));
  }
  if (
    checkGroup != null &&
    checkGroup?.groupPicture != null &&
    file != undefined
  ) {
    await deleteFile(checkGroup?.groupPicture?.key);
  }
  const { name } = req?.body;
  await uploadFile(file, 'groups', getRandomFileName('group-'))
    .then(async (result) => {
      const group = await Group.findByIdAndUpdate(
        req?.params?.id,
        {
          name,
          groupPicture: result,
        },
        { returnOriginal: false }
      );
      let message = { success: 'Group Edited Successfuly' };
      return res.status(200).send({ success: true, message, data: group });
    })
    .catch(async (e) => {
      // Catch if image is not being edited
      const group = await Group.findByIdAndUpdate(
        req?.params?.id,
        {
          name,
        },
        { returnOriginal: false }
      );
      let message = { success: 'Group Edited Successfuly' };
      return res.status(200).send({ success: true, message, data: group });
    });
});

/**
 * @desc    Get All Profiles In the Group
 * @route   GET /api/v1/group/:id/profile/
 * @access  Private/Admin
 * @schema  Private
 */
export const getAllProfilesInGroup = asyncHandler(async (req, res, next) => {
  if (!req?.params?.id) {
    return next(new ErrorResponse('Please provide group id', 400));
  }
  const profiles = await Profile.find({ group: req?.params?.id }).populate({
    path: 'group',
  });
  let message = { success: 'Profiles Fetched' };
  return res.status(200).send({ success: true, message, data: profiles });
});

/**
 * @desc    Get All Group Based on Admin
 * @route   GET /api/v1/group
 * @access  Private/Admin
 * @schema  Private
 */
export const getAllGroup = asyncHandler(async (req, res, next) => {
  const group = await Group.aggregate([
    {
      $match: {
        groupAdmin: new Types.ObjectId(req?.user?.id),
      },
    },
    {
      $lookup: {
        from: 'profiles',
        localField: '_id',
        foreignField: 'group',
        as: 'profiles',
      },
    },
    {
      $project: {
        name: 1,
        groupAdmin: 1,
        groupPicture: 1,
        createdAt: 1,
        updatedAt: 1,
        userCount: {
          $size: '$profiles',
        },
      },
    },
    {
      $sort: {
        userCount: -1,
      },
    },
  ]);
  let message = { success: 'All Groups' };
  return res.status(200).send({ success: true, message, data: group });
});

/**
 * @desc    Get All Group Based of a particular Admin
 * @route   GET /api/v1/group/admin
 * @access  Private/Super
 * @schema  Private
 */
export const getAllAdminGroup = asyncHandler(async (req, res, next) => {
  const group = await Group.aggregate([
    {
      $match: {
        groupAdmin: new Types.ObjectId(req?.query?.id),
      },
    },
    {
      $lookup: {
        from: 'profiles',
        localField: '_id',
        foreignField: 'group',
        as: 'profiles',
      },
    },
    {
      $project: {
        name: 1,
        groupAdmin: 1,
        groupPicture: 1,
        createdAt: 1,
        updatedAt: 1,
        userCount: {
          $size: '$profiles',
        },
      },
    },
    {
      $sort: {
        userCount: -1,
      },
    },
  ]);
  let message = { success: 'All Groups' };
  return res.status(200).send({ success: true, message, data: group });
});

/**
 * @desc    Search All Group Based of a particular Admin
 * @route   GET /api/v1/group/admin/search?query
 * @access  Private/Super
 * @schema  Private
 */
export const searchAllAdminGroup = asyncHandler(async (req, res, next) => {
  const searchQuery = req.query.query;
  const group = await Group.aggregate([
    {
      $match: {
        groupAdmin: new Types.ObjectId(req?.query?.id),
        name: { $regex: searchQuery, $options: 'i' },
      },
    },
    {
      $lookup: {
        from: 'profiles',
        localField: '_id',
        foreignField: 'group',
        as: 'profiles',
      },
    },
    {
      $project: {
        name: 1,
        groupAdmin: 1,
        groupPicture: 1,
        createdAt: 1,
        updatedAt: 1,
        userCount: {
          $size: '$profiles',
        },
      },
    },
    {
      $sort: {
        userCount: -1,
      },
    },
  ]);
  let message = { success: 'All Groups' };
  return res.status(200).send({ success: true, message, data: group });
});

/**
 * @desc    Search for group
 * @route   GET /api/v1/group/search
 * @access  Private/Admin
 * @schema  Private
 */
export const searchGroup = asyncHandler(async (req, res, next) => {
  const searchQuery = req.query.query;
  const group = await Group.aggregate([
    {
      $match: {
        groupAdmin: new Types.ObjectId(req?.user?.id),
        name: { $regex: searchQuery, $options: 'i' },
      },
    },
    {
      $lookup: {
        from: 'profiles',
        localField: '_id',
        foreignField: 'group',
        as: 'profiles',
      },
    },
    {
      $project: {
        name: 1,
        groupAdmin: 1,
        groupPicture: 1,
        createdAt: 1,
        updatedAt: 1,
        userCount: {
          $size: '$profiles',
        },
      },
    },
    {
      $limit: 15,
    },
  ]);
  let message = { success: 'All Groups' };
  return res.status(200).send({ success: true, message, data: group });
});

/**
 * @desc    Search All Profiles In the Group
 * @route   GET /api/v1/group/:id/profile/
 * @access  Private/Admin
 * @schema  Private
 */
export const searchProfile = asyncHandler(async (req, res, next) => {
  const searchQuery = req.query.query;
  if (!req?.params?.id) {
    return next(new ErrorResponse('Please provide group id', 400));
  }
  let filter = {};

  const profiles = await Profile.find({
    group: req?.params?.id,
    'profile.name': { $regex: searchQuery.toLowerCase(), $options: 'i' },
  }).populate({
    path: 'group',
  });
  let message = { success: 'Profiles Fetched' };
  return res.status(200).send({ success: true, message, data: profiles });
});

/**
 * @desc    Move Profile to a group
 * @route   GET /api/v1/group/:id/profile/
 * @access  Private/Admin
 * @schema  Private
 */
export const moveProfileToGroup = async (req, res, next) => {
  try {
    const { profileId, newGroupId } = req?.body;

    let update = { group: newGroupId };
    // if (userId) {
    //   // Update user field only if userId is provided
    //   update.user = userId;
    // }

    const updatedProfile = await Profile.findByIdAndUpdate(profileId, update, {
      new: true,
    });

    // Check if the profile was successfully updated
    if (!updatedProfile) {
      console.log('---failed to update profile');
      return res
        .status(404)
        .send({ success: false, message: 'Profile not found' });
    }

    // Send back the updated profile
    res.status(200).send({ success: true, data: updatedProfile });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete group
 * @route   DELETE /api/v1/group/:id/profile/
 * @access  Private/Super
 * @schema  Private
 */
export const deleteGroup = asyncHandler(async (req, res, next) => {
  try {
    const { groupId } = req?.params;

    // Find and delete the group
    const group = await Group.findByIdAndDelete(groupId);
    // Check if the group was found and deleted
    if (!group) {
      return res
        .status(400)
        .send({ success: false, message: 'Group not found' });
    }
    return res
      .status(200)
      .send({ success: true, message: 'Group deleted successfully' });
  } catch (error) {
    next(error);
  }
});
