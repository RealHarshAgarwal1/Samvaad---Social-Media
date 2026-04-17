import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import axios from 'axios';
import { toast } from 'sonner';

const SuggestedUserItem = ({ user }) => {
    // We assume initially they are not followed since they are "suggested"
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
        <div className='flex items-center justify-between my-5'>
            <div className='flex items-center gap-2'>
                <Link to={`/profile/${user?._id}`}>
                    <Avatar>
                        <AvatarImage src={user?.profilePicture} alt="post_image" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                </Link>
                <div>
                    <h1 className='font-semibold text-sm'><Link to={`/profile/${user?._id}`}>{user?.username}</Link></h1>
                    <span className='text-gray-600 text-sm line-clamp-1'>{user?.bio || 'Bio here...'}</span>
                </div>
            </div>
            <button 
                onClick={followHandler} 
                disabled={loading}
                className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all duration-300 w-24 ${
                    isFollowing 
                        ? 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200' 
                        : 'bg-blue-50 text-blue-500 border-blue-50 hover:bg-blue-100'
                }`}
            >
                {loading ? 'Wait...' : (isFollowing ? 'Following' : 'Follow')}
            </button>
        </div>
    )
}

const SuggestedUsers = () => {
    const { suggestedUsers } = useSelector(store => store.auth);

    return (
        <div className='my-10'>
            <div className='flex items-center justify-between text-sm mb-4'>
                <h1 className='font-semibold text-gray-600'>Suggested for you</h1>
                <span className='font-medium cursor-pointer'>See All</span>
            </div>
            {
                suggestedUsers?.map((user) => {
                    return <SuggestedUserItem key={user._id} user={user} />
                })
            }
        </div>
    )
}

export default SuggestedUsers