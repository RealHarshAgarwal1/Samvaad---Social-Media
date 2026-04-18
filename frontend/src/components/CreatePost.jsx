import React, { useRef, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { readFileAsDataURL } from '@/lib/utils';
import { Loader2, ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setPosts } from '@/redux/postSlice';

const CreatePost = ({ open, setOpen }) => {
  const imageRef = useRef();
  const [file, setFile] = useState("");
  const [caption, setCaption] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useSelector(store => store.auth);
  const { posts } = useSelector(store => store.post);
  const dispatch = useDispatch();

  const fileChangeHandler = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const dataUrl = await readFileAsDataURL(file);
      setImagePreview(dataUrl);
    }
  }

  const createPostHandler = async (e) => {
    const formData = new FormData();
    formData.append("caption", caption);
    if (imagePreview) formData.append("image", file);
    try {
      setLoading(true);
      const res = await axios.post('/api/v1/post/addpost', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      if (res.data.success) {
        dispatch(setPosts([res.data.post, ...posts]));
        toast.success(res.data.message);
        setOpen(false);
        setCaption("");
        setImagePreview("");
        setFile("");
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent onInteractOutside={() => setOpen(false)} className="rounded-2xl border-0 shadow-2xl max-w-lg">
        <DialogTitle className='sr-only'>Create New Post</DialogTitle>
        <DialogDescription className='sr-only'>Write a caption and upload an image to share a new post.</DialogDescription>
        <DialogHeader className='text-center font-semibold text-lg'>Create New Post</DialogHeader>
        
        <div className='flex gap-3 items-center'>
          <Avatar className="w-10 h-10">
            <AvatarImage src={user?.profilePicture} alt="img" />
            <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white">{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className='font-semibold text-sm'>{user?.username}</h1>
            <span className='text-gray-400 text-xs'>{user?.bio || 'Share something...'}</span>
          </div>
        </div>

        <Textarea 
          value={caption} 
          onChange={(e) => setCaption(e.target.value)} 
          className="focus-visible:ring-indigo-200 border-gray-200 rounded-xl resize-none min-h-[80px]" 
          placeholder="Write a caption..." 
        />

        {imagePreview ? (
          <div className='relative w-full h-64 rounded-xl overflow-hidden group'>
            <img src={imagePreview} alt="preview_img" className='object-cover h-full w-full' />
            <button 
              onClick={() => { setImagePreview(""); setFile(""); }} 
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div 
            onClick={() => imageRef.current.click()} 
            className="w-full h-40 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all duration-200"
          >
            <ImagePlus className="w-8 h-8 text-gray-300 mb-2" />
            <span className="text-sm text-gray-400">Click to select an image</span>
          </div>
        )}

        <input ref={imageRef} type='file' className='hidden' onChange={fileChangeHandler} accept="image/*" />

        {imagePreview && (
          loading ? (
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl h-11">
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Posting...
            </Button>
          ) : (
            <Button onClick={createPostHandler} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl h-11 font-semibold shadow-sm">Share Post</Button>
          )
        )}
      </DialogContent>
    </Dialog>
  )
}

export default CreatePost