import { Notification } from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
    try {
        const userId = req.id;
        const notifications = await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .populate('sender', 'username profilePicture')
            .populate('post', 'image');

        // Mark them as read once fetched
        await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });

        return res.status(200).json({
            success: true,
            notifications
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: error.message || 'Internal server error',
            success: false
        });
    }
}
