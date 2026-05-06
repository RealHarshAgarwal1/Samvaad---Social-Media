import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setPosts } from '@/redux/postSlice';
import { setUserProfile } from '@/redux/authSlice';

const EditPostDialog = ({ open, setOpen, post }) => {
    const [caption, setCaption] = useState("");
    const [location, setLocation] = useState("");
    const [loading, setLoading] = useState(false);
    const { posts } = useSelector(store => store.post);
    const { userProfile } = useSelector(store => store.auth);
    const dispatch = useDispatch();

    useEffect(() => {
        if (post) {
            setCaption(post.caption || "");
            setLocation(post.location || "");
        }
    }, [post]);

    const editPostHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.put(`/api/v1/post/edit/${post._id}`, { caption, location }, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });
            if (res.data.success) {
                // Update global posts
                const updatedPosts = posts.map(p => p._id === post._id ? res.data.post : p);
                dispatch(setPosts(updatedPosts));

                // Update user profile posts if applicable
                if (userProfile && userProfile.posts) {
                    const updatedProfilePosts = userProfile.posts.map(p => 
                        p._id === post._id ? { ...p, caption: res.data.post.caption, location: res.data.post.location } : p
                    );
                    dispatch(setUserProfile({ ...userProfile, posts: updatedProfilePosts }));
                }

                toast.success(res.data.message);
                setOpen(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to edit post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="rounded-2xl border-0 shadow-2xl max-w-lg">
                <DialogTitle className='sr-only'>Edit Post</DialogTitle>
                <DialogDescription className='sr-only'>Edit caption and location for your post.</DialogDescription>
                <DialogHeader className='text-center font-semibold text-lg'>Edit Post</DialogHeader>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
                        <Textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            className="focus-visible:ring-indigo-200 border-gray-200 rounded-xl resize-none min-h-[100px]"
                            placeholder="Write a caption..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-indigo-200 focus-within:border-indigo-300 transition-all">
                            <MapPin size={16} className="text-gray-400" />
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Add Location"
                                className="flex-1 text-sm focus:outline-none placeholder-gray-400 bg-transparent"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        {loading ? (
                            <Button disabled className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl h-11">
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Saving...
                            </Button>
                        ) : (
                            <Button onClick={editPostHandler} className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl h-11 font-semibold shadow-sm">
                                Save Changes
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EditPostDialog;
