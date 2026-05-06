import React, { useEffect, useState } from 'react';
import { Compass, MapPin, Heart, MessageCircle } from 'lucide-react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setSelectedPost } from '@/redux/postSlice';
import CommentDialog from './CommentDialog';

const Brahman = () => {
    const dispatch = useDispatch();
    const [travelPosts, setTravelPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openPost, setOpenPost] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);

    useEffect(() => {
        const fetchTravelPosts = async () => {
            try {
                const res = await axios.get('/api/v1/post/travel/all', { withCredentials: true });
                if (res.data.success) {
                    setTravelPosts(res.data.posts);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        fetchTravelPosts();
    }, []);

    const handlePostClick = (post) => {
        dispatch(setSelectedPost(post));
        setOpenPost(true);
    };

    // Group posts by location
    const groupedPosts = travelPosts.reduce((acc, post) => {
        if (!post.location) return acc;
        if (!acc[post.location]) {
            acc[post.location] = [];
        }
        acc[post.location].push(post);
        return acc;
    }, {});

    const locations = Object.keys(groupedPosts);
    const displayedPosts = selectedLocation ? groupedPosts[selectedLocation] : travelPosts;

    return (
        <div className='max-w-5xl mx-auto px-4 py-6 pb-20 md:pb-6'>
            {/* Header */}
            <div className="flex items-center justify-between mb-8 p-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg text-white">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <Compass className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold font-['Orbitron'] tracking-wider">Brahman</h1>
                        <p className="text-indigo-100 text-sm mt-1">Discover beautiful travel destinations</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : travelPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
                    <MapPin className="w-12 h-12 text-gray-200 mb-3" />
                    <p className="text-gray-400 font-medium">No travel posts yet</p>
                    <p className="text-sm text-gray-400 mt-1">Add a location and travel keywords to your post to see it here.</p>
                </div>
            ) : (
                <>
                    {/* Location Cards */}
                    {locations.length > 0 && (
                        <div className="mb-10">
                            <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                                <MapPin size={18} className="text-indigo-600" /> Top Destinations
                            </h2>
                            <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                                <div 
                                    className={`flex-shrink-0 cursor-pointer rounded-xl border p-4 transition-all w-32 flex flex-col items-center justify-center text-center
                                        ${!selectedLocation ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-gray-200 bg-white hover:border-indigo-300'}`}
                                    onClick={() => setSelectedLocation(null)}
                                >
                                    <span className="font-semibold text-sm text-gray-800">All</span>
                                    <span className="text-xs text-gray-500 mt-1">{travelPosts.length} posts</span>
                                </div>
                                {locations.map(loc => {
                                    const locPosts = groupedPosts[loc];
                                    const thumbnail = locPosts[0].image || locPosts[0].video;
                                    const isVideo = locPosts[0].isReel || locPosts[0].video;
                                    const isSelected = selectedLocation === loc;

                                    return (
                                        <div 
                                            key={loc}
                                            className={`flex-shrink-0 cursor-pointer rounded-xl border p-2 transition-all w-40 flex flex-col items-center
                                                ${isSelected ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-gray-200 bg-white hover:border-indigo-300'}`}
                                            onClick={() => setSelectedLocation(loc)}
                                        >
                                            <div className="w-full h-24 rounded-lg overflow-hidden mb-2 bg-gray-100">
                                                {isVideo ? (
                                                    <video src={thumbnail} className="w-full h-full object-cover" />
                                                ) : (
                                                    <img src={thumbnail} className="w-full h-full object-cover" alt="thumbnail" />
                                                )}
                                            </div>
                                            <span className="font-semibold text-sm text-gray-800 line-clamp-1 w-full text-center">{loc}</span>
                                            <span className="text-xs text-gray-500">{locPosts.length} post{locPosts.length > 1 ? 's' : ''}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Posts Grid */}
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">
                            {selectedLocation ? `Posts from ${selectedLocation}` : 'All Travel Posts'}
                        </h2>
                    </div>
                    
                    <div className='grid grid-cols-2 sm:grid-cols-3 gap-1'>
                        {displayedPosts.map((post) => (
                            <div 
                                key={post?._id} 
                                className='relative group cursor-pointer aspect-square overflow-hidden rounded-sm'
                                onClick={() => handlePostClick(post)}
                            >
                                {post?.isReel || post?.video ? (
                                    <video src={post.video} className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none' muted />
                                ) : (
                                    <img src={post.image} alt='postimage' className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none' />
                                )}
                                <div className='absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none'>
                                    <div className='flex items-center text-white gap-6 mb-2'>
                                        <span className='flex items-center gap-1.5 font-semibold text-sm'>
                                            <Heart size={18} fill="white" /> {post?.likes?.length || 0}
                                        </span>
                                        <span className='flex items-center gap-1.5 font-semibold text-sm'>
                                            <MessageCircle size={18} fill="white" /> {post?.comments?.length || 0}
                                        </span>
                                    </div>
                                    {post.location && (
                                        <span className="flex items-center gap-1 text-white text-xs font-medium px-2 py-1 bg-black/40 rounded-full">
                                            <MapPin size={12} /> {post.location}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
            
            <CommentDialog open={openPost} setOpen={setOpenPost} />
        </div>
    );
};

export default Brahman;
