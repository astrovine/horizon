import React, { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import CreatePostForm from '../components/CreatePostForm';
import api from '../services/api';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LIMIT = 20;

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { user } = useAuth();

  const loadPosts = async (initial = false) => {
    try {
      const response = await api.get('/posts/', {
        params: {
          Limit: LIMIT,
          Skip: initial ? 0 : posts.length,
        }
      });
      const data = response.data || [];
      if (initial) {
        setPosts(data);
        setSkip(data.length);
      } else {
        setPosts(prev => [...prev, ...data]);
        setSkip(prev => prev + data.length);
      }
      setHasMore(data.length === LIMIT);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadPosts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePostCreated = (newPost) => {
    const formattedPost = {
      Post: {
        ...newPost,
        owner: newPost.owner || {
          id: user?.id,
          name: user?.name || user?.user_name || 'User',
          user_name: user?.user_name || 'user',
          email: user?.email || ''
        }
      },
      votes: 0,
      comments_count: 0
    };
    setPosts([formattedPost, ...posts]);
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(p => {
      const post = p.Post || p;
      return post.id !== postId;
    }));
  };

  const handleLoadMore = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    await loadPosts(false);
  };

  return (
    <div className="flex-1 lg:ml-72 min-h-screen border-r border-border bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/70 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 h-[53px]">
          <h1 className="text-xl font-bold text-foreground">Home</h1>
          <button className="p-2 hover:bg-accent rounded-full transition-colors">
            <Sparkles size={20} className="text-foreground" />
          </button>
        </div>
      </div>

      {/* Create Post */}
      <CreatePostForm onPostCreated={handlePostCreated} />

      {/* Posts */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 px-4">
          <p className="text-muted-foreground text-[15px]">No posts yet. Be the first to post!</p>
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
          <div className="py-4 flex justify-center">
            {hasMore && (
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-4 py-2 rounded-full bg-card/60 backdrop-blur-md border border-border text-foreground hover:bg-accent disabled:opacity-50"
              >
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
