const { z } = require("zod");

// ✅ Operations schema - object with boolean values
const operationsSchema = z.object({
  add: z.boolean().optional(),
  edit: z.boolean().optional(),
  delete: z.boolean().optional(),
  publish: z.boolean().optional() // Only for celebrity
}).strict();

// ✅ Permission schema - operations is now an object
const permissionSchema = z.object({
  resource: z.string().min(1, "Resource is required"),
  operations: operationsSchema // Changed from array to object
});

// Set privileges schema
const setPrivilegesSchema = z.object({
  permissions: z.array(permissionSchema).default([]),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional()
});

module.exports = {
  setPrivilegesSchema
};