import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import api from '../services/api';
import { ArrowLeft, UserPlus, UserMinus, MapPin, Calendar, Link as LinkIcon, Users as UsersIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      const [profileRes, postsRes] = await Promise.all([
        api.get(`/profile/${userId}`),
        api.get(`/posts/${userId}/posts`, { params: { limit: 50 } })
      ]);
      setProfile(profileRes.data);
      setIsFollowing(profileRes.data.is_following);
      setPosts(postsRes.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId === String(currentUser?.id)) {
      navigate('/profile');
      return;
    }
    fetchProfile();
  }, [userId]);

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await api.delete(`/follow/users/${userId}/follow`);
      } else {
        await api.post(`/follow/users/${profile.user_name}/follow`);
      }
      setIsFollowing(!isFollowing);
      fetchProfile();
    } catch (error) {
      console.error('Error following/unfollowing:', error);
      alert('Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(p => {
      const post = p.Post || p;
      return post.id !== postId;
    }));
  };

  if (loading) {
    return (
      <div className="flex-1 lg:ml-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 lg:ml-64 pb-20 lg:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-gray-800 px-6 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 mb-6">
          {/* Cover gradient */}
          <div className="h-32 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl mb-6"></div>

          {/* Profile info */}
          <div className="-mt-20 px-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 border-4 border-gray-900 flex items-center justify-center mb-4">
              <span className="text-3xl font-bold text-white">
                {profile?.name?.[0]?.toUpperCase() || profile?.user_name?.[0]?.toUpperCase()}
              </span>
            </div>

            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">{profile?.name || profile?.user_name}</h2>
                <p className="text-gray-400">@{profile?.user_name}</p>
              </div>

              <button
                onClick={handleFollow}
                disabled={followLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isFollowing
                    ? 'bg-gray-800 hover:bg-gray-700 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90'
                }`}
              >
                {isFollowing ? <UserMinus size={16} /> : <UserPlus size={16} />}
                {followLoading ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            </div>

            {profile?.bio && (
              <p className="text-gray-300 mb-4">{profile.bio}</p>
            )}

            <div className="space-y-2 mb-4">
              {profile?.location && (
                <div className="flex items-center gap-2 text-gray-400">
                  <MapPin size={16} />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile?.website && (
                <div className="flex items-center gap-2 text-gray-400">
                  <LinkIcon size={16} />
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-500">
                    {profile.website}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar size={16} />
                <span>Joined {new Date(profile?.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 pt-4 border-t border-gray-800">
              <div>
                <span className="font-bold text-white">{profile?.posts_count || 0}</span>
                <span className="text-gray-400 ml-1">Posts</span>
              </div>
              <div>
                <span className="font-bold text-white">{profile?.followers_count || 0}</span>
                <span className="text-gray-400 ml-1">Followers</span>
              </div>
              <div>
                <span className="font-bold text-white">{profile?.following_count || 0}</span>
                <span className="text-gray-400 ml-1">Following</span>
              </div>
            </div>
          </div>
        </div>

        {/* User's Posts */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <UsersIcon size={20} />
            Posts by {profile?.name || profile?.user_name}
          </h3>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12 bg-gray-900/50 rounded-2xl border border-gray-800">
            <p className="text-gray-400">No posts yet</p>
          </div>
        ) : (
          <div className="space-y-4">
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
    </div>
  );
};

export default UserProfile;

