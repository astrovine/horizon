import React, { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import api from '../services/api';
import { Rss, Users } from 'lucide-react';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = async () => {
    try {
      const response = await api.get('/feed', {
        params: { Limit: 50, Skip: 0 }
      });
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(p => {
      const post = p.Post || p;
      return post.id !== postId;
    }));
  };

  return (
    <div className="flex-1 lg:ml-72 min-h-screen border-r border-[#2F3336]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-[#2F3336]">
        <div className="flex items-center px-4 h-[53px]">
          <h1 className="text-xl font-bold text-[#E7E9EA]">Following</h1>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1D9BF0] border-t-transparent"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 px-8">
          <Users size={64} className="mx-auto mb-4 text-[#71767B]" />
          <h2 className="text-[31px] font-bold text-[#E7E9EA] mb-2">Your feed is empty</h2>
          <p className="text-[15px] text-[#71767B] mb-4">Follow people to see their posts here</p>
        </div>
      ) : (
        <div>
          {posts.map((post) => (
            <PostCard
              key={post.Post?.id || post.id}
              post={post}
              onDelete={handlePostDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Feed;
