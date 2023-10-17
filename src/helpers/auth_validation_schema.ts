import Joi from "joi";

const authValidationSchema = Joi.object({
  username: Joi.string().min(4).max(15),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(4).required(),
});

export default authValidationSchema;
