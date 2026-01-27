const { z } = require("zod");

/**
 * Validation Middleware Factory
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware function
 */
const validate = (schema) => {
  return async (req, res, next) => {
    try {
     
      const validatedData = await schema.parseAsync(req.body);
      
      req.body = validatedData;
      
      next();
    } catch (error) {
      
      if (error.name === 'ZodError' || error instanceof z.ZodError) {
        // Flatten errors for easier handling
        const flattened = error.flatten();
        
        // Map field errors to clean format
        const errors = Object.keys(flattened.fieldErrors).map((field) => ({
          field,
          message: flattened.fieldErrors[field]?.[0] || "Invalid value",
        }));

        // Get first error for main message
        const firstError = errors[0];
        const mainMessage = firstError 
          ? `${firstError.field}: ${firstError.message}`
          : "Validation failed";

        return res.status(422).json({
          success: false,
          message: mainMessage,
          errors
        });
      }

      // Handle unexpected errors
      console.error("Unexpected validation error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal validation error",
        error: error.message
      });
    }
  };
};

module.exports = validate;