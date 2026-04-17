import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import useGetUserProfile from '@/hooks/useGetUserProfile';
import { Link, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AtSign, Heart, MessageCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { setUserProfile } from '@/redux/authSlice';

const Profile = () => {
  const params = useParams();
  const userId = params.id;
  useGetUserProfile(userId);
  const [activeTab, setActiveTab] = useState('posts');

  const { userProfile, user } = useSelector(store => store.auth);
  const dispatch = useDispatch();

  const [isFollowing, setIsFollowing] = useState(userProfile?.followers?.includes(user?._id));

  const isLoggedInUserProfile = user?._id === userProfile?._id;

  const followHandler = async () => {
    try {
      const res = await axios.post(`/api/v1/user/followorunfollow/${userProfile?._id}`, {}, { withCredentials: true });
      if (res.data.success) {
        setIsFollowing(!isFollowing);
        // update local profile followers 
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

  const displayedPost = activeTab === 'posts' ? userProfile?.posts : userProfile?.bookmarks;

  return (
    <div className='flex max-w-5xl justify-center mx-auto md:pl-10'>
      <div className='flex flex-col gap-10 md:gap-20 p-4 md:p-8'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-0'>
          <section className='flex items-center justify-center'>
            <Avatar className='h-32 w-32'>
              <AvatarImage src={userProfile?.profilePicture} alt="profilephoto" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </section>
          <section>
            <div className='flex flex-col gap-5 items-center md:items-start'>
              <div className='flex flex-col md:flex-row items-center gap-2 flex-wrap justify-center md:justify-start'>
                <span>{userProfile?.username}</span>
                {
                  isLoggedInUserProfile ? (
                    <>
                      <Link to="/account/edit"><Button variant='secondary' className='hover:bg-gray-200 h-8'>Edit profile</Button></Link>
                      <Button variant='secondary' className='hover:bg-gray-200 h-8'>View archive</Button>
                      <Button variant='secondary' className='hover:bg-gray-200 h-8'>Ad tools</Button>
                    </>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        onClick={followHandler} 
                        className={`h-8 font-semibold w-24 transition-colors duration-300 shadow-sm ${
                          isFollowing 
                            ? 'bg-gray-200 hover:bg-gray-300 text-black' 
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        {isFollowing ? 'Unfollow' : 'Follow'}
                      </Button>
                      {isFollowing && <Button variant='secondary' className='h-8'>Message</Button>}
                    </div>
                  )
                }
              </div>
              <div className='flex items-center gap-4 text-sm'>
                <p><span className='font-semibold'>{userProfile?.posts?.length} </span>posts</p>
                <p><span className='font-semibold'>{userProfile?.followers?.length} </span>followers</p>
                <p><span className='font-semibold'>{userProfile?.following?.length} </span>following</p>
              </div>
              <div className='flex flex-col gap-1'>
                <span className='font-semibold'>{userProfile?.bio || 'bio here...'}</span>
                <Badge className='w-fit' variant='secondary'><AtSign /> <span className='pl-1'>{userProfile?.username}</span> </Badge>
              </div>
            </div>
          </section>
        </div>
        <div className='border-t border-t-gray-200'>
          <div className='flex items-center justify-center gap-10 text-sm'>
            <span className={`py-3 cursor-pointer ${activeTab === 'posts' ? 'font-bold' : ''}`} onClick={() => handleTabChange('posts')}>
              POSTS
            </span>
            <span className={`py-3 cursor-pointer ${activeTab === 'saved' ? 'font-bold' : ''}`} onClick={() => handleTabChange('saved')}>
              SAVED
            </span>
            <span className='py-3 cursor-pointer'>REELS</span>
            <span className='py-3 cursor-pointer'>TAGS</span>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1'>
            {
              displayedPost?.map((post) => {
                return (
                  <div key={post?._id} className='relative group cursor-pointer'>
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
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile