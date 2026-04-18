import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

const Comment = ({ comment }) => {
    return (
        <div className='py-2.5'>
            <div className='flex gap-3 items-start'>
                <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={comment?.author?.profilePicture} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white text-xs">{comment?.author?.username?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <p className='text-sm leading-relaxed'>
                    <span className='font-semibold mr-1.5'>{comment?.author?.username}</span>
                    <span className='text-gray-600'>{comment?.text}</span>
                </p>
            </div>
        </div>
    )
}

export default Comment