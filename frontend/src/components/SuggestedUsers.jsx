import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import axios from 'axios';
import { toast } from 'sonner';

const SuggestedUserItem = ({ user }) => {
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(false);

    const followHandler = async () => {
        try {
            setLoading(true);
            const res = await axios.post(`/api/v1/user/followorunfollow/${user?._id}`, {}, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                setIsFollowing(!isFollowing);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || 'Failed to follow');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='flex items-center justify-between py-3'>
            <div className='flex items-center gap-3'>
                <Link to={`/profile/${user?._id}`}>
                    <Avatar className="w-10 h-10">
                        <AvatarImage src={user?.profilePicture} alt="profile" />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white text-sm">{user?.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                </Link>
                <div>
                    <h1 className='font-semibold text-sm'><Link to={`/profile/${user?._id}`} className="hover:text-indigo-600 transition-colors">{user?.username}</Link></h1>
                    <span className='text-gray-400 text-xs line-clamp-1'>{user?.bio || 'New to Samvaad'}</span>
                </div>
            </div>
            <button 
                onClick={followHandler} 
                disabled={loading}
                className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all duration-200 ${
                    isFollowing 
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                }`}
            >
                {loading ? '...' : (isFollowing ? 'Following' : 'Follow')}
            </button>
        </div>
    )
}

const SuggestedUsers = () => {
    const { suggestedUsers } = useSelector(store => store.auth);

    return (
        <div className='mt-8'>
            <div className='flex items-center justify-between mb-3'>
                <h1 className='font-semibold text-sm text-gray-400 uppercase tracking-wider'>Suggested for you</h1>
                <span className='font-semibold text-xs text-indigo-600 cursor-pointer hover:text-indigo-700 transition-colors'>See All</span>
            </div>
            <div className="divide-y divide-gray-50">
                {suggestedUsers?.map((user) => (
                    <SuggestedUserItem key={user._id} user={user} />
                ))}
            </div>
        </div>
    )
}

export default SuggestedUsers