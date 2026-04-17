import { Heart, Home, LogOut, MessageCircle, PlusSquare, Search, TrendingUp } from 'lucide-react'
import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { toast } from 'sonner'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setAuthUser } from '@/redux/authSlice'
import CreatePost from './CreatePost'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Button } from './ui/button'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

const LeftSidebar = () => {
    const navigate = useNavigate();
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
        } else if (textType === 'Notifications') {
            navigate("/notifications");
        } else if (textType === 'Search') {
            setSearchOpen(true);
        }
    }

    const sidebarItems = [
        { icon: <Home />, text: "Home" },
        { icon: <Search />, text: "Search" },
        { icon: <TrendingUp />, text: "Explore" },
        { icon: <MessageCircle />, text: "Messages" },
        { icon: <Heart />, text: "Notifications" },
        { icon: <PlusSquare />, text: "Create" },
        {
            icon: (
                <Avatar className='w-6 h-6'>
                    <AvatarImage src={user?.profilePicture} alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            ),
            text: "Profile"
        },
        { icon: <LogOut />, text: "Logout" },
    ]
    return (
        <div className='fixed bottom-0 md:top-0 z-50 left-0 px-2 md:px-4 border-t md:border-t-0 md:border-r border-gray-300 w-full md:w-20 lg:w-[16%] h-14 md:h-screen bg-white'>
            <div className='flex flex-col h-full'>
                <h1 className='md:my-8 pl-3 font-bold text-xl logo-robotic hidden lg:block'>Samvaad</h1>
                <div className='flex flex-row md:flex-col justify-around md:justify-start w-full md:w-auto h-full items-center md:items-stretch'>
                    {
                        sidebarItems.map((item, index) => {
                            if(item.text === "Logout") {
                                return (
                                    <div onClick={() => sidebarHandler(item.text)} key={index} className='hidden md:flex items-center justify-center lg:justify-start gap-3 relative hover:bg-gray-100 cursor-pointer rounded-lg p-3 my-3'>
                                        {item.icon}
                                        <span className="hidden lg:block">{item.text}</span>
                                    </div>
                                )
                            }
                            return (
                                <div onClick={() => sidebarHandler(item.text)} key={index} className='flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-3 relative hover:bg-gray-100 cursor-pointer rounded-lg p-2 md:p-3 md:my-3'>
                                    <div className="relative">
                                        {item.icon}
                                        {item.text === "Notifications" && likeNotification.length > 0 && (
                                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">
                                                {likeNotification.length}
                                            </span>
                                        )}
                                    </div>
                                    <span className="hidden lg:block">{item.text}</span>
                                </div>
                            )
                        })
                    }
                </div>
            </div>

            <CreatePost open={open} setOpen={setOpen} />
            <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
                <DialogContent className='max-w-sm w-[90vw] rounded-2xl mx-auto'>
                    <DialogHeader>
                        <DialogTitle>Search Users</DialogTitle>
                    </DialogHeader>
                    <div className='flex gap-2 my-4'>
                        <Input
                            placeholder='Search by username or email'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Button onClick={searchHandler} disabled={searchLoading}>
                            {searchLoading ? <Loader2 className='animate-spin h-4 w-4' /> : 'Search'}
                        </Button>
                    </div>
                    <div className='max-h-60 overflow-y-auto'>
                        {
                            searchResults.length > 0 ? (
                                searchResults.map((u) => (
                                    <div key={u._id} className='flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md cursor-pointer' onClick={() => { setSearchOpen(false); navigate(`/profile/${u._id}`); }}>
                                        <Avatar className='w-8 h-8'>
                                            <AvatarImage src={u.profilePicture} />
                                            <AvatarFallback>CN</AvatarFallback>
                                        </Avatar>
                                        <div className='flex flex-col'>
                                            <span className='font-bold text-sm'>{u.username}</span>
                                            <span className='text-xs text-gray-500 line-clamp-1'>{u.bio || 'No bio'}</span>
                                        </div>
                                    </div>
                                ))
                            ) : searchLoading ? null : <p className='text-center text-gray-500'>No users found</p>
                        }
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default LeftSidebar