import bcrypt from 'bcrypt';

// converting the plain password into hash password by hashing
export const hashPassword = async (password, saltRounds) => {
  return await bcrypt.hash(password, saltRounds);
};

// checking or comparing weather plainTextPassword and hashedPassword are same or not
export const passwordChecking = async (plainTextPassword, hashedPassword) => {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};
