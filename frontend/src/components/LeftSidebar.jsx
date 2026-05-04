import { Heart, Home, LogOut, MessageCircle, PlusSquare, Search, TrendingUp, Bell, Film } from 'lucide-react'
import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { toast } from 'sonner'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setAuthUser } from '@/redux/authSlice'
import CreatePost from './CreatePost'
import { setPosts, setSelectedPost } from '@/redux/postSlice'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

const LeftSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSelector(store => store.auth);
    const { likeNotification } = useSelector(store => store.realTimeNotification);
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);

    const logoutHandler = async () => {
        try {
            const res = await axios.get('/api/v1/user/logout', { withCredentials: true });
            if (res.data.success) {
                dispatch(setAuthUser(null));
                dispatch(setSelectedPost(null));
                dispatch(setPosts([]));
                navigate("/login");
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }
    }

    const searchHandler = async () => {
        if (!searchQuery) return;
        try {
            setSearchLoading(true);
            const res = await axios.get(`/api/v1/user/search?query=${searchQuery}`, { withCredentials: true });
            if (res.data.success) {
                setSearchResults(res.data.users);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setSearchLoading(false);
        }
    }

    const sidebarHandler = (textType) => {
        if (textType === 'Logout') {
            logoutHandler();
        } else if (textType === "Create") {
            setOpen(true);
        } else if (textType === "Profile") {
            navigate(`/profile/${user?._id}`);
        } else if (textType === "Home") {
            navigate("/");
        } else if (textType === 'Messages') {
            navigate("/chat");
        } else if (textType === 'Explore') {
            navigate("/explore");
        } else if (textType === 'Reels') {
            navigate("/reels");
        } else if (textType === 'Notifications') {
            navigate("/notifications");
        } else if (textType === 'Search') {
            setSearchOpen(true);
        }
    }

    const isActive = (text) => {
        const map = { 'Home': '/', 'Search': '/search', 'Explore': '/explore', 'Reels': '/reels', 'Messages': '/chat', 'Notifications': '/notifications', 'Profile': `/profile/${user?._id}` };
        return location.pathname === map[text];
    };

    const sidebarItems = [
        { icon: <Home />, text: "Home" },
        { icon: <Search />, text: "Search" },
        { icon: <TrendingUp />, text: "Explore" },
        { icon: <Film />, text: "Reels" },
        { icon: <MessageCircle />, text: "Messages" },
        { icon: <Bell />, text: "Notifications" },
        { icon: <PlusSquare />, text: "Create" },
        {
            icon: (
                <Avatar className='w-6 h-6 ring-2 ring-offset-1 ring-transparent group-hover:ring-indigo-400 transition-all'>
                    <AvatarImage src={user?.profilePicture} alt="profile" />
                    <AvatarFallback className="text-[10px] bg-gradient-to-br from-indigo-400 to-purple-400 text-white">{user?.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
            ),
            text: "Profile"
        },
        { icon: <LogOut />, text: "Logout" },
    ]

    return (
        <>
            {/* Desktop sidebar */}
            <div className='fixed top-0 z-50 left-0 hidden md:flex flex-col border-r border-gray-200/80 md:w-20 lg:w-64 h-screen bg-white/95 backdrop-blur-sm'>
                <div className='flex flex-col h-full px-3 py-6'>
                    {/* Logo */}
                    <div className='mb-8 px-3'>
                        <h1 className='font-bold text-xl logo-robotic gradient-text hidden lg:block'>Samvaad</h1>
                        <h1 className='font-bold text-xl logo-robotic gradient-text lg:hidden text-center'>S</h1>
                    </div>

                    {/* Nav items */}
                    <nav className='flex-1 flex flex-col gap-1'>
                        {sidebarItems.map((item, index) => {
                            if (item.text === "Logout") {
                                return (
                                    <div onClick={() => sidebarHandler(item.text)} key={index}
                                        className='group flex items-center gap-4 px-3 py-3 rounded-xl cursor-pointer text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all duration-200 mt-auto'>
                                        {item.icon}
                                        <span className="hidden lg:block text-sm font-medium">{item.text}</span>
                                    </div>
                                )
                            }
                            const active = isActive(item.text);
                            return (
                                <div onClick={() => sidebarHandler(item.text)} key={index}
                                    className={`group flex items-center gap-4 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200
                                    ${active ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                                    <div className="relative">
                                        {item.icon}
                                        {item.text === "Notifications" && likeNotification.length > 0 && (
                                            <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm">
                                                {likeNotification.length}
                                            </span>
                                        )}
                                    </div>
                                    <span className="hidden lg:block text-sm font-medium">{item.text}</span>
                                </div>
                            )
                        })}
                    </nav>
                </div>
            </div>

            {/* Mobile bottom bar */}
            <div className='fixed bottom-0 z-50 left-0 md:hidden w-full h-16 bg-white/95 backdrop-blur-sm border-t border-gray-200/80'>
                <div className='flex justify-around items-center h-full px-2'>
                    {sidebarItems.filter(item => !['Logout', 'Search'].includes(item.text)).map((item, index) => {
                        const active = isActive(item.text);
                        return (
                            <div onClick={() => sidebarHandler(item.text)} key={index}
                                className={`flex flex-col items-center justify-center p-2 rounded-xl cursor-pointer transition-all duration-200
                                ${active ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-700'}`}>
                                <div className="relative">
                                    {React.cloneElement(item.icon, { size: 22 })}
                                    {item.text === "Notifications" && likeNotification.length > 0 && (
                                        <span className="absolute -top-1 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                                            {likeNotification.length}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <CreatePost open={open} setOpen={setOpen} />
            <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
                <DialogContent className='max-w-md w-[92vw] rounded-2xl mx-auto border-0 shadow-xl'>
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">Search Users</DialogTitle>
                    </DialogHeader>
                    <div className='flex gap-2 mt-2'>
                        <Input
                            placeholder='Search by username or email'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && searchHandler()}
                            className="rounded-xl border-gray-200 focus:border-indigo-300"
                        />
                        <Button onClick={searchHandler} disabled={searchLoading} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-6">
                            {searchLoading ? <Loader2 className='animate-spin h-4 w-4' /> : 'Search'}
                        </Button>
                    </div>
                    <div className='max-h-60 overflow-y-auto mt-2'>
                        {
                            searchResults.length > 0 ? (
                                searchResults.map((u) => (
                                    <div key={u._id} className='flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors' onClick={() => { setSearchOpen(false); navigate(`/profile/${u._id}`); }}>
                                        <Avatar className='w-10 h-10'>
                                            <AvatarImage src={u.profilePicture} />
                                            <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white text-sm">{u.username?.[0]?.toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className='flex flex-col'>
                                            <span className='font-semibold text-sm'>{u.username}</span>
                                            <span className='text-xs text-gray-400 line-clamp-1'>{u.bio || 'No bio'}</span>
                                        </div>
                                    </div>
                                ))
                            ) : searchLoading ? null : <p className='text-center text-gray-400 text-sm py-4'>No users found</p>
                        }
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default LeftSidebar