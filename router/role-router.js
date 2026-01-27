const express = require("express");
const router = express.Router();
const {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  updateRoleStatus,
  deleteRole,
} = require("../controllers/role-controller");

const validate = require("../middlewares/validate.middleware");
const {
  createRoleSchema,
  updateRoleSchema,
  updateRoleStatusSchema,
} = require("../shared/schema/role-schema");

const authMiddleware = require("../middlewares/auth-middleware");

router.post(
  "/",
  authMiddleware,
  validate(createRoleSchema),
  createRole
);

router.get(
  "/",
  authMiddleware,
  getAllRoles
);

router.get(
  "/:id",
  authMiddleware,
  getRoleById
);

router.put(
  "/:id",
  authMiddleware,
  validate(updateRoleSchema),
  updateRole
);

router.patch(
  "/:id/status",
  authMiddleware,
  validate(updateRoleStatusSchema),
  updateRoleStatus
);

router.delete(
  "/:id",
  authMiddleware,
  deleteRole
);

module.exports = router;