import { verifyToken } from '../../helpers/jwt/indexJwt.js';
import { User } from '../../model/user/user.model.js';

export const authSocketMiddleware = async (socket, next) => {
  try {
    // Extract the token from the socket handshake headers
    const token = socket.handshake.headers.token;

    // Check if the token is provided
    if (!token) {
      // If the token is not present, pass an error to the next middleware
      return next(new Error('You are not logged in or Bearer Token is not provided'));
    }

    // Verify the token using the secret key
    const decodedToken = await verifyToken(token, process.env.JWT_SECRET_KEY);

    // Check if the token is valid and contains a user ID
    if (!decodedToken || !decodedToken.id) {
      // If the token is invalid, pass an error to the next middleware
      return next(new Error('Invalid token'));
    }

    // Save the decoded token information to the socket object for later use
    socket.user = decodedToken;

    // If the user data is successfully attached to the socket
    if (socket.user) {
      // Update the user's document in the database by adding the socket ID to the socketIds array
      await User.findByIdAndUpdate(
        socket.user.id,
        {
          $push: { socketIds: socket.id } // Add the current socket ID to the user's socketIds array
        },
        { new: true } // Return the updated user document after the update
      );
    }

    // Call the next middleware in the stack to proceed with the connection
    next();
  } catch (err) {
    // If an error occurs during token verification, pass an error to the next middleware
    return next(new Error('Token verification failed'));
  }
};
