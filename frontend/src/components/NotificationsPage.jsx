import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Heart, MessageCircle, UserPlus, Mail } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearLikeNotification } from '../redux/rtnSlice';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    const { likeNotification } = useSelector(store => store.realTimeNotification);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await axios.get('/api/v1/notification', { withCredentials: true });
                if (res.data.success) {
                    setNotifications(res.data.notifications);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    useEffect(() => {
        dispatch(clearLikeNotification());
    }, []);

    useEffect(() => {
        // If there's new notifications coming into redux while we are here,
        // we append them to our local list and clear redux.
        if (likeNotification.length > 0) {
            setNotifications(prev => {
                const newItems = likeNotification.filter(n => !prev.some(p => p._id === n._id)).map(n => ({
                    ...n,
                    sender: n.userDetails || n.sender,
                    messageString: n.message || n.messageString || ""
                }));
                return [...newItems, ...prev];
            });
            dispatch(clearLikeNotification());
        }
    }, [likeNotification, dispatch]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    const getIcon = (type) => {
        switch (type) {
            case 'like': return <Heart className="w-5 h-5 text-red-500" />;
            case 'comment': return <MessageCircle className="w-5 h-5 text-blue-500" />;
            case 'follow': return <UserPlus className="w-5 h-5 text-green-500" />;
            case 'message': return <Mail className="w-5 h-5 text-purple-500" />;
            default: return <Heart className="w-5 h-5" />;
        }
    };

    return (
        <div className="flex justify-center flex-grow pt-4 mb-20 md:mb-0">
            <div className="w-full max-w-2xl px-4 md:px-0">
                <h1 className="text-2xl font-bold mb-6">Notifications</h1>
                {notifications.length === 0 ? (
                    <p className="text-gray-500 text-center">No notifications yet.</p>
                ) : (
                    <div className="flex flex-col gap-4">
                        {notifications.map((notif) => (
                            <div key={notif._id} className="flex flex-row items-center justify-between p-4 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    <Link to={`/profile/${notif.sender?._id}`}>
                                        <div className="relative">
                                            <Avatar className="w-12 h-12 border">
                                                <AvatarImage src={notif.sender?.profilePicture} />
                                                <AvatarFallback>CN</AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                                                {getIcon(notif.type)}
                                            </div>
                                        </div>
                                    </Link>
                                    <div className="flex flex-col">
                                        <span className="text-sm">
                                            <Link to={`/profile/${notif.sender?._id}`} className="font-bold hover:underline">
                                                {notif.sender?.username}
                                            </Link>{' '}
                                            {notif.messageString.replace(notif.sender?.username, '').trim()}
                                        </span>
                                        <span className="text-xs text-gray-400 mt-1">
                                            {new Date(notif.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                {notif.post?.image && (
                                    <Link to={`/`}>
                                        <img src={notif.post.image} alt="post" className="w-12 h-12 rounded object-cover" />
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
