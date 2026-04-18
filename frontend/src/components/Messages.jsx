import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import useGetAllMessage from '@/hooks/useGetAllMessage'
import useGetRTM from '@/hooks/useGetRTM'

const Messages = ({ selectedUser }) => {
    useGetRTM();
    useGetAllMessage();
    const {messages} = useSelector(store=>store.chat);
    const {user} = useSelector(store=>store.auth);
    return (    
        <div className='overflow-y-auto flex-1 p-4'>
            <div className='flex justify-center mb-6'>
                <div className='flex flex-col items-center justify-center'>
                    <Avatar className="h-16 w-16 ring-2 ring-offset-2 ring-gray-100">
                        <AvatarImage src={selectedUser?.profilePicture} alt='profile' />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white text-lg">{selectedUser?.username?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className='font-semibold text-sm mt-2'>{selectedUser?.username}</span>
                    <Link to={`/profile/${selectedUser?._id}`}><Button className="h-7 mt-1 text-xs rounded-full px-4 bg-gray-100 text-gray-600 hover:bg-gray-200" variant="secondary">View profile</Button></Link>
                </div>
            </div>
            <div className='flex flex-col gap-2'>
                {
                   messages && messages.map((msg) => {
                        const isSender = String(msg.senderId) === String(user?._id);
                        return (
                            <div key={msg._id} className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                                <div className={`py-2 px-4 rounded-2xl max-w-[75%] break-words text-sm shadow-sm ${
                                    isSender 
                                        ? 'bg-indigo-600 text-white rounded-br-md' 
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-md'
                                }`}>
                                    {msg.message}
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </div>  
    )
}

export default Messages