import mongoose from 'mongoose';
import { User } from '../../model/user/user.model.js';

import { Message } from '../../model/message/message.model.js';

// Fetch user details by email
export const userDetails = async (email, cb) => {
  try {
    // Find the user in the database using their email address
    const receiver = await User.findOne({ email });

    if (!receiver) {
      // If the receiver is not found, send a Not Found response
      cb({
        status: 'Not Found',
        error: 'Receiver not found'
      });

      // Return null if the receiver is not found
      return null;
    }

    // If receiver exists, return the user details
    return receiver;

    // Uncomment the following lines if you want to check if the receiver is online
    // if (!receiver.socketIds.length) {
    //   // If the receiver has no active socket IDs, send a Not Available response
    //   cb({
    //     status: 'Not Available',
    //     error: 'Receiver is not currently online'
    //   });
    //   return null; // Return null if the receiver is offline
    // }
  } catch (err) {
    // If an error occurs while fetching the receiver, send an Internal Server Error response
    cb({
      status: 'Internal Server Error',
      error: 'Failed to fetch receiver details'
    });

    // Return null if an error occurs
    return null;
  }
};

// Remove a specific socket ID from a user's socket IDs array
export const removeUserSocketId = async (userId, socketId) => {
  try {
    // Update the user by removing the socket ID from their socketIds array
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { socketIds: socketId } }, // Pull the socketId from the array
      { new: true } // Return the updated user document
    );
    return user; // Return the updated user object
  } catch (err) {
    // If an error occurs during the update, log the error and rethrow it
    console.error('Error removing socket ID:', err.message);
    throw err; // Throw the error to be handled by the calling function
  }
};

export const userChatList = async (userId) => {
  try {
    // Convert the userId to an ObjectId if it's not already
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Define the aggregation pipeline
    const pipeline = [
      {
        $match: {
          $or: [{ senderId: userObjectId }, { receiverId: userObjectId }]
        }
      },
      {
        $sort: {
          createdAt: -1 // Sorting messages by creation time in descending order
        }
      },
      {
        $group: {
          _id: {
            user: {
              $cond: [
                { $eq: ['$senderId', userObjectId] },
                '$receiverId', // Group by receiver if the current user is the sender
                '$senderId' // Group by sender if the current user is the receiver
              ]
            }
          },
          lastMessage: { $first: '$$ROOT' } // Take the most recent message for each user
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'lastMessage.senderId', // Lookup sender details
          foreignField: '_id',
          as: 'senderDetails'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'lastMessage.receiverId', // Lookup receiver details
          foreignField: '_id',
          as: 'receiverDetails'
        }
      },
      {
        $project: {
          _id: 0,
          userId: '$_id.user', // The user ID of the other participant
          lastMessage: '$lastMessage.message', // Content of the last message
          isRead: '$lastMessage.isRead', // Include the isRead field from lastMessage
          createdAt: '$lastMessage.createdAt', // Timestamp of the last message
          senderName: { $arrayElemAt: ['$senderDetails.name', 0] }, // Sender's name
          receiverName: { $arrayElemAt: ['$receiverDetails.name', 0] } // Receiver's name
        }
      },
      {
        $sort: {
          createdAt: -1 // Reapply sorting by the creation time of the last message
        }
      }
    ];

    // Execute the aggregation
    const chatList = await Message.aggregate(pipeline);

    // Return the chat list
    return chatList;
  } catch (err) {
    console.error('Error fetching chat list:', err);
    throw new Error('Failed to fetch chat list');
  }
};

export const fetchChatHistory = async (currentUserId, userId) => {
  try {
    // Convert the userId and currentUserId to ObjectId if they are not already
    const currentUserObjectId = new mongoose.Types.ObjectId(currentUserId);
    const otherUserObjectId = userId;

    // Update all unread messages where current user is the receiver and other user is the sender
    await Message.updateMany(
      {
        senderId: otherUserObjectId,
        receiverId: currentUserObjectId,
        isRead: false // Only update messages that haven't been read
      },
      {
        $set: { isRead: true } // Set the isRead flag to true
      }
    );

    // Define the aggregation pipeline to fetch the chat history
    const pipeline = [
      {
        $match: {
          $or: [
            { senderId: currentUserObjectId, receiverId: otherUserObjectId },
            { senderId: otherUserObjectId, receiverId: currentUserObjectId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 } // Sort messages in descending order by creation time
      },
      {
        $lookup: {
          from: 'users',
          localField: 'senderId',
          foreignField: '_id',
          as: 'senderDetails'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'receiverId',
          foreignField: '_id',
          as: 'receiverDetails'
        }
      },
      {
        $project: {
          _id: 0, // Exclude the default _id field
          senderId: 1,
          receiverId: 1,
          message: 1,
          createdAt: 1,
          isRead: 1, // Include the isRead field
          senderName: { $arrayElemAt: ['$senderDetails.name', 0] }, // Extract sender name
          receiverName: { $arrayElemAt: ['$receiverDetails.name', 0] } // Extract receiver name
        }
      }
    ];

    // Execute the aggregation
    const chatHistory = await Message.aggregate(pipeline);

    // Return the chat history
    return chatHistory;
  } catch (err) {
    console.error('Error fetching chat history:', err);
    throw new Error('Failed to fetch chat history');
  }
};
