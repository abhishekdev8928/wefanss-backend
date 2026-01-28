// middleware/privilege.middleware.js
const Privilege = require("../models/previlege-model");
const { STATIC_ROLES } = require("../config/role-config");

/**
 * ✅ Middleware 1: Check if user has permission for specific resource and operation
 * Usage: checkPrivilege(RESOURCES.CELEBRITY, OPERATIONS.CREATE)
 */
const checkPrivilege = (resource, operation) => {
  return async (req, res, next) => {
    try {
     
      const { role, roleId } = req.user;

      
      if (role === STATIC_ROLES.SUPER_ADMIN) {
        return next();
      }

      
      const privilege = await Privilege.findOne({
        roleId: roleId,
        isActive: true
      }).lean();

      if (!privilege) {
        return res.status(403).json({
          success: false,
          message: "No privileges found for your role"
        });
      }

      console.log(privilege)

     
      const permission = privilege.permissions.find(
        (perm) => perm.resource === resource
      );

      if (!permission || !permission.operations.includes(operation)) {
        return res.status(403).json({
          success: false,
          message: `You don't have permission to ${operation} ${resource}`
        });
      }

      
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error checking privileges",
        error: error.message
      });
    }
  };
};

module.exports = { checkPrivilege };