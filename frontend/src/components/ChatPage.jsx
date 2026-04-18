import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { setSelectedUser } from '@/redux/authSlice';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { MessageCircleCode, ArrowLeft, Send } from 'lucide-react';
import Messages from './Messages';
import axios from 'axios';
import { setMessages } from '@/redux/chatSlice';

const ChatPage = () => {
    const [textMessage, setTextMessage] = useState("");
    const { user, suggestedUsers, selectedUser } = useSelector(store => store.auth);
    const { onlineUsers, messages } = useSelector(store => store.chat);
    const dispatch = useDispatch();

    const sendMessageHandler = async (receiverId) => {
        try {
            const res = await axios.post(`/api/v1/message/send/${receiverId}`, { textMessage }, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });
            if (res.data.success) {
                dispatch(setMessages([...messages, res.data.newMessage]));
                setTextMessage("");
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        return () => {
            dispatch(setSelectedUser(null));
        }
    }, []);

    return (
        <div className='flex h-[calc(100vh-4rem)] md:h-screen w-full bg-white rounded-xl md:rounded-none overflow-hidden'>
            {/* Conversations list */}
            <section className={`w-full md:w-80 lg:w-96 border-r border-gray-100 flex flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
                <div className='px-5 py-4 border-b border-gray-100'>
                    <h1 className='font-bold text-xl'>{user?.username}</h1>
                    <p className='text-xs text-gray-400 mt-0.5'>Direct Messages</p>
                </div>
                <div className='overflow-y-auto flex-1'>
                    {suggestedUsers.map((suggestedUser) => {
                        const isOnline = onlineUsers.includes(suggestedUser?._id);
                        const isSelected = selectedUser?._id === suggestedUser?._id;
                        return (
                            <div onClick={() => dispatch(setSelectedUser(suggestedUser))} key={suggestedUser._id}
                                className={`flex gap-3 items-center px-5 py-3.5 cursor-pointer transition-all duration-200
                                ${isSelected ? 'bg-indigo-50 border-r-2 border-indigo-500' : 'hover:bg-gray-50'}`}>
                                <div className='relative'>
                                    <Avatar className='w-12 h-12'>
                                        <AvatarImage src={suggestedUser?.profilePicture} />
                                        <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white">{suggestedUser?.username?.[0]?.toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    {isOnline && (
                                        <div className='absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white'>
                                        </div>
                                    )}
                                </div>
                                <div className='flex flex-col flex-1 min-w-0'>
                                    <span className='font-semibold text-sm'>{suggestedUser?.username}</span>
                                    <span className={`text-xs ${isOnline ? 'text-green-500' : 'text-gray-400'}`}>
                                        {isOnline ? 'Active now' : 'Offline'}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* Chat area */}
            {selectedUser ? (
                <section className='flex-1 flex flex-col h-full bg-gray-50/50'>
                    {/* Chat header */}
                    <div className='flex gap-3 items-center px-4 py-3 border-b border-gray-100 bg-white'>
                        <Button onClick={() => dispatch(setSelectedUser(null))} variant="ghost" size="icon" className="md:hidden h-8 w-8 rounded-full">
                            <ArrowLeft size={18} />
                        </Button>
                        <Avatar className="w-9 h-9">
                            <AvatarImage src={selectedUser?.profilePicture} alt='profile' />
                            <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white text-sm">{selectedUser?.username?.[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col'>
                            <span className='font-semibold text-sm'>{selectedUser?.username}</span>
                            <span className={`text-[11px] ${onlineUsers.includes(selectedUser?._id) ? 'text-green-500' : 'text-gray-400'}`}>
                                {onlineUsers.includes(selectedUser?._id) ? 'Active now' : 'Offline'}
                            </span>
                        </div>
                    </div>

                    {/* Messages */}
                    <Messages selectedUser={selectedUser} />

                    {/* Input */}
                    <div className='flex items-center gap-2 p-3 border-t border-gray-100 bg-white'>
                        <Input 
                            value={textMessage} 
                            onChange={(e) => setTextMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && textMessage.trim() && sendMessageHandler(selectedUser?._id)}
                            type="text" 
                            className='flex-1 rounded-full border-gray-200 focus-visible:ring-indigo-200 bg-gray-50 px-4' 
                            placeholder="Type a message..." 
                        />
                        <Button 
                            onClick={() => sendMessageHandler(selectedUser?._id)} 
                            disabled={!textMessage.trim()}
                            size="icon"
                            className="rounded-full bg-indigo-600 hover:bg-indigo-700 h-10 w-10 shadow-sm">
                            <Send size={16} />
                        </Button>
                    </div>
                </section>
            ) : (
                <div className='hidden md:flex flex-col items-center justify-center flex-1 bg-gray-50/30'>
                    <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                        <MessageCircleCode className='w-10 h-10 text-indigo-400' />
                    </div>
                    <h1 className='font-semibold text-lg text-gray-700'>Your messages</h1>
                    <span className='text-gray-400 text-sm mt-1'>Send a message to start a conversation</span>
                </div>
            )}
        </div>
    )
}

export default ChatPage