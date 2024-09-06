const BaseJoi = require("joi");
const sanitizeHTML = require("sanitize-html");
const extention = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.escapeHTML": "{{#label}} must not include HTML!",
  },
  rules: {
    escapeHTML: {
      validate(value, helper) {
        const clean = sanitizeHTML(value, {
          allowedAttributes: {},
          allowedTags: [],
        });
        if (clean !== value)
          return helper.error("string.escapeHTML", { value });
        return clean;
      },
    },
  },
});

const normalizeBudgetPreferences = (value) => {
  if (!Array.isArray(value)) {
    return [value]; // Convert single value to an array
  }
  return value;
};

const Joi = BaseJoi.extend(extention);

module.exports.userSchema = Joi.object({
  username: Joi.string().escapeHTML().required().messages({
    "string.empty": "Name is required",
  }),
  email: Joi.string().email().escapeHTML().required().messages({
    "string.email": "Invalid email address",
    "string.empty": "Email is required",
  }),
  mobileNo: Joi.string()
    .length(10)
    .escapeHTML()
    .pattern(/^\d+$/)
    .required()
    .messages({
      "string.length": "Mobile number must be exactly 10 digits",
      "string.pattern.base": "Mobile number must only contain digits",
      "string.empty": "Mobile number is required",
    }),
  password: Joi.string().min(8).escapeHTML().required().messages({
    "string.min": "Password must be at least 8 characters long",
    "string.empty": "Password is required",
  }),
  preferences: Joi.string()
    .valid("goverment-tenders", "private-tenders")
    .escapeHTML()
    .required()
    .messages({
      "string.valid": "Invalid tender preference selected",
      "string.empty": "Tender preference is required",
    }),
  budgetPreferences: Joi.alternatives()
    .try(
      Joi.array().items(
        Joi.string().valid(
          "below-20-lakhs",
          "20-lakhs-to-1-crore",
          "above-1-crore",
        ),
      ),
      Joi.string().valid(
        "below-20-lakhs",
        "20-lakhs-to-1-crore",
        "above-1-crore",
      ),
    )
    .custom((value, helpers) => {
      return normalizeBudgetPreferences(value);
    })
    .required()
    .messages({
      "array.base": "Budget preferences should be an array",
      "array.min": "You must select at least one budget preference",
      "any.only": "Invalid budget preference selected",
      "any.required": "Budget preferences are required",
    })
    .required(),
});
