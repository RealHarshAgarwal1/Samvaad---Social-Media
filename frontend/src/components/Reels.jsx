import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import ReelItem from './ReelItem';
import { Loader2 } from 'lucide-react';
import LeftSidebar from './LeftSidebar';

const Reels = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const res = await axios.get('/api/v1/post/reels/all', { withCredentials: true });
        if (res.data.success) {
          setReels(res.data.reels);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchReels();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-indigo-600 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-black text-white">
      {/* Container with snap scrolling */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-scroll snap-y snap-mandatory h-full scrollbar-hide flex flex-col items-center pb-16 md:pb-0"
        style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
      >
        {reels.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full w-full snap-start snap-always">
            <h2 className="text-xl font-semibold mb-2">No Reels Yet</h2>
            <p className="text-gray-400">Be the first to create one!</p>
          </div>
        ) : (
          reels.map((reel) => (
            <div key={reel._id} className="w-full max-w-[450px] h-[calc(100vh-64px)] md:h-[calc(100vh-20px)] my-2 md:my-4 rounded-xl overflow-hidden snap-start snap-always flex-shrink-0 relative">
               <ReelItem reel={reel} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Reels;
