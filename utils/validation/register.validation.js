import Joi from 'joi';
import { validateSchema } from '../../helpers/joi.validation/joi.validation.helpers.js';
export const registrationValidation = async (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().trim().lowercase().required(),
    password: Joi.string()
      .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@])[A-Za-z\d@]{8,20}$/)
      .min(8)
      .max(20)
      .required(),
    conformPassword: Joi.string().valid(Joi.ref('password')).required(),
    name: Joi.string().min(3).max(15).required(),
    socketIds: Joi.array()
  });
  const error = await validateSchema(schema, req.body);
  if (error) {
    return res.status(400).json({
      status: 'failure',
      message: error.details[0].message
    });
  }
  next();
};
