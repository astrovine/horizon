import React, { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import api from '../services/api';
import { Search } from 'lucide-react';

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPosts = async () => {
    try {
      const response = await api.get('/posts/', {
        params: {
          Limit: 100,
          Skip: 0,
          Search: searchTerm
        }
      });
      const sortedPosts = response.data.sort((a, b) => (b.votes || 0) - (a.votes || 0));
      setPosts(sortedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchPosts();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(p => {
      const post = p.Post || p;
      return post.id !== postId;
    }));
  };

  return (
    <div className="flex-1 lg:ml-72 min-h-screen border-r border-[#2F3336]">
      {/* Header with Search */}
      <div className="sticky top-0 z-10 bg-black border-b border-[#2F3336]">
        <div className="px-4 py-2">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#71767B]" size={20} />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#202327] text-[#E7E9EA] placeholder-[#71767B] rounded-full pl-12 pr-4 py-3 focus:outline-none focus:bg-[#1D1F23] focus:border focus:border-[#1D9BF0]"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1D9BF0] border-t-transparent"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 px-4">
          <p className="text-[#71767B] text-[15px]">No posts found</p>
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

export default Explore;
