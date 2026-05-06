import React, { useRef, useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { readFileAsDataURL } from '@/lib/utils';
import { Loader2, ImagePlus, X, Tag, Search, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setPosts } from '@/redux/postSlice';
import VibeMeter from './VibeMeter';

const CreatePost = ({ open, setOpen }) => {
  const imageRef = useRef();
  const [file, setFile] = useState("");
  const [caption, setCaption] = useState("");
  const [filePreview, setFilePreview] = useState("");
  const [fileType, setFileType] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useSelector(store => store.auth);
  const { posts } = useSelector(store => store.post);
  const dispatch = useDispatch();

  const [location, setLocation] = useState("");

  // Tag people state
  const [showTagSearch, setShowTagSearch] = useState(false);
  const [tagQuery, setTagQuery] = useState("");
  const [tagSearchResults, setTagSearchResults] = useState([]);
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [tagSearching, setTagSearching] = useState(false);

  // Debounced user search for tagging
  useEffect(() => {
    if (!tagQuery.trim()) {
      setTagSearchResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        setTagSearching(true);
        const res = await axios.get(`/api/v1/user/search?query=${encodeURIComponent(tagQuery)}`, { withCredentials: true });
        if (res.data.success) {
          // Filter out already tagged users and the current user
          const filtered = res.data.users.filter(
            u => u._id !== user?._id && !taggedUsers.some(t => t._id === u._id)
          );
          setTagSearchResults(filtered);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setTagSearching(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [tagQuery, taggedUsers, user]);

  const addTaggedUser = (u) => {
    setTaggedUsers(prev => [...prev, u]);
    setTagQuery("");
    setTagSearchResults([]);
  };

  const removeTaggedUser = (userId) => {
    setTaggedUsers(prev => prev.filter(u => u._id !== userId));
  };

  const fileChangeHandler = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      setFileType(file.type.startsWith('video/') ? 'video' : 'image');
      const dataUrl = await readFileAsDataURL(file);
      setFilePreview(dataUrl);
    }
  }

  const createPostHandler = async (e) => {
    const formData = new FormData();
    formData.append("caption", caption);
    if (filePreview) formData.append("file", file);
    if (location) formData.append("location", location);
    if (taggedUsers.length > 0) {
      formData.append("taggedUsers", JSON.stringify(taggedUsers.map(u => u._id)));
    }
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
        setFilePreview("");
        setFileType("");
        setFile("");
        setLocation("");
        setTaggedUsers([]);
        setShowTagSearch(false);
        setTagQuery("");
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
        <DialogTitle className='sr-only'>Create New Post or Reel</DialogTitle>
        <DialogDescription className='sr-only'>Write a caption and upload an image or video to share a new post.</DialogDescription>
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

        {/* ── Vibe Meter ── */}
        <VibeMeter text={caption} />

        {/* ── Add Location Section ── */}
        <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-2">
          <MapPin size={16} className="text-gray-400" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Add Location"
            className="flex-1 text-sm focus:outline-none placeholder-gray-400 bg-transparent"
          />
        </div>

        {/* ── Tag People Section ── */}
        <div>
          <button
            type="button"
            onClick={() => setShowTagSearch(!showTagSearch)}
            className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors py-1"
          >
            <Tag size={16} />
            {taggedUsers.length > 0 ? `Tag People (${taggedUsers.length})` : 'Tag People'}
          </button>

          {/* Tagged user chips */}
          {taggedUsers.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {taggedUsers.map(u => (
                <span key={u._id} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-medium">
                  <Avatar className="w-4 h-4">
                    <AvatarImage src={u.profilePicture} />
                    <AvatarFallback className="bg-indigo-200 text-indigo-700 text-[8px]">{u.username?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  @{u.username}
                  <button
                    type="button"
                    onClick={() => removeTaggedUser(u._id)}
                    className="ml-0.5 hover:bg-indigo-100 rounded-full p-0.5 transition-colors"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Tag search input & dropdown */}
          {showTagSearch && (
            <div className="mt-2 relative">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={tagQuery}
                  onChange={(e) => setTagQuery(e.target.value)}
                  placeholder="Search users to tag..."
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all bg-gray-50"
                  autoFocus
                />
              </div>

              {/* Search results dropdown */}
              {(tagSearchResults.length > 0 || tagSearching) && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {tagSearching && (
                    <div className="flex items-center justify-center py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                      <span className="ml-2 text-xs text-gray-400">Searching...</span>
                    </div>
                  )}
                  {tagSearchResults.map(u => (
                    <button
                      key={u._id}
                      type="button"
                      onClick={() => addTaggedUser(u)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-indigo-50 transition-colors text-left"
                    >
                      <Avatar className="w-7 h-7">
                        <AvatarImage src={u.profilePicture} />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white text-[10px]">{u.username?.[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-700">@{u.username}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {filePreview ? (
          <div className='relative w-full h-64 rounded-xl overflow-hidden group bg-black flex items-center justify-center'>
            {fileType === 'video' ? (
              <video src={filePreview} controls className='object-contain h-full w-full' />
            ) : (
              <img src={filePreview} alt="preview_img" className='object-cover h-full w-full' />
            )}
            <button 
              onClick={() => { setFilePreview(""); setFile(""); setFileType(""); }} 
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
            <span className="text-sm text-gray-400">Click to select an image or video</span>
          </div>
        )}

        <input ref={imageRef} type='file' className='hidden' onChange={fileChangeHandler} accept="image/*,video/*" />

        {filePreview && (
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