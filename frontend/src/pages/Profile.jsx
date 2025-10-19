import React, { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import api from '../services/api';
import { ArrowLeft, Calendar, MapPin, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');

  const fetchProfile = async () => {
    try {
      const [profileRes, postsRes] = await Promise.all([
        api.get('/profile/me'),
        api.get(`/posts/${user.id}/posts`, { params: { limit: 50 } })
      ]);
      setProfile(profileRes.data);
      setPosts(postsRes.data);
      setBio(profileRes.data.bio || '');
      setLocation(profileRes.data.location || '');
      setWebsite(profileRes.data.website || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      await api.put('/profile/me', {
        bio: bio.trim() || null,
        location: location.trim() || null,
        website: website.trim() || null,
      });
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(p => {
      const post = p.Post || p;
      return post.id !== postId;
    }));
  };

  // Generate unique color for user
  const getUserColor = (userId) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-green-500 to-green-600',
      'from-yellow-500 to-yellow-600',
      'from-red-500 to-red-600',
      'from-indigo-500 to-indigo-600',
      'from-teal-500 to-teal-600',
    ];
    return colors[(userId || 0) % colors.length];
  };

  if (loading) {
    return (
      <div className="flex-1 lg:ml-72 min-h-screen border-r border-[#2F3336] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1D9BF0] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 lg:ml-72 min-h-screen border-r border-[#2F3336]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-[#2F3336]">
        <div className="flex items-center gap-8 px-4 h-[53px]">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-[#181818] rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-[#E7E9EA]" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#E7E9EA]">{profile?.name || profile?.user_name}</h1>
            <p className="text-[13px] text-[#71767B]">{profile?.posts_count || 0} posts</p>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      <div className="h-[200px] bg-[#333639]"></div>

      {/* Profile Info */}
      <div className="px-4">
        <div className="flex justify-between items-start mb-4">
          <div className={`w-[134px] h-[134px] -mt-[67px] rounded-full border-4 border-black bg-gradient-to-br ${getUserColor(user?.id)} flex items-center justify-center`}>
            <span className="text-5xl font-bold text-white">
              {profile?.name?.[0]?.toUpperCase() || profile?.user_name?.[0]?.toUpperCase()}
            </span>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="mt-3 px-4 py-1.5 border border-[#536471] rounded-full font-bold text-[15px] hover:bg-[#181818] transition-colors"
          >
            Edit profile
          </button>
        </div>

        {isEditing ? (
          <div className="mb-6 p-4 border border-[#2F3336] rounded-xl">
            <textarea
              placeholder="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-transparent border border-[#2F3336] rounded px-3 py-2 text-[#E7E9EA] placeholder-[#71767B] focus:outline-none focus:border-[#1D9BF0] mb-3"
              rows={3}
            />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-transparent border border-[#2F3336] rounded px-3 py-2 text-[#E7E9EA] placeholder-[#71767B] focus:outline-none focus:border-[#1D9BF0] mb-3"
            />
            <input
              type="text"
              placeholder="Website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full bg-transparent border border-[#2F3336] rounded px-3 py-2 text-[#E7E9EA] placeholder-[#71767B] focus:outline-none focus:border-[#1D9BF0] mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={handleUpdateProfile}
                className="bg-[#1D9BF0] text-white px-4 py-1.5 rounded-full font-bold hover:bg-[#1A8CD8]"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-1.5 border border-[#536471] rounded-full font-bold hover:bg-[#181818]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-[#E7E9EA]">{profile?.name || profile?.user_name}</h2>
              <p className="text-[15px] text-[#71767B]">@{profile?.user_name}</p>
            </div>

            {profile?.bio && (
              <p className="text-[15px] text-[#E7E9EA] mb-3">{profile.bio}</p>
            )}

            <div className="flex flex-wrap gap-3 text-[15px] text-[#71767B] mb-3">
              {profile?.location && (
                <div className="flex items-center gap-1">
                  <MapPin size={18} />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile?.website && (
                <div className="flex items-center gap-1">
                  <LinkIcon size={18} />
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-[#1D9BF0] hover:underline">
                    {profile.website}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar size={18} />
                <span>Joined {new Date(profile?.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>

            <div className="flex gap-5 text-[15px] mb-4">
              <div>
                <span className="font-bold text-[#E7E9EA]">{profile?.following_count || 0}</span>
                <span className="text-[#71767B] ml-1">Following</span>
              </div>
              <div>
                <span className="font-bold text-[#E7E9EA]">{profile?.followers_count || 0}</span>
                <span className="text-[#71767B] ml-1">Followers</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-[#2F3336]">
        <div className="flex">
          <div className="flex-1 text-center py-4 font-bold text-[15px] border-b-4 border-[#1D9BF0]">
            Posts
          </div>
        </div>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-12 px-4">
          <p className="text-[#71767B] text-[15px]">No posts yet</p>
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

export default Profile;
