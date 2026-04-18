import React, { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import axios from 'axios';
import { Loader2, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { setAuthUser } from '@/redux/authSlice';

const EditProfile = () => {
    const imageRef = useRef();
    const { user } = useSelector(store => store.auth);
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState({
        profilePhoto: user?.profilePicture,
        bio: user?.bio,
        gender: user?.gender
    });
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const fileChangeHandler = (e) => {
        const file = e.target.files?.[0];
        if (file) setInput({ ...input, profilePhoto: file });
    }

    const selectChangeHandler = (value) => {
        setInput({ ...input, gender: value });
    }

    const editProfileHandler = async () => {
        const formData = new FormData();
        if (input.bio) formData.append("bio", input.bio);
        if (input.gender) formData.append("gender", input.gender);
        if (input.profilePhoto) {
            formData.append("profilePhoto", input.profilePhoto);
        }
        try {
            setLoading(true);
            const res = await axios.post('/api/v1/user/profile/edit', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            if (res.data.success) {
                const updatedUserData = {
                    ...user,
                    bio: res.data.user?.bio,
                    profilePicture: res.data.user?.profilePicture,
                    gender: res.data.user.gender
                };
                dispatch(setAuthUser(updatedUserData));
                navigate(`/profile/${user?._id}`);
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='max-w-xl mx-auto px-4 py-8 pb-20 md:pb-8'>
            <h1 className='font-bold text-xl mb-6'>Edit Profile</h1>

            {/* Avatar section */}
            <div className='flex items-center gap-4 bg-gray-50 rounded-2xl p-5 mb-6'>
                <div className='relative group cursor-pointer' onClick={() => imageRef?.current.click()}>
                    <Avatar className="w-16 h-16 ring-2 ring-offset-2 ring-gray-100">
                        <AvatarImage src={user?.profilePicture} alt="profile" />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white text-xl">{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera size={18} className="text-white" />
                    </div>
                </div>
                <div className='flex-1'>
                    <h2 className='font-semibold text-sm'>{user?.username}</h2>
                    <span className='text-gray-400 text-xs'>{user?.bio || 'Add a bio...'}</span>
                </div>
                <input ref={imageRef} onChange={fileChangeHandler} type='file' className='hidden' accept="image/*" />
                <Button onClick={() => imageRef?.current.click()} className='bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs h-9 px-4'>Change photo</Button>
            </div>

            {/* Bio */}
            <div className='mb-6'>
                <label className='font-semibold text-sm text-gray-700 mb-2 block'>Bio</label>
                <Textarea 
                    value={input.bio} 
                    onChange={(e) => setInput({ ...input, bio: e.target.value })} 
                    name='bio' 
                    className="focus-visible:ring-indigo-200 rounded-xl border-gray-200 min-h-[100px] resize-none" 
                    placeholder="Tell people about yourself..."
                />
            </div>

            {/* Gender */}
            <div className='mb-8'>
                <label className='font-semibold text-sm text-gray-700 mb-2 block'>Gender</label>
                <Select defaultValue={input.gender} onValueChange={selectChangeHandler}>
                    <SelectTrigger className="w-full rounded-xl border-gray-200 focus:ring-indigo-200">
                        <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectGroup>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            {/* Submit */}
            <div className='flex justify-end'>
                {loading ? (
                    <Button className='bg-indigo-600 hover:bg-indigo-700 rounded-xl px-6'>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Saving...
                    </Button>
                ) : (
                    <Button onClick={editProfileHandler} className='bg-indigo-600 hover:bg-indigo-700 rounded-xl px-8 shadow-sm'>Save changes</Button>
                )}
            </div>
        </div>
    )
}

export default EditProfile