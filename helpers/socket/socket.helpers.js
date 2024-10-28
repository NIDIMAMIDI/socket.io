import { Server } from 'socket.io';
// import pkg from 'socket.io';
// const { Server } = pkg;

import { authSocketMiddleware } from '../../middleware/authorization/authorization.socket.middleware.js';
import { User } from '../../model/user/user.model.js';
import { Message } from '../../model/message/message.model.js';

import {
  fetchChatHistory,
  removeUserSocketId,
  userChatList,
  userDetails
} from './socket.functionality.js';
import {
  validateChatHistorySchema,
  validateSocketMessageSchema
} from './socket.validation.js';

// Initialize Socket.IO server
export const socketIO = async (server) => {
  const io = new Server(server);

  // Apply authentication middleware to every connection
  io.use((socket, next) => {
    authSocketMiddleware(socket, next); // Middleware to authenticate socket connections
  });

  // Handle a new client connection
  io.on('connection', async (socket) => {
    // Find the current user based on the ID attached to the socket
    const currentUser = await User.findById(socket.user.id);

    // Log when a user connects
    console.log(`${currentUser.name} is connected`);

    // Handle 'message' event when a client sends a message
    socket.on('message', async (payload, cb) => {
      // Validate the incoming message payload
      const { email, message } = await validateSocketMessageSchema(payload, cb);

      // If validation fails, return early
      if (!email || !message) return;

      try {
        // Find the receiver user by their email
        const receiver = await userDetails(email, cb);

        // Return early if the receiver is not found or offline
        if (!receiver) return;

        // Get the first socket ID of the receiver (considering they may have multiple sockets)
        const receiverSocketId = receiver.socketIds[0];

        // Save the new message to the database
        const newMessage = await Message.create({
          senderId: socket.user.id, // ID of the sender (current user)
          receiverId: receiver._id, // ID of the receiver
          message: message // The actual message content
        });

        // Emit the message to the receiver's socket
        io.to(receiverSocketId).emit('messageSent', {
          message: newMessage.message, // The message content
          senderId: newMessage.senderId, // ID of the sender
          senderName: currentUser.name, // Name of the sender
          receiverId: newMessage.receiverId, // ID of the receiver
          receiverName: receiver.name, // Name of the receiver
          createdAt: newMessage.createdAt, // Timestamp of when the message was created
          isRead: newMessage.isRead
        });

        // Send a success response back to the sender
        cb({
          status: 'OK',
          message: 'Message sent successfully'
        });
      } catch (err) {
        // Handle any errors that occurred during message processing
        cb({
          status: 'Internal Server Error',
          error: 'Failed to send message'
        });
      }
    });

    // Handle 'get-chat-list' event when a client requests the chat list

    socket.on('get-chat-list', async () => {
      try {
        const userId = socket.user.id;

        // Fetch the chat list for the user
        const chatList = await userChatList(userId);

        // Emit the chat list back to the client
        socket.emit('chat-list', chatList);
      } catch (err) {
        // Log the error and emit an error message to the client
        console.error('Error fetching chat list:', err);
        socket.emit('chat-list-error', { error: 'Failed to fetch chat list' });
      }
    });

    // Handle 'get-chat-history' event when a client requests chat history

    socket.on('get-chat-history', async (userEmail, cb) => {
      const currentUserId = socket.user.id;
      // Validate the incoming message payload
      const { email } = await validateChatHistorySchema(userEmail, cb);

      // If validation fails, return early
      if (!email) return;
      try {
        const user = await User.findOne({ email: email });
        if (!user) {
          return cb({
            status: 'Not Found',
            error: 'User not found'
          });
        }
        const userId = user._id;
        // Fetch the chat history between the current user and the specified user
        const chatHistory = await fetchChatHistory(currentUserId, userId);

        // Emit the chat history back to the client
        socket.emit('chat-history', chatHistory);
      } catch (err) {
        // Handle errors (e.g., log them and/or send an error message back to the client)
        console.error('Error fetching chat history:', err);
        socket.emit('chat-history-error', { error: 'Failed to fetch chat history' });
      }
    });

    socket.on('disconnect', async () => {
      try {
        // Remove the disconnected socket ID from the user's socket IDs array
        const user = await removeUserSocketId(socket.user.id, socket.id);

        // Log when a user disconnects
        console.log(`${user.name} is disconnected`);
      } catch (err) {
        // Log any errors that occur during disconnection
        console.error('Error during user disconnection:', err.message);
      }
    });
  });
};
