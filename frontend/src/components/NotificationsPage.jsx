import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Heart, MessageCircle, UserPlus, Mail, Bell } from 'lucide-react';
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
        return (
            <div className="flex justify-center items-center h-[80vh]">
                <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    const getIcon = (type) => {
        switch (type) {
            case 'like': return <Heart className="w-4 h-4 text-red-500" fill="currentColor" />;
            case 'comment': return <MessageCircle className="w-4 h-4 text-blue-500" />;
            case 'follow': return <UserPlus className="w-4 h-4 text-green-500" />;
            case 'message': return <Mail className="w-4 h-4 text-purple-500" />;
            default: return <Heart className="w-4 h-4" />;
        }
    };

    const getIconBg = (type) => {
        switch (type) {
            case 'like': return 'bg-red-50';
            case 'comment': return 'bg-blue-50';
            case 'follow': return 'bg-green-50';
            case 'message': return 'bg-purple-50';
            default: return 'bg-gray-50';
        }
    };

    const timeAgo = (date) => {
        const now = new Date();
        const diff = Math.floor((now - new Date(date)) / 1000);
        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    return (
        <div className="max-w-2xl mx-auto pt-6 pb-20 md:pb-6 px-4">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-xs text-gray-400">Stay updated with your interactions</p>
                </div>
            </div>

            {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Bell className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-400 font-medium">No notifications yet</p>
                    <p className="text-gray-300 text-sm mt-1">When someone interacts with you, it'll show up here</p>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {notifications.map((notif) => (
                        <div key={notif._id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 group">
                            <Link to={`/profile/${notif.sender?._id}`} className="relative flex-shrink-0">
                                <Avatar className="w-11 h-11">
                                    <AvatarImage src={notif.sender?.profilePicture} />
                                    <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white text-sm">{notif.sender?.username?.[0]?.toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className={`absolute -bottom-1 -right-1 rounded-full p-1 shadow-sm ${getIconBg(notif.type)}`}>
                                    {getIcon(notif.type)}
                                </div>
                            </Link>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm leading-tight">
                                    <Link to={`/profile/${notif.sender?._id}`} className="font-semibold hover:text-indigo-600 transition-colors">
                                        {notif.sender?.username}
                                    </Link>{' '}
                                    <span className="text-gray-600">{(notif.messageString || '').replace(notif.sender?.username || '', '').trim()}</span>
                                </p>
                                <span className="text-[11px] text-gray-400 mt-0.5 block">
                                    {timeAgo(notif.createdAt)}
                                </span>
                            </div>
                            {notif.post?.image && (
                                <img src={notif.post.image} alt="post" className="w-11 h-11 rounded-lg object-cover flex-shrink-0" />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
