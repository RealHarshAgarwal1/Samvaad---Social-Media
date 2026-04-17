import React, { useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Heart, MessageCircle } from 'lucide-react'
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
        <div className='flex max-w-5xl justify-center mx-auto pl-10'>
            <div className='my-8 w-full p-8'>
                <div className='grid grid-cols-3 gap-1'>
                    {
                        posts?.map((post) => {
                            return (
                                <div key={post?._id} className='relative group cursor-pointer'>
                                    <Link to={`/profile/${post?.author?._id}`}>
                                        <img src={post.image} alt='postimage' className='rounded-sm my-2 w-full aspect-square object-cover' />
                                        <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                                            <div className='flex items-center text-white space-x-4'>
                                                <button className='flex items-center gap-2 hover:text-gray-300'>
                                                    <Heart />
                                                    <span>{post?.likes.length}</span>
                                                </button>
                                                <button className='flex items-center gap-2 hover:text-gray-300'>
                                                    <MessageCircle />
                                                    <span>{post?.comments.length}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    )
}

export default Explore
