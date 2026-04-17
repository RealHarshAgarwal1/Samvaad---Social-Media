import { Conversation } from "../models/conversation.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import { Message } from "../models/message.model.js"
import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";
// for chatting
export const sendMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const { textMessage: message } = req.body;

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });
        // establish the conversation if not started yet.
        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId]
            })
        };
        const newMessage = await Message.create({
            senderId,
            receiverId,
            message
        });
        if (newMessage) conversation.messages.push(newMessage._id);

        await Promise.all([conversation.save(), newMessage.save()])

        const senderUser = await User.findById(senderId).select('username profilePicture');
        const newNotification = await Notification.create({
            recipient: receiverId,
            sender: senderId,
            type: 'message',
            messageString: `${senderUser.username} sent you a message.`
        });

        // implement socket io for real time data transfer
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', newMessage);
            io.to(receiverSocketId).emit('notification', {
                _id: newNotification._id,
                type: 'message',
                userId: senderId,
                userDetails: senderUser,
                message: newNotification.messageString,
                createdAt: newNotification.createdAt
            });
        }

        return res.status(201).json({
            success: true,
            newMessage
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: error.message || "Internal server error",
            success: false
        });
    }
}
export const getMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        }).populate('messages');
        if (!conversation) return res.status(200).json({ success: true, messages: [] });

        return res.status(200).json({ success: true, messages: conversation?.messages });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: error.message || "Internal server error",
            success: false
        });
    }
}