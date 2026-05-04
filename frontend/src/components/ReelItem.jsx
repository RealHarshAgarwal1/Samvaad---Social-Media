import React, { useRef, useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, Play } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import axios from 'axios';
import { toast } from 'sonner';
import { useSelector, useDispatch } from 'react-redux';
import { setPosts, setSelectedPost } from '@/redux/postSlice';
import CommentDialog from './CommentDialog';

const ReelItem = ({ reel }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(reel.likes.length);
  const [openComment, setOpenComment] = useState(false);
  
  const videoRef = useRef(null);
  const { user } = useSelector(store => store.auth);
  const { posts } = useSelector(store => store.post);
  const dispatch = useDispatch();

  useEffect(() => {
    if (reel.likes.includes(user?._id)) {
      setIsLiked(true);
    }
  }, [reel, user]);

  // Intersection Observer for autoplay
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (videoRef.current) {
            videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
          }
        } else {
          if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        }
      },
      { threshold: 0.6 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const likeOrDislikeHandler = async () => {
    try {
      const action = isLiked ? 'dislike' : 'like';
      const res = await axios.get(`/api/v1/post/${reel._id}/${action}`, { withCredentials: true });
      if (res.data.success) {
        const updatedLikes = isLiked ? likeCount - 1 : likeCount + 1;
        setLikeCount(updatedLikes);
        setIsLiked(!isLiked);

        // Update global posts state if needed, though this is a separate feed
        const updatedPostData = posts.map(p =>
          p._id === reel._id ? {
            ...p,
            likes: isLiked ? p.likes.filter(id => id !== user._id) : [...p.likes, user._id]
          } : p
        );
        dispatch(setPosts(updatedPostData));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };

  const shareHandler = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/reels`);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="relative w-full h-full bg-black">
      <video
        ref={videoRef}
        src={reel.video}
        className="w-full h-full object-cover cursor-pointer"
        loop
        playsInline
        onClick={handleVideoClick}
      />
      
      {/* Play Icon Overlay (visible when paused) */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/50 p-4 rounded-full">
            <Play className="w-12 h-12 text-white fill-current opacity-80" />
          </div>
        </div>
      )}

      {/* Right Sidebar (Actions) */}
      <div className="absolute right-4 bottom-20 flex flex-col items-center gap-6 z-10">
        <div className="flex flex-col items-center gap-1">
          <button 
            onClick={likeOrDislikeHandler}
            className="bg-black/40 p-3 rounded-full backdrop-blur-sm hover:bg-black/60 transition-colors"
          >
            <Heart size={26} className={isLiked ? 'fill-red-500 text-red-500' : 'text-white'} />
          </button>
          <span className="text-white text-xs font-semibold">{likeCount}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button 
            onClick={() => {
              dispatch(setSelectedPost(reel));
              setOpenComment(true);
            }}
            className="bg-black/40 p-3 rounded-full backdrop-blur-sm hover:bg-black/60 transition-colors"
          >
            <MessageCircle size={26} className="text-white" />
          </button>
          <span className="text-white text-xs font-semibold">{reel.comments.length}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button onClick={shareHandler} className="bg-black/40 p-3 rounded-full backdrop-blur-sm hover:bg-black/60 transition-colors">
            <Send size={26} className="text-white" />
          </button>
        </div>
      </div>

      {/* Bottom Overlay (Info) */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-10">
        <div className="flex items-center gap-3 mb-2">
          <Avatar className="w-10 h-10 border border-white/20">
            <AvatarImage src={reel.author.profilePicture} />
            <AvatarFallback className="bg-gray-800 text-white">{reel.author.username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-white font-semibold">{reel.author.username}</span>
          {user?._id !== reel.author._id && (
             <button className="px-3 py-1 bg-transparent border border-white text-white text-xs font-semibold rounded-lg ml-2 hover:bg-white hover:text-black transition-colors">
               Follow
             </button>
          )}
        </div>
        <p className="text-white text-sm line-clamp-2">{reel.caption}</p>
      </div>

      <CommentDialog open={openComment} setOpen={setOpenComment} post={reel} />
    </div>
  );
};

export default ReelItem;
