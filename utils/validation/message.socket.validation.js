import Joi from 'joi';

// Define Joi schema for message validation
export const messageSchema = Joi.object({
  email: Joi.string().email().required(),
  message: Joi.string().min(1).max(100).required()
});

export const chatHistorySchema = Joi.object({
  email: Joi.string().email().required()
});
