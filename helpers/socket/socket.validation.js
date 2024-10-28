import {
  chatHistorySchema,
  messageSchema
} from '../../utils/validation/message.socket.validation.js';

// Validate the incoming payload using Joi schema
export const validateSocketMessageSchema = async (payload, cb) => {
  const { email, message } = payload;

  // Validate the email and message fields in the payload
  const { error } = await messageSchema.validate({ email, message });

  if (error) {
    // If validation fails, send a Bad Request response with the validation error message
    cb({
      status: 'Bad Request',
      error: error.details[0].message // Return the first validation error message
    });

    // Return an empty object if validation fails
    return {};
  }

  // If validation is successful, return the validated email and message
  return { email, message };
};

// Validate the incoming email using Joi schema
export const validateChatHistorySchema = async (email, cb) => {
  // Validate the email field
  const { error } = await chatHistorySchema.validate(email);

  if (error) {
    // If validation fails, send a Bad Request response with the validation error message
    cb({
      status: 'Bad Request',
      error: error.details[0].message // Return the first validation error message
    });

    // Return an empty object if validation fails
    return {};
  }

  // If validation is successful, return the validated email and message
  return email;
};
