const Privilege = require("../models/previlege-model");
const RoleModel = require("../models/role-model");
const User = require("../models/user-model")



const getUserPrivileges = async (req, res) => {
  try {
    const { roleId } = req.user;

    const role = await RoleModel.findById(roleId)
      .select("name slug")
      .lean();

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found"
      });
    }

    const privilegeData = await Privilege.findOne({
      roleId,
      isActive: true
    }).select("permissions").lean();

    if (!privilegeData) {
      return res.status(404).json({
        success: false,
        message: "No privileges found for this role"
      });
    }

    // 🔥 Fast module-level access list
    const accessibleModules = privilegeData.permissions.map(p => p.resource);

    return res.status(200).json({
      success: true,
      data: {
        role,
        accessibleModules,        // 👈 quick module access check
        permissions: privilegeData.permissions // 👈 detailed operations
      }
    });

  } catch (error) {
    console.error("Error fetching privileges:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};





 


/**
 * Get privileges by role ID
 */
const getPrivilegesByRoleId = async (req, res) => {
  try {
    const { id } = req.params;

    const privilege = await Privilege.findOne({ roleId: id });

    if (!privilege) {
      return res.status(404).json({ 
        success: false,
        msg: "No privileges found for this role" 
      });
    }

    res.status(200).json({ 
      success: true,
      msg: "Privileges retrieved successfully",
      data: privilege 
    });
  } catch (error) {
    console.error("Error in getPrivilegesByRoleId:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

/**
 * Set/Update privileges for a role
 */
const setPrivileges = async (req, res) => {
  try {
    const { id } = req.params; // roleId
    const { permissions } = req.body;

    const privilege = await Privilege.findOne({ roleId: id });

    if (!privilege) {
      return res.status(404).json({ 
        success: false,
        msg: "Privilege document not found" 
      });
    }

    privilege.permissions = permissions;
    await privilege.save();

    res.status(200).json({ 
      success: true,
      msg: "Privileges updated successfully", 
      data: privilege 
    });
  } catch (error) {
    console.error("Error in setPrivileges:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

module.exports = {
  getUserPrivileges,
  getPrivilegesByRoleId,
  setPrivileges
};