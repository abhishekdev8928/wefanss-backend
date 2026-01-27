// validation/userManagementSchemas.js
const { z } = require("zod");

// Get all users with filters
const getUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(10),
    search: z.string().optional(),
  }).optional().default({}),
});

// Get single user by ID
const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),
  }),
});

// Update user role
const updateUserRoleSchema = z.object({
 
    role: z.string().min(1, "Role is required"),
 
});

// Update user status (activate/deactivate)
const updateUserStatusSchema = z.object({
  
    isActive: z.boolean({
      required_error: "isActive is required",
      invalid_type_error: "isActive must be a boolean",
    })
});

// Delete user
const deleteUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),
  }),
});

// Toggle TOTP
const toggleTotpSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),
  }),
  body: z.object({
    totpEnabled: z.boolean({
      required_error: "totpEnabled is required",
      invalid_type_error: "totpEnabled must be a boolean",
    }),
  }),
});

// Get user's QR code
const getUserQrCodeSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),
  }),
});

module.exports = {
  getUsersSchema,
  getUserByIdSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
  deleteUserSchema,
  toggleTotpSchema,
  getUserQrCodeSchema,
};