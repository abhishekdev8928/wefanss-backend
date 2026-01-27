const { z } = require("zod");

// Permission schema
const permissionSchema = z.object({
  resource: z.string().min(1, "Resource is required"),
  operations: z.array(z.string()).min(1, "At least one operation is required")
});

// Set privileges schema
const setPrivilegesSchema = z.object({
  permissions: z.array(permissionSchema).default([]),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional()
});

module.exports = {
  setPrivilegesSchema
};