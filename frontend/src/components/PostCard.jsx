import React, { useState } from 'react';
import { Heart, MessageCircle, Trash2, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const PostCard = ({ post, onDelete }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.votes || 0);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const postData = post.Post || post;
  const postOwner = postData.owner;
  const isOwner = user?.id === postData.user_id;

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      await api.post('/vote/', {
        post_id: postData.id,
        dir: isLiked ? 0 : 1
      });
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this post?')) return;

    setIsDeleting(true);
    try {
      await api.delete(`/posts/${postData.id}`);
      if (onDelete) onDelete(postData.id);
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return `${seconds}s`;
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const displayName = postOwner?.name || postOwner?.user_name || 'User';
  const userName = postOwner?.user_name || 'user';
  const userInitial = displayName[0]?.toUpperCase();

  return (
    <div
      onClick={() => navigate(`/post/${postData.id}`)}
      className="border-b border-border px-4 py-3 hover:bg-accent cursor-pointer transition-colors"
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div
          className={`w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 cursor-pointer hover:opacity-80`}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/profile/${postData.user_id}`);
          }}
        >
          <span className="text-sm font-semibold">
            {userInitial}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <div
              className="flex items-center gap-1 cursor-pointer hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/profile/${postData.user_id}`);
              }}
            >
              <span className="font-bold text-[15px] text-foreground">
                {displayName}
              </span>
              <span className="text-[15px] text-muted-foreground">
                @{userName}
              </span>
              <span className="text-[15px] text-muted-foreground">·</span>
              <span className="text-[15px] text-muted-foreground">{formatDate(postData.created_at)}</span>
            </div>

            {isOwner && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="p-1 hover:bg-accent rounded-full transition-colors"
                >
                  <MoreHorizontal size={18} className="text-muted-foreground" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-1 w-48 bg-card border border-border rounded-xl shadow-xl z-10">
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-400 hover:bg-accent transition-colors rounded-xl"
                    >
                      <Trash2 size={18} />
                      <span className="font-semibold">{isDeleting ? 'Deleting...' : 'Delete'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="mb-3">
            <h3 className="font-semibold text-[17px] text-foreground mb-1">{postData.title}</h3>
            <p className="text-[15px] text-foreground/90 leading-5 whitespace-pre-wrap">{postData.content || postData.body}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 max-w-md">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 group ${
                isLiked ? 'text-pink-500' : 'text-muted-foreground'
              }`}
            >
              <div className="p-2 rounded-full group-hover:bg-pink-500/10 transition-colors">
                <Heart size={18} className={isLiked ? 'fill-current' : ''} />
              </div>
              <span className="text-[13px]">{likesCount}</span>
            </button>

            <button className="flex items-center gap-1 text-muted-foreground group">
              <div className="p-2 rounded-full group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <MessageCircle size={18} />
              </div>
              <span className="text-[13px]">{post.comments_count || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
