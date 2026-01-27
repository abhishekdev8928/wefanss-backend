const Privilege = require("../models/previlege-model");
const User = require("../models/user-model")
const getUserPrivileges = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log('Fetching user:', userId);

    // Step 1: User ko fetch karo with role
    const user = await User.findById(userId)
      .populate('roleId')
      .lean();
      
    console.log('User fetched:', user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if roleId exists and is populated
    if (!user.roleId) {
      return res.status(404).json({
        success: false,
        message: 'User has no role assigned'
      });
    }

    console.log('User roleId:', user.roleId);

    // Step 2: Privilege table se permissions fetch karo
    const privilegeData = await Privilege.findOne({
      roleId: user.roleId._id || user.roleId, // Handle both populated and non-populated
      isActive: true
    }).lean();

    console.log('Privilege Data:', privilegeData);

    if (!privilegeData) {
      return res.status(404).json({
        success: false,
        message: 'No privileges found for this role'
      });
    }

    // Step 3: Accessible modules extract karo
    const accessibleModules = privilegeData.permissions.map(p => p.resource);

    // Step 4: Permission map banao (easy frontend access ke liye)
    const permissionsMap = {};
    privilegeData.permissions.forEach(permission => {
      permissionsMap[permission.resource] = permission.operations;
    });

    // Step 5: Helper function - check karo ki operation allowed hai ya nahi
    const hasPermission = (resource, operation) => {
      return permissionsMap[resource]?.includes(operation) || false;
    };

    // Handle both populated and non-populated roleId
    const roleData = user.roleId._id ? user.roleId : {
      _id: user.roleId,
      name: 'Unknown',
      slug: 'unknown',
      is_system: false,
      status: 1
    };

    // Step 6: Complete response
    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        role: {
          id: roleData._id,
          name: roleData.name,
          slug: roleData.slug,
          isSystem: roleData.is_system,
          isActive: roleData.status === 1
        },
        // Accessible modules list
        accessibleModules,
        
        // Complete privilege data from privilege table
        privileges: {
          id: privilegeData._id,
          role: privilegeData.role,
          permissions: privilegeData.permissions,
          isActive: privilegeData.isActive,
          isLocked: privilegeData.isLocked,
          createdAt: privilegeData.createdAt,
          updatedAt: privilegeData.updatedAt
        },

        // Easy-to-use permissions map
        permissionsMap,

        // Helper data for frontend
        meta: {
          totalModules: accessibleModules.length,
          canCreate: accessibleModules.filter(m => 
            hasPermission(m, 'create')
          ),
          canUpdate: accessibleModules.filter(m => 
            hasPermission(m, 'update')
          ),
          canDelete: accessibleModules.filter(m => 
            hasPermission(m, 'delete')
          ),
          canPublish: accessibleModules.filter(m => 
            hasPermission(m, 'publish')
          )
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user privileges:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getUserPrivileges
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