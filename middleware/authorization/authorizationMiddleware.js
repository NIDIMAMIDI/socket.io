import { User } from '../../model/user/userModel.js';
import { verifyToken } from '../../helpers/jwt/indexJwt.js';

// Authorization Middleware
export const auth = async (req, res, next) => {
  try {
    // getting the token and check if there is user or not

    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // cheching the token is valid or not
    if (!token) {
      return res.status(400).json({
        status: 'failure',
        message: 'You are not logged in (or) Bearer Token is not provided check it Once'
      });
    }

    // verification of token
    // const decoded = await promisify (jwt.verify) (token, process.env.JWT_SECRET_KEY)
    // console.log(decoded);

    // verifying the generated token with secret key that we stored in .env file
    const decoded = await verifyToken(token, process.env.JWT_SECRET_KEY);

    // check if user exists or not
    const user = await User.findById(decoded.id);

    // user does not exist throw error response
    if (!user) {
      return res.status(500).json({
        status: 'failure',
        message: 'The User with the token is no longer exists'
      });
    }

    // assigning authorized user to request object so that it can be used for later use
    req.user = user;

    // next functionality
    next();
  } catch (err) {
    // Token expiration Error
    // console.log(err.stack);
    if (err.name === 'Error') {
      return res.status(401).json({
        status: 'failure',
        message: 'Token expired! Please log in again to get access.'
      });
    }

    // Handle other verification errors
    return res.status(500).json({
      status: 'failure',
      message: 'Failed to authenticate token.'
    });
  }
};
