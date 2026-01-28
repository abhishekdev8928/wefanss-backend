// controllers/userManagementController.js
const User = require("../models/user-model");
const { logActivity } = require("../utils/activityLogger");
const {
  ACTIVITY_ACTIONS,
  ACTIVITY_RESOURCES,
  ACTIVITY_STATUS,
} = require("../constants/activityLogConstants");

/**
 * Get all users with pagination, filtering, and search
 */
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    // Build filter object
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filter)
      .select(
        "-password -totpSecret -emailOtp -passwordResetOtp -refreshTokens +totpQrCode",
      )
      .populate({
        path: "roleId",
        match: { is_system: true },
        select: "name is_system",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    console.log(users);

    // Log activity
    await logActivity({
      userId: req.userId,
      performedByRole: req.userRole,
      action: ACTIVITY_ACTIONS.READ,
      resource: ACTIVITY_RESOURCES.USER,
      item: {
        type: "User List",
        id: null,
        name: "User Management",
      },
      activity: `Viewed user list (page ${page})`,
      req,
      status: ACTIVITY_STATUS.SUCCESS,
    });

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(users.length / parseInt(limit)),
          limit: parseInt(limit),
        },
      },
      message: "Users retrieved successfully",
    });
  } catch (error) {
    console.error("Get all users error:", error);

    await logActivity({
      userId: req.userId,
      performedByRole: req.userRole,
      action: ACTIVITY_ACTIONS.READ,
      resource: ACTIVITY_RESOURCES.USER,
      item: {
        type: "User List",
        id: null,
        name: "User Management",
      },
      activity: "Failed to retrieve user list",
      req,
      status: ACTIVITY_STATUS.FAILED,
    });

    res.status(500).json({
      success: false,
      message: "Failed to retrieve users",
      error: error.message,
    });
  }
};

/**
 * Get single user by ID
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select(
      "-password -totpSecret -emailOtp -passwordResetOtp -refreshTokens ",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await logActivity({
      userId: req.userId,
      performedByRole: req.userRole,
      action: ACTIVITY_ACTIONS.READ,
      resource: ACTIVITY_RESOURCES.USER,
      item: {
        type: "User",
        id: user._id,
        name: user.name,
      },
      activity: `Viewed user profile: ${user.email}`,
      req,
      status: ACTIVITY_STATUS.SUCCESS,
    });

    res.status(200).json({
      success: true,
      data: user,
      message: "User retrieved successfully",
    });
  } catch (error) {
    console.error("Get user by ID error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve user",
      error: error.message,
    });
  }
};

/**
 * Update user role
 */
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Prevent self-role modification
    if (id === req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    await logActivity({
      userId: req.userId,
      performedByRole: req.userRole,
      action: ACTIVITY_ACTIONS.UPDATE,
      resource: ACTIVITY_RESOURCES.USER,
      item: {
        type: "User Role",
        id: user._id,
        name: user.name,
      },
      activity: `Changed user role from ${oldRole} to ${role} for ${user.email}`,
      req,
      status: ACTIVITY_STATUS.SUCCESS,
    });

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message: "User role updated successfully",
    });
  } catch (error) {
    console.error("Update user role error:", error);

    await logActivity({
      userId: req.userId,
      performedByRole: req.userRole,
      action: ACTIVITY_ACTIONS.UPDATE,
      resource: ACTIVITY_RESOURCES.USER,
      item: {
        type: "User Role",
        id: req.params.id,
        name: "Unknown",
      },
      activity: `Failed to update user role`,
      req,
      status: ACTIVITY_STATUS.FAILED,
    });

    res.status(500).json({
      success: false,
      message: "Failed to update user role",
      error: error.message,
    });
  }
};

/**
 * Update user status (activate/deactivate)
 */
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // Prevent self-deactivation
    if (id === req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You cannot deactivate your own account",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isActive = isActive;
    await user.save();

    await logActivity({
      userId: req.userId,
      performedByRole: req.userRole,
      action: ACTIVITY_ACTIONS.UPDATE,
      resource: ACTIVITY_RESOURCES.USER,
      item: {
        type: "User Status",
        id: user._id,
        name: user.name,
      },
      activity: `${isActive ? "Activated" : "Deactivated"} user: ${user.email}`,
      req,
      status: ACTIVITY_STATUS.SUCCESS,
    });

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    console.error("Update user status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update user status",
      error: error.message,
    });
  }
};

/**
 * Delete user
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (id === req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userName = user.name;
    const userEmail = user.email;

    await User.findByIdAndDelete(id);

    await logActivity({
      userId: req.userId,
      performedByRole: req.userRole,
      action: ACTIVITY_ACTIONS.DELETE,
      resource: ACTIVITY_RESOURCES.USER,
      item: {
        type: "User",
        id: id,
        name: userName,
      },
      activity: `Deleted user: ${userEmail}`,
      req,
      status: ACTIVITY_STATUS.SUCCESS,
    });

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser,
};
