import React, { useEffect } from 'react'
import { Heart, MessageCircle, Compass } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import { setPosts } from '@/redux/postSlice'
import { Link } from 'react-router-dom'

const Explore = () => {
    const dispatch = useDispatch();
    const { posts } = useSelector(store => store.post);

    useEffect(() => {
        const fetchAllPosts = async () => {
            try {
                const res = await axios.get('/api/v1/post/all', { withCredentials: true });
                if (res.data.success) {
                    dispatch(setPosts(res.data.posts));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllPosts();
    }, [dispatch]);

    return (
        <div className='max-w-5xl mx-auto px-4 py-6 pb-20 md:pb-6'>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                    <Compass className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Explore</h1>
                    <p className="text-xs text-gray-400">Discover posts from everyone</p>
                </div>
            </div>

            <div className='grid grid-cols-2 sm:grid-cols-3 gap-1'>
                {posts?.map((post) => (
                    <div key={post?._id} className='relative group cursor-pointer aspect-square overflow-hidden rounded-sm'>
                        <Link to={`/profile/${post?.author?._id}`}>
                            <img src={post.image} alt='postimage' className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105' />
                            <div className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
                                <div className='flex items-center text-white gap-6'>
                                    <span className='flex items-center gap-1.5 font-semibold text-sm'>
                                        <Heart size={18} fill="white" /> {post?.likes?.length}
                                    </span>
                                    <span className='flex items-center gap-1.5 font-semibold text-sm'>
                                        <MessageCircle size={18} fill="white" /> {post?.comments?.length}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            {(!posts || posts.length === 0) && (
                <div className="flex flex-col items-center justify-center py-20">
                    <Compass className="w-12 h-12 text-gray-200 mb-3" />
                    <p className="text-gray-400">No posts to explore yet</p>
                </div>
            )}
        </div>
    )
}

export default Explore
