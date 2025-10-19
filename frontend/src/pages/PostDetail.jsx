import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Send, Trash2, CornerDownRight, ThumbsUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { push } = useToast();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [commentLikes, setCommentLikes] = useState({});
  const [likedComments, setLikedComments] = useState(new Set());
  const [replyForId, setReplyForId] = useState(null);
  const [replyText, setReplyText] = useState('');

  const fetchPostDetails = async () => {
    try {
      const [postsResponse, commentsResponse, likesMapResponse] = await Promise.all([
        api.get(`/posts/`, { params: { Limit: 100 } }),
        api.get(`/posts/${postId}/comments`),
        api.get(`/posts/${postId}/comments/likes`)
      ]);

      const foundPost = postsResponse.data.find(p => {
        const postData = p.Post || p;
        return postData.id === parseInt(postId);
      });

      if (foundPost) {
        setPost(foundPost);
        setLikesCount(foundPost.votes || 0);
      }
      setComments(commentsResponse.data);
      setCommentLikes(likesMapResponse.data || {});
    } catch (error) {
      console.error('Error fetching post details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostDetails();
  }, [postId]);

  const handleLike = async () => {
    try {
      await api.post('/vote/', {
        post_id: parseInt(postId),
        dir: isLiked ? 0 : 1
      });
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await api.post(`/posts/${postId}/comment`, {
        comment: newComment.trim()
      });
      setComments([...comments, response.data]);
      setNewComment('');
      push({ title: 'Reply posted', variant: 'success' });
    } catch (error) {
      console.error('Error adding comment:', error);
      push({ title: 'Failed to add reply', description: String(error.response?.data?.detail || error.message), variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Build threaded comments tree
  const buildCommentTree = (flat) => {
    const byId = {};
    flat.forEach(c => byId[c.id] = { ...c, children: [] });
    const roots = [];
    flat.forEach(c => {
      if (c.parent_id) {
        const parent = byId[c.parent_id];
        if (parent) parent.children.push(byId[c.id]);
        else roots.push(byId[c.id]); // orphan safeguard
      } else {
        roots.push(byId[c.id]);
      }
    });
    return roots;
  };

  const handleLikeComment = async (commentId) => {
    try {
      const isLiked = likedComments.has(commentId);
      await api.post(`/posts/comments/${commentId}/like`, null, { params: { dir: isLiked ? 0 : 1 } });
      setLikedComments(prev => {
        const next = new Set(prev);
        if (isLiked) next.delete(commentId); else next.add(commentId);
        return next;
      });
      setCommentLikes(prev => ({
        ...prev,
        [commentId]: (prev[commentId] || 0) + (likedComments.has(commentId) ? -1 : 1)
      }));
    } catch (e) {
      console.error('Failed to like comment', e);
      push({ title: 'Failed to like', variant: 'error' });
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyForId || !replyText.trim()) return;
    try {
      const res = await api.post(`/posts/${replyForId}/reply`, { comment: replyText.trim() });
      setComments([...comments, res.data]);
      setReplyForId(null);
      setReplyText('');
      push({ title: 'Reply posted', variant: 'success' });
    } catch (e) {
      console.error('Failed to reply', e);
      push({ title: 'Failed to post reply', description: String(e.response?.data?.detail || e.message), variant: 'error' });
    }
  };

  const renderComment = (comment, depth = 0) => (
    <div key={comment.id} className="px-4 py-3">
      <div className="flex gap-3">
        <div
          className={`w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0`}
          onClick={() => navigate(`/profile/${comment.user_id}`)}
        >
          <span className="text-xs font-semibold">
            {(comment.owner?.name || comment.owner?.user_name || 'U')[0]?.toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground text-[14px]">
              {comment.owner?.name || comment.owner?.user_name || 'User'}
            </span>
            <span className="text-muted-foreground text-[14px]">
              @{comment.owner?.user_name || 'user'}
            </span>
          </div>
          <p className="text-[15px] text-foreground mt-1">{comment.comment}</p>
          <div className="flex items-center gap-4 mt-2 text-muted-foreground">
            <button
              type="button"
              onClick={() => handleLikeComment(comment.id)}
              className={`flex items-center gap-1 hover:text-primary`}
            >
              <ThumbsUp size={16} />
              <span className="text-xs">{commentLikes[comment.id] || 0}</span>
            </button>
            <button
              type="button"
              onClick={() => setReplyForId(replyForId === comment.id ? null : comment.id)}
              className="flex items-center gap-1 hover:text-primary"
            >
              <CornerDownRight size={16} />
              <span className="text-xs">Reply</span>
            </button>
          </div>
          {replyForId === comment.id && (
            <form onSubmit={handleReplySubmit} className="mt-2">
              <div className="flex gap-2">
                <input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 bg-input border border-border rounded-md px-3 py-2 text-foreground placeholder-muted-foreground"
                  placeholder="Write a reply"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm"
                >
                  Reply
                </button>
              </div>
            </form>
          )}
          {comment.children?.length > 0 && (
            <div className="mt-2 border-l border-border pl-4">
              {comment.children.map(child => renderComment(child, depth + 1))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex-1 lg:ml-72 min-h-screen border-r border-border flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex-1 lg:ml-72 min-h-screen border-r border-border flex items-center justify-center">
        <p className="text-muted-foreground">Post not found</p>
      </div>
    );
  }

  const postData = post.Post || post;
  const postOwner = postData.owner;

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

  return (
    <div className="flex-1 lg:ml-72 min-h-screen border-r border-border bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/70 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-8 px-4 h-[53px]">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-accent rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Post</h1>
        </div>
      </div>

      {/* Post */}
      <div className="border-b border-border px-4 py-3">
        <div className="flex gap-3 mb-3">
          <div
            className={`w-10 h-10 rounded-full bg-gradient-to-br ${getUserColor(postData.user_id)} flex items-center justify-center cursor-pointer`}
            onClick={() => navigate(`/profile/${postData.user_id}`)}
          >
            <span className="text-sm font-semibold text-white">
              {(postOwner?.name || postOwner?.user_name || 'U')[0]?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <span className="font-bold text-[15px] text-foreground">
                {postOwner?.name || postOwner?.user_name || 'User'}
              </span>
              <span className="text-[15px] text-muted-foreground">
                @{postOwner?.user_name || 'user'}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <h1 className="text-[23px] font-bold text-foreground mb-2">{postData.title}</h1>
          <p className="text-[17px] text-foreground leading-6 whitespace-pre-wrap">{postData.content || postData.body}</p>
        </div>

        <div className="text-[15px] text-muted-foreground mb-4 pb-4 border-b border-border">
          {formatDate(postData.created_at)}
        </div>

        <div className="flex items-center gap-6 py-4 border-b border-border">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 ${isLiked ? 'text-pink-500' : 'text-muted-foreground'} hover:text-pink-500`}
          >
            <Heart size={20} className={isLiked ? 'fill-current' : ''} />
            <span className="font-bold text-[15px]">{likesCount}</span>
          </button>

          <div className="flex items-center gap-2 text-muted-foreground">
            <MessageCircle size={20} />
            <span className="font-bold text-[15px]">{comments.length}</span>
          </div>
        </div>
      </div>

      {/* Add Comment */}
      <form onSubmit={handleSubmitComment} className="border-b border-border px-4 py-3 bg-card/60 backdrop-blur-md">
        <div className="flex gap-3">
          <div className={`w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0`}>
            <span className="text-sm font-semibold">
              {user?.name?.[0]?.toUpperCase() || user?.user_name?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Post your reply"
              className="w-full bg-input text-[17px] text-foreground placeholder-muted-foreground focus:outline-none resize-none min-h-[60px] border border-border rounded-md px-3 py-2"
              rows={2}
            />
            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full font-bold text-[15px] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Replying...' : 'Reply'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments */}
      <div className="divide-y divide-border">
        {comments.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-muted-foreground text-[15px]">No replies yet</p>
          </div>
        ) : (
          buildCommentTree(comments).map((comment) => (
            <div key={comment.id} className="bg-card/40 backdrop-blur-md">
              {renderComment(comment)}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PostDetail;
