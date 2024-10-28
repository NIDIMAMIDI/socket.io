import { hashPassword, passwordChecking } from '../../helpers/bycrypt/bcryptHelpers.js';
import { createToken } from '../../helpers/jwt/indexJwt.js';
import { User } from '../../model/user/user.model.js';

export const registerUser = async (req, res, next) => {
  try {
    const { email, password, name, socketIds } = req.body;
    const loweredEmail = email.toLowerCase();

    const user = await User.findOne({ email: loweredEmail });

    const hashedPassword = await hashPassword(password, 12);

    if (user) {
      return res.status(404).json({
        status: 'failure',
        message: `User with ${loweredEmail} email is already exists`
      });
    }

    const newUser = await User.create({
      email,
      password: hashedPassword,
      name,
      socketIds
    });

    // creating JWT token and fetching cookie options/parametrs
    const { token, cookieOptions } = createToken(newUser);

    // setting token as a cookie
    res.cookie('jwt', token, cookieOptions);
    // success response
    res.status(201).json({
      status: 'success',
      message: 'User signup registration successfull',
      data: {
        newUser,
        token
      }
    });

    // res.send(newUser);
  } catch (err) {
    return res.status(500).json({
      status: 'failure',
      message: err.message
    });
  }
};

export const loginUser = async (req, res, next) => {
  try {
    // fetching validated data from the authValidator
    const { email, password } = req.body;

    // converting email to a lowerCase
    const loweredEmail = email.toLowerCase();

    // check if user email exists in database
    const user = await User.findOne({ email: loweredEmail });
    const { password: pass, createdAt, updatedAt, ...userDetails } = user._doc;
    // console.log(pass);

    // if user does not found with the provided mail it will give error response
    if (!user) {
      return res.status(500).json({
        status: 'failure',
        message: 'Invalid email'
      });
    }

    // check if password is correct or not
    const isPAsswordCorrect = await passwordChecking(password, user.password);

    // if provided password does not match stored password it will throw the error response
    if (!isPAsswordCorrect) {
      return res.status(500).json({
        status: 'failure',
        message: 'Invalid Password'
      });
    }

    // fetching jwt token and cookie options
    const { token, cookieOptions } = createToken(user);

    // save user signup and login History by its storing user id and token into LoginHistory collection
    // storeLoginHistory(user._id, token);

    // setting token as a cookie
    res.cookie('jwt', token, cookieOptions);

    // success response
    res.status(200).json({
      status: 'success',
      message: 'Login Successfull',
      userData: {
        userDetails,
        token
      }
    });
  } catch (err) {
    return res.status(500).json({
      status: 'failure',
      message: err.message
    });
  }
};
