import React, { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import useGetUserProfile from '@/hooks/useGetUserProfile';
import { Link, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AtSign, Heart, MessageCircle, Grid3X3, Bookmark, Film, Tag, Trash2, Pencil } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { setUserProfile } from '@/redux/authSlice';
import { setPosts, setSelectedPost } from '@/redux/postSlice';
import CommentDialog from './CommentDialog';
import EditPostDialog from './EditPostDialog';

const Profile = () => {
  const params = useParams();
  const userId = params.id;
  useGetUserProfile(userId);
  const [activeTab, setActiveTab] = useState('posts');
  const [openPost, setOpenPost] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);

  const { userProfile, user, taggedPosts } = useSelector(store => store.auth);
  const { posts } = useSelector(store => store.post);
  const dispatch = useDispatch();

  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    setIsFollowing(userProfile?.followers?.includes(user?._id));
  }, [userProfile, user]);

  const isLoggedInUserProfile = user?._id === userProfile?._id;

  const followHandler = async () => {
    try {
      const res = await axios.post(`/api/v1/user/followorunfollow/${userProfile?._id}`, {}, { withCredentials: true });
      if (res.data.success) {
        setIsFollowing(!isFollowing);
        const updatedUserProfile = {
          ...userProfile,
          followers: isFollowing ? userProfile.followers.filter(id => id !== user._id) : [...userProfile.followers, user._id]
        }
        dispatch(setUserProfile(updatedUserProfile));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  }

  let displayedPost = [];
  if (activeTab === 'posts') {
    displayedPost = userProfile?.posts?.filter(p => !p.isReel) || [];
  } else if (activeTab === 'saved') {
    displayedPost = userProfile?.bookmarks || [];
  } else if (activeTab === 'reels') {
    displayedPost = userProfile?.posts?.filter(p => p.isReel) || [];
  } else if (activeTab === 'tags') {
    displayedPost = taggedPosts || [];
  }

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
        // Update userProfile posts
        const updatedProfile = {
          ...userProfile,
          posts: userProfile.posts.filter(p => p._id !== post._id)
        };
        dispatch(setUserProfile(updatedProfile));
        // Update global posts
        const updatedPosts = posts.filter(p => p._id !== post._id);
        dispatch(setPosts(updatedPosts));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || 'Failed to delete post');
    }
  };

  const tabs = [
    { id: 'posts', label: 'POSTS', icon: <Grid3X3 size={14} /> },
    { id: 'saved', label: 'SAVED', icon: <Bookmark size={14} /> },
    { id: 'reels', label: 'REELS', icon: <Film size={14} /> },
    { id: 'tags', label: 'TAGS', icon: <Tag size={14} /> },
  ];

  return (
    <div className='max-w-4xl mx-auto px-4 md:px-8 py-8 pb-20 md:pb-8'>
      {/* Profile header */}
      <div className='flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-16 mb-10'>
        <div className='flex-shrink-0'>
          <Avatar className='h-32 w-32 md:h-36 md:w-36 ring-4 ring-offset-4 ring-indigo-100'>
            <AvatarImage src={userProfile?.profilePicture} alt="profilephoto" />
            <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white text-3xl">{userProfile?.username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>

        <div className='flex flex-col items-center md:items-start gap-4 flex-1'>
          {/* Username & actions */}
          <div className='flex flex-col sm:flex-row items-center gap-3'>
            <h1 className='text-xl font-semibold'>{userProfile?.username}</h1>
            {isLoggedInUserProfile ? (
              <div className="flex gap-2">
                <Link to="/account/edit"><Button className='bg-gray-100 text-gray-700 hover:bg-gray-200 h-8 rounded-lg text-xs font-semibold px-4 shadow-none'>Edit profile</Button></Link>
                <Button className='bg-gray-100 text-gray-700 hover:bg-gray-200 h-8 rounded-lg text-xs font-semibold px-4 shadow-none'>View archive</Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button 
                  onClick={followHandler} 
                  className={`h-8 font-semibold rounded-lg text-xs px-6 transition-all duration-300 shadow-sm ${
                    isFollowing 
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
                {isFollowing && <Button className='bg-gray-100 text-gray-700 hover:bg-gray-200 h-8 rounded-lg text-xs font-semibold shadow-none'>Message</Button>}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className='flex items-center gap-8'>
            <div className='text-center md:text-left'>
              <span className='font-bold text-lg'>{userProfile?.posts?.length || 0}</span>
              <span className='text-gray-500 text-sm ml-1'>posts</span>
            </div>
            <div className='text-center md:text-left'>
              <span className='font-bold text-lg'>{userProfile?.followers?.length || 0}</span>
              <span className='text-gray-500 text-sm ml-1'>followers</span>
            </div>
            <div className='text-center md:text-left'>
              <span className='font-bold text-lg'>{userProfile?.following?.length || 0}</span>
              <span className='text-gray-500 text-sm ml-1'>following</span>
            </div>
          </div>

          {/* Bio */}
          <div className='text-center md:text-left'>
            <p className='text-sm text-gray-700'>{userProfile?.bio || 'No bio yet.'}</p>
            <Badge className='mt-2 bg-indigo-50 text-indigo-600 border-0 font-medium' variant='secondary'>
              <AtSign size={12} /> <span className='pl-1'>{userProfile?.username}</span>
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className='border-t border-gray-200'>
        <div className='flex items-center justify-center gap-12'>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`flex items-center gap-1.5 py-3 text-xs font-semibold tracking-wider uppercase transition-all duration-200 border-t-2 -mt-[1px]
                ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className='grid grid-cols-2 sm:grid-cols-3 gap-1 mt-1'>
          {displayedPost?.map((post) => (
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
                <video 
                  src={post.video} 
                  className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none' 
                  muted 
                />
              ) : (
                <img 
                  src={post.image} 
                  alt='postimage' 
                  className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none' 
                />
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

        {(!displayedPost || displayedPost.length === 0) && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full border-2 border-gray-200 flex items-center justify-center mb-3">
              {activeTab === 'tags' ? <Tag className="w-8 h-8 text-gray-300" /> : <Grid3X3 className="w-8 h-8 text-gray-300" />}
            </div>
            <p className="text-gray-400 font-medium">
              {activeTab === 'tags' ? 'No tagged posts yet' : 'No posts yet'}
            </p>
          </div>
        )}
      </div>

      <CommentDialog open={openPost} setOpen={setOpenPost} />
      {postToEdit && <EditPostDialog open={editOpen} setOpen={setEditOpen} post={postToEdit} />}
    </div>
  )
}

export default Profile