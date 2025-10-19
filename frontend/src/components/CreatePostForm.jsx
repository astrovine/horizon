import React, { useState } from 'react';
import { Image } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const CreatePostForm = ({ onPostCreated }) => {
  const { user } = useAuth();
  const { push } = useToast();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await api.post('/posts/', {
        title: title.trim(),
        content: body.trim(),
        published: true,
      });
      setTitle('');
      setBody('');
      onPostCreated && onPostCreated(response.data);
      push({ title: 'Posted', description: 'Your post is live.', variant: 'success' });
    } catch (error) {
      const detail = error.response?.data?.detail || error.message;
      push({ title: 'Post failed', description: String(detail), variant: 'error' });
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border-b border-border px-4 py-3">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-semibold">
            {user?.name?.[0]?.toUpperCase() || user?.user_name?.[0]?.toUpperCase() || 'U'}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex-1">
          <div className="bg-card/60 backdrop-blur-md border border-border rounded-2xl p-4">
            <input
              type="text"
              placeholder="Post title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-[20px] font-semibold text-foreground placeholder-muted-foreground focus:outline-none mb-3"
              maxLength={100}
            />

            <textarea
              placeholder="What's happening?"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full bg-transparent text-[17px] text-foreground placeholder-muted-foreground focus:outline-none resize-none min-h-[80px]"
              maxLength={500}
              rows={4}
            />

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-border">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="p-2 hover:bg-accent rounded-full transition-colors text-muted-foreground"
                >
                  <Image size={20} />
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !body.trim()}
                className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full font-bold text-[15px] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostForm;
