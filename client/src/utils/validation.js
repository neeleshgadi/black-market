// Client-side validation utilities

// Validation rules
export const VALIDATION_RULES = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Please enter a valid email address",
  },
  password: {
    minLength: 6,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    message:
      "Password must be at least 6 characters with uppercase, lowercase, and number",
  },
  name: {
    minLength: 1,
    maxLength: 50,
    pattern: /^[a-zA-Z\s'-]+$/,
    message: "Name can only contain letters, spaces, hyphens, and apostrophes",
  },
  phone: {
    pattern: /^\+?[\d\s\-\(\)]+$/,
    message: "Please enter a valid phone number",
  },
  zipCode: {
    pattern: /^\d{5}(-\d{4})?$/,
    message: "Please enter a valid ZIP code (e.g., 12345 or 12345-6789)",
  },
  price: {
    min: 0,
    pattern: /^\d+(\.\d{1,2})?$/,
    message: "Please enter a valid price (e.g., 10.99)",
  },
  quantity: {
    min: 1,
    max: 10,
    pattern: /^\d+$/,
    message: "Quantity must be between 1 and 10",
  },
};

// Individual validation functions
export const validateEmail = (email) => {
  if (!email) return "Email is required";
  if (!VALIDATION_RULES.email.pattern.test(email)) {
    return VALIDATION_RULES.email.message;
  }
  return null;
};

export const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < VALIDATION_RULES.password.minLength) {
    return `Password must be at least ${VALIDATION_RULES.password.minLength} characters long`;
  }
  if (!VALIDATION_RULES.password.pattern.test(password)) {
    return VALIDATION_RULES.password.message;
  }
  return null;
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return "Please confirm your password";
  if (password !== confirmPassword) return "Passwords do not match";
  return null;
};

export const validateName = (name, fieldName = "Name") => {
  if (!name) return `${fieldName} is required`;
  if (name.length < VALIDATION_RULES.name.minLength) {
    return `${fieldName} cannot be empty`;
  }
  if (name.length > VALIDATION_RULES.name.maxLength) {
    return `${fieldName} cannot exceed ${VALIDATION_RULES.name.maxLength} characters`;
  }
  if (!VALIDATION_RULES.name.pattern.test(name)) {
    return VALIDATION_RULES.name.message;
  }
  return null;
};

export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === "string" && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateLength = (value, min, max, fieldName) => {
  if (!value) return null; // Let required validation handle empty values

  const length = value.length;
  if (min && length < min) {
    return `${fieldName} must be at least ${min} characters long`;
  }
  if (max && length > max) {
    return `${fieldName} cannot exceed ${max} characters`;
  }
  return null;
};

export const validatePrice = (price) => {
  if (!price) return "Price is required";
  const numPrice = parseFloat(price);
  if (isNaN(numPrice) || numPrice < 0) {
    return "Price must be a positive number";
  }
  if (!VALIDATION_RULES.price.pattern.test(price.toString())) {
    return VALIDATION_RULES.price.message;
  }
  return null;
};

export const validateQuantity = (quantity) => {
  if (!quantity) return "Quantity is required";
  const numQuantity = parseInt(quantity);
  if (
    isNaN(numQuantity) ||
    numQuantity < VALIDATION_RULES.quantity.min ||
    numQuantity > VALIDATION_RULES.quantity.max
  ) {
    return VALIDATION_RULES.quantity.message;
  }
  return null;
};

export const validateZipCode = (zipCode) => {
  if (!zipCode) return "ZIP code is required";
  if (!VALIDATION_RULES.zipCode.pattern.test(zipCode)) {
    return VALIDATION_RULES.zipCode.message;
  }
  return null;
};

export const validateUrl = (url, fieldName = "URL") => {
  if (!url) return null; // Optional field
  try {
    new URL(url);
    return null;
  } catch {
    return `Please enter a valid ${fieldName}`;
  }
};

// Form validation schemas
export const FORM_SCHEMAS = {
  login: {
    email: [validateRequired, validateEmail],
    password: [validateRequired],
  },
  register: {
    email: [validateRequired, validateEmail],
    password: [validateRequired, validatePassword],
    confirmPassword: [
      (value, formData) => validateConfirmPassword(formData.password, value),
    ],
    firstName: [(value) => validateName(value, "First name")],
    lastName: [(value) => validateName(value, "Last name")],
  },
  profile: {
    firstName: [(value) => validateName(value, "First name")],
    lastName: [(value) => validateName(value, "Last name")],
    email: [validateRequired, validateEmail],
  },
  shippingAddress: {
    street: [(value) => validateRequired(value, "Street address")],
    city: [(value) => validateRequired(value, "City")],
    state: [(value) => validateRequired(value, "State")],
    zipCode: [validateRequired, validateZipCode],
    country: [(value) => validateRequired(value, "Country")],
  },
  alien: {
    name: [(value) => validateRequired(value, "Alien name")],
    faction: [(value) => validateRequired(value, "Faction")],
    planet: [(value) => validateRequired(value, "Planet")],
    rarity: [(value) => validateRequired(value, "Rarity")],
    price: [validateRequired, validatePrice],
    image: [(value) => validateUrl(value, "Image URL")],
    backstory: [(value) => validateLength(value, 0, 1000, "Backstory")],
    clothingStyle: [(value) => validateLength(value, 0, 100, "Clothing style")],
  },
  cart: {
    quantity: [validateRequired, validateQuantity],
  },
};

// Validate entire form
export const validateForm = (formData, schema) => {
  const errors = {};
  let isValid = true;

  for (const [field, validators] of Object.entries(schema)) {
    const value = formData[field];

    for (const validator of validators) {
      const error =
        typeof validator === "function"
          ? validator(value, formData)
          : validator(value);

      if (error) {
        errors[field] = error;
        isValid = false;
        break; // Stop at first error for this field
      }
    }
  }

  return { isValid, errors };
};

// Validate single field
export const validateField = (fieldName, value, schema, formData = {}) => {
  const validators = schema[fieldName];
  if (!validators) return null;

  for (const validator of validators) {
    const error =
      typeof validator === "function"
        ? validator(value, formData)
        : validator(value);

    if (error) {
      return error;
    }
  }

  return null;
};

// Real-time validation hook
import { useState, useCallback } from "react";

export const useFormValidation = (initialData, schema) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateSingleField = useCallback(
    (fieldName, value) => {
      const error = validateField(fieldName, value, schema, formData);
      setErrors((prev) => ({
        ...prev,
        [fieldName]: error,
      }));
      return error;
    },
    [schema, formData]
  );

  const handleChange = useCallback(
    (fieldName, value) => {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: value,
      }));

      // Validate if field has been touched
      if (touched[fieldName]) {
        validateSingleField(fieldName, value);
      }
    },
    [touched, validateSingleField]
  );

  const handleBlur = useCallback(
    (fieldName) => {
      setTouched((prev) => ({
        ...prev,
        [fieldName]: true,
      }));
      validateSingleField(fieldName, formData[fieldName]);
    },
    [formData, validateSingleField]
  );

  const validateAll = useCallback(() => {
    const validation = validateForm(formData, schema);
    setErrors(validation.errors);
    setTouched(
      Object.keys(schema).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {})
    );
    return validation;
  }, [formData, schema]);

  const reset = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setTouched({});
  }, [initialData]);

  return {
    formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    isValid: Object.keys(errors).length === 0,
  };
};

export default {
  VALIDATION_RULES,
  FORM_SCHEMAS,
  validateForm,
  validateField,
  useFormValidation,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateName,
  validateRequired,
  validateLength,
  validatePrice,
  validateQuantity,
  validateZipCode,
  validateUrl,
};
