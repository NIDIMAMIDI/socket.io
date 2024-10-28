export const validateSchema = async (schema, data) => {
  const { error, value } = schema.validate(data);
  return error;
};
