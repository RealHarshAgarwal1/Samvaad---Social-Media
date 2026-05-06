import React, { useEffect, useState } from 'react'
import { Heart, MessageCircle, Compass, Trash2, Pencil } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import CommentDialog from './CommentDialog'
import EditPostDialog from './EditPostDialog'
import { toast } from 'sonner'

const Explore = () => {
    const dispatch = useDispatch();
    const { posts } = useSelector(store => store.post);
    const { user } = useSelector(store => store.auth);
    const [openPost, setOpenPost] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [postToEdit, setPostToEdit] = useState(null);

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

    const handlePostClick = (post) => {
        dispatch(setSelectedPost(post));
        setOpenPost(true);
    };

    const handleEditClick = (e, post) => {
        e.preventDefault();
        e.stopPropagation();
        setPostToEdit(post);
        setEditOpen(true);
    };

    const deletePostHandler = async (e, post) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            const res = await axios.delete(`/api/v1/post/delete/${post._id}`, { withCredentials: true });
            if (res.data.success) {
                const updatedPosts = posts.filter(p => p._id !== post._id);
                dispatch(setPosts(updatedPosts));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || 'Failed to delete post');
        }
    };

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
                    <div 
                        key={post?._id} 
                        className='relative group cursor-pointer aspect-square overflow-hidden rounded-sm'
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePostClick(post);
                        }}
                    >
                        {post?.isReel || post?.video ? (
                            <video src={post.video} className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none' muted />
                        ) : (
                            <img src={post.image} alt='postimage' className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none' />
                        )}
                        <div className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none'>
                            <div className='flex items-center text-white gap-6'>
                                <span className='flex items-center gap-1.5 font-semibold text-sm'>
                                    <Heart size={18} fill="white" /> {post?.likes?.length || 0}
                                </span>
                                <span className='flex items-center gap-1.5 font-semibold text-sm'>
                                    <MessageCircle size={18} fill="white" /> {post?.comments?.length || 0}
                                </span>
                            </div>
                        </div>
                        {/* Actions - only for own posts */}
                        {user?._id === post?.author?._id && (
                            <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                                <button
                                    onClick={(e) => handleEditClick(e, post)}
                                    className="bg-white/80 hover:bg-white text-gray-700 rounded-full p-1.5 shadow-lg backdrop-blur-sm transition-colors"
                                    title="Edit post"
                                >
                                    <Pencil size={14} />
                                </button>
                                <button
                                    onClick={(e) => deletePostHandler(e, post)}
                                    className="bg-red-500/80 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors"
                                    title="Delete post"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {(!posts || posts.length === 0) && (
                <div className="flex flex-col items-center justify-center py-20">
                    <Compass className="w-12 h-12 text-gray-200 mb-3" />
                    <p className="text-gray-400">No posts to explore yet</p>
                </div>
            )}
            
            <CommentDialog open={openPost} setOpen={setOpenPost} />
            {postToEdit && <EditPostDialog open={editOpen} setOpen={setEditOpen} post={postToEdit} />}
        </div>
    )
}

export default Explore
