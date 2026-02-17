const validator = require("validator");

/**
 * Validate signup request body
 * Throws error if invalid
 */
const validateSignUpData = ({ firstName, lastName, emailId, password }) => {
  if (!firstName || firstName.length < 4) {
    throw new Error("First name must be at least 4 characters");
  }

  if (!emailId || !validator.isEmail(emailId)) {
    throw new Error("Invalid email address");
  }

  if (!validator.isStrongPassword(password)) {
    throw new Error("Password is not strong enough");
  }
};

/**
 * Sanitize string inputs (trim)
 */
const sanitizeInput = (value) => {
  if (typeof value === "string") {
    return value.trim();
  }
  return value;
};

module.exports = { validateSignUpData, sanitizeInput };
