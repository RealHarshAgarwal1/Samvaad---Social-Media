import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from './ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Link } from 'react-router-dom'
import { MoreHorizontal } from 'lucide-react'
import { Button } from './ui/button'
import { useDispatch, useSelector } from 'react-redux'
import Comment from './Comment'
import axios from 'axios'
import { toast } from 'sonner'
import { setPosts } from '@/redux/postSlice'

const CommentDialog = ({ open, setOpen }) => {
  const [text, setText] = useState("");
  const { selectedPost, posts } = useSelector(store => store.post);
  const [comment, setComment] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedPost) {
      setComment(selectedPost.comments);
    }
  }, [selectedPost]);

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else {
      setText("");
    }
  }

  const sendMessageHandler = async () => {
    try {
      const res = await axios.post(`/api/v1/post/${selectedPost?._id}/comment`, { text }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });

      if (res.data.success) {
        const updatedCommentData = [...comment, res.data.comment];
        setComment(updatedCommentData);
        const updatedPostData = posts.map(p =>
          p._id === selectedPost._id ? { ...p, comments: updatedCommentData } : p
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
        setText("");
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent onInteractOutside={() => setOpen(false)} className="max-w-4xl p-0 flex flex-col overflow-hidden rounded-2xl border-0 shadow-2xl">
        <DialogTitle className="sr-only">Comment details</DialogTitle>
        <DialogDescription className="sr-only">View and post comments for this post.</DialogDescription>
        <div className='flex flex-1 max-h-[80vh]'>
          {/* Image */}
          <div className='hidden md:block w-1/2 bg-black'>
            <img
              src={selectedPost?.image}
              alt="post_img"
              className='w-full h-full object-contain'
            />
          </div>

          {/* Comments panel */}
          <div className='w-full md:w-1/2 flex flex-col'>
            {/* Author header */}
            <div className='flex items-center justify-between p-4 border-b border-gray-100'>
              <div className='flex gap-3 items-center'>
                <Link to={`/profile/${selectedPost?.author?._id}`}>
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={selectedPost?.author?.profilePicture} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white text-sm">{selectedPost?.author?.username?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Link>
                <Link to={`/profile/${selectedPost?.author?._id}`} className='font-semibold text-sm hover:text-indigo-600 transition-colors'>{selectedPost?.author?.username}</Link>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <MoreHorizontal className='cursor-pointer text-gray-400 hover:text-gray-600 transition-colors' size={18} />
                </DialogTrigger>
                <DialogContent className="flex flex-col items-center text-sm text-center rounded-2xl">
                  <div className='cursor-pointer w-full text-red-500 font-semibold p-2 hover:bg-red-50 rounded-lg transition-colors'>
                    Unfollow
                  </div>
                  <div className='cursor-pointer w-full p-2 hover:bg-gray-50 rounded-lg transition-colors'>
                    Add to favorites
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Comments list */}
            <div className='flex-1 overflow-y-auto p-4'>
              {comment.map((c) => <Comment key={c._id} comment={c} />)}
              {comment.length === 0 && (
                <p className="text-center text-gray-300 text-sm py-8">No comments yet. Be the first!</p>
              )}
            </div>

            {/* Comment input */}
            <div className='p-3 border-t border-gray-100'>
              <div className='flex items-center gap-2'>
                <input 
                  type="text" 
                  value={text} 
                  onChange={changeEventHandler} 
                  onKeyDown={(e) => e.key === 'Enter' && text.trim() && sendMessageHandler()}
                  placeholder='Add a comment...' 
                  className='w-full outline-none text-sm p-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-indigo-300 transition-colors' 
                />
                <Button 
                  disabled={!text.trim()} 
                  onClick={sendMessageHandler} 
                  className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-4 h-10 text-sm"
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CommentDialog