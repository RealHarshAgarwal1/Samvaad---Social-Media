import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom';
import SuggestedUsers from './SuggestedUsers';

const RightSidebar = () => {
  const { user } = useSelector(store => store.auth);
  return (
    <div className='w-80 my-8 pr-8 hidden lg:block'>
      <div className='flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors'>
        <Link to={`/profile/${user?._id}`}>
          <Avatar className="ring-2 ring-offset-1 ring-gray-100">
            <AvatarImage src={user?.profilePicture} alt="profile" />
            <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white">{user?.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <h1 className='font-semibold text-sm'><Link to={`/profile/${user?._id}`} className="hover:text-indigo-600 transition-colors">{user?.username}</Link></h1>
          <span className='text-gray-400 text-xs'>{user?.bio || 'Bio here...'}</span>
        </div>
      </div>
      <SuggestedUsers/>
    </div>
  )
}

export default RightSidebar