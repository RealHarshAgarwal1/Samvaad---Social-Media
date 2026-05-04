import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from './ui/dialog'
import { Bookmark, MessageCircle, MoreHorizontal, Send } from 'lucide-react'
import { Button } from './ui/button'
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentDialog from './CommentDialog'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'sonner'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import { Badge } from './ui/badge'

const Post = ({ post }) => {
    const [text, setText] = useState("");
    const [open, setOpen] = useState(false);
    const { user } = useSelector(store => store.auth);
    const { posts } = useSelector(store => store.post);
    const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
    const [postLike, setPostLike] = useState(post.likes.length);
    const [comment, setComment] = useState(post.comments);
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        const inputText = e.target.value;
        if (inputText.trim()) {
            setText(inputText);
        } else {
            setText("");
        }
    }

    const likeOrDislikeHandler = async () => {
        try {
            const action = liked ? 'dislike' : 'like';
            const res = await axios.get(`/api/v1/post/${post._id}/${action}`, { withCredentials: true });
            if (res.data.success) {
                const updatedLikes = liked ? postLike - 1 : postLike + 1;
                setPostLike(updatedLikes);
                setLiked(!liked);
                const updatedPostData = posts.map(p =>
                    p._id === post._id ? {
                        ...p,
                        likes: liked ? p.likes.filter(id => id !== user._id) : [...p.likes, user._id]
                    } : p
                );
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const commentHandler = async () => {
        try {
            const res = await axios.post(`/api/v1/post/${post._id}/comment`, { text }, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });
            if (res.data.success) {
                const updatedCommentData = [...comment, res.data.comment];
                setComment(updatedCommentData);
                const updatedPostData = posts.map(p =>
                    p._id === post._id ? { ...p, comments: updatedCommentData } : p
                );
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
                setText("");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const deletePostHandler = async () => {
        try {
            const res = await axios.delete(`/api/v1/post/delete/${post?._id}`, { withCredentials: true })
            if (res.data.success) {
                const updatedPostData = posts.filter((postItem) => postItem?._id !== post?._id);
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.messsage);
        }
    }

    const bookmarkHandler = async () => {
        try {
            const res = await axios.get(`/api/v1/post/${post?._id}/bookmark`, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const shareHandler = async () => {
        try {
            await navigator.clipboard.writeText(`${window.location.origin}/`);
            toast.success("Link copied to clipboard!");
        } catch (err) {
            toast.error("Failed to copy link");
        }
    }

    return (
        <div className='my-6 w-full max-w-lg mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden card-hover'>
            {/* Header */}
            <div className='flex items-center justify-between px-4 py-3'>
                <div className='flex items-center gap-3'>
                    <Avatar className="ring-2 ring-offset-1 ring-gray-100">
                        <AvatarImage src={post.author?.profilePicture} alt="post_image" />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white text-sm">{post.author?.username?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className='flex items-center gap-2'>
                        <h1 className='font-semibold text-sm'>{post.author?.username}</h1>
                        {user?._id === post.author._id && <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-0 text-[10px] px-2">Author</Badge>}
                    </div>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <MoreHorizontal className='cursor-pointer text-gray-400 hover:text-gray-600 transition-colors' size={20} />
                    </DialogTrigger>
                    <DialogContent className="flex flex-col items-center text-sm text-center rounded-2xl border-0 shadow-xl">
                        <DialogTitle className="sr-only">Post Options</DialogTitle>
                        <DialogDescription className="sr-only">Options for this post.</DialogDescription>
                        {post?.author?._id !== user?._id && <Button variant='ghost' className="cursor-pointer w-fit text-red-500 font-semibold hover:bg-red-50">Unfollow</Button>}
                        <Button variant='ghost' className="cursor-pointer w-fit hover:bg-gray-50">Add to favorites</Button>
                        {user && user?._id === post?.author._id && <Button onClick={deletePostHandler} variant='ghost' className="cursor-pointer w-fit text-red-500 hover:bg-red-50">Delete</Button>}
                    </DialogContent>
                </Dialog>
            </div>

            {/* Image or Video */}
            {post?.isReel || post?.video ? (
                <video
                    className='w-full aspect-square object-cover cursor-pointer'
                    src={post.video}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    onClick={() => { dispatch(setSelectedPost(post)); setOpen(true); }}
                />
            ) : (
                <img
                    className='w-full aspect-square object-cover cursor-pointer'
                    src={post.image}
                    alt="post_img"
                    onClick={() => { dispatch(setSelectedPost(post)); setOpen(true); }}
                />
            )}

            {/* Actions */}
            <div className='px-4 pt-3'>
                <div className='flex items-center justify-between mb-2'>
                    <div className='flex items-center gap-4'>
                        {liked ?
                            <FaHeart onClick={likeOrDislikeHandler} size={'22'} className='cursor-pointer text-red-500 transition-transform active:scale-125' /> :
                            <FaRegHeart onClick={likeOrDislikeHandler} size={'22'} className='cursor-pointer hover:text-gray-500 transition-colors' />
                        }
                        <MessageCircle onClick={() => { dispatch(setSelectedPost(post)); setOpen(true); }} className='cursor-pointer hover:text-gray-500 transition-colors' size={22} />
                        <Send onClick={shareHandler} className='cursor-pointer hover:text-gray-500 transition-colors' size={22} />
                    </div>
                    <Bookmark onClick={bookmarkHandler} className='cursor-pointer hover:text-gray-500 transition-colors' size={22} />
                </div>

                <span className='font-semibold text-sm block'>{postLike} likes</span>

                <p className='text-sm mt-1'>
                    <span className='font-semibold mr-1.5'>{post.author?.username}</span>
                    <span className="text-gray-700">{post.caption}</span>
                </p>

                {comment.length > 0 && (
                    <span onClick={() => { dispatch(setSelectedPost(post)); setOpen(true); }}
                        className='cursor-pointer text-sm text-gray-400 hover:text-gray-500 transition-colors block mt-1'>
                        View all {comment.length} comments
                    </span>
                )}

                <CommentDialog open={open} setOpen={setOpen} />

                {/* Comment input */}
                <div className='flex items-center py-3 border-t border-gray-100 mt-3'>
                    <input
                        type="text"
                        placeholder='Add a comment...'
                        value={text}
                        onChange={changeEventHandler}
                        className='outline-none text-sm w-full bg-transparent placeholder-gray-400'
                    />
                    {text && <span onClick={commentHandler} className='text-indigo-500 font-semibold text-sm cursor-pointer hover:text-indigo-600 transition-colors ml-2'>Post</span>}
                </div>
            </div>
        </div>
    )
}

export default Post