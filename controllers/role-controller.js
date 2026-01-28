const RoleModel = require("../models/role-model");
const Privilege = require("../models/previlege-model");

// Create a new role
const createRole = async (req, res) => {
  try {
    const { name, description } = req.body;
    const createdBy = req?.user?.userId;



    const roleExists = await RoleModel.findOne({ name });
    if (roleExists) {
      return res.status(400).json({ 
        success: false,
        msg: "Role already exists" 
      });
    }

    const newRole = await RoleModel.create({ 
      name,
      description,
      createdBy,
      status: 1,
      is_system: false 
    });

    console.log()

    await Privilege.create({
      role: name,
      roleId: newRole._id,
      permissions: [],
      isActive: true,
      description: `Privileges for ${name} role`
    });

    res.status(201).json({
      success: true,
      msg: "Role created successfully",
      role: newRole,
      roleId: newRole._id.toString(),
    });
  } catch (error) {
    console.error("Error in createRole:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get all roles (excluding system roles)
const getAllRoles = async (req, res) => {
  try {
    const roles = await RoleModel.find({
      is_system: { $ne: true } // Only non-system roles
    })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      msg: "Roles retrieved successfully",
      data: roles || [] 
    });

  } catch (error) {
    console.error("Error in getAllRoles:", error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get role by ID (excluding system roles)
const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const role = await RoleModel.findOne({
      _id: id,
      is_system: { $ne: true }
    })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    if (!role) {
      return res.status(404).json({ 
        success: false,
        msg: "Role not found" 
      });
    }
    
    res.status(200).json({ 
      success: true,
      msg: "Role retrieved successfully", 
      data: role 
    });
  } catch (error) {
    console.error("Error in getRoleById:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Update role details (system roles silently blocked)
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const updatedBy = req.userId;

    const existingRole = await RoleModel.findById(id);
    if (!existingRole) {
      return res.status(404).json({ 
        success: false,
        msg: "Role not found" 
      });
    }

    // Silently block system role updates - user thinks role doesn't exist
    if (existingRole.is_system) {
      return res.status(404).json({ 
        success: false,
        msg: "Role not found" 
      });
    }

    if (name && name !== existingRole.name) {
      const nameExists = await RoleModel.findOne({ 
        name, 
        _id: { $ne: id } 
      });
      if (nameExists) {
        return res.status(400).json({ 
          success: false,
          msg: "Role name already exists" 
        });
      }
    }

    const updateData = { updatedBy };
    if (name) {
      updateData.name = name;
      updateData.slug = name.toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
    }
    if (description !== undefined) {
      updateData.description = description;
    }

    const updatedRole = await RoleModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (name && name !== existingRole.name) {
      await Privilege.updateOne(
        { roleId: id.toString() },
        { $set: { role: name } }
      );
    }

    res.status(200).json({ 
      success: true,
      msg: "Role updated successfully",
      data: updatedRole
    });
  } catch (error) {
    console.error("Error in updateRole:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Update role status (system roles silently blocked)
const updateRoleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedBy = req.userId;

    const role = await RoleModel.findById(id);
    if (!role) {
      return res.status(404).json({ 
        success: false,
        msg: "Role not found" 
      });
    }

    // Silently block system role status updates - user thinks role doesn't exist
    if (role.is_system) {
      return res.status(404).json({ 
        success: false,
        msg: "Role not found" 
      });
    }

    const updatedRole = await RoleModel.findByIdAndUpdate(
      id,
      { 
        $set: { 
          status,
          updatedBy 
        } 
      },
      { new: true, runValidators: true }
    );

    await Privilege.updateOne(
      { roleId: id.toString() },
      { $set: { isActive: status === 1 } }
    );

    res.status(200).json({
      success: true,
      msg: "Role status updated successfully",
      data: updatedRole
    });
  } catch (error) {
    console.error("Error in updateRoleStatus:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Delete role (system roles silently blocked)
const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await RoleModel.findById(id);
    if (!role) {
      return res.status(404).json({ 
        success: false,
        msg: "Role not found" 
      });
    }

    // Silently block system role deletion - user thinks role doesn't exist
    if (role.is_system) {
      return res.status(404).json({ 
        success: false,
        msg: "Role not found" 
      });
    }

    await Privilege.deleteOne({ roleId: id.toString() });
    
    await RoleModel.findByIdAndDelete(id);

    res.status(200).json({ 
      success: true,
      msg: "Role and its privileges deleted successfully"
    });
  } catch (error) {
    console.error("Error in deleteRole:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

module.exports = {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  updateRoleStatus,
  deleteRole,
};