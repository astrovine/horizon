import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, X } from 'lucide-react';
import { postAPI } from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await postAPI.createPost({ title, content, published: true });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        className="w-full max-w-3xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="glass rounded-3xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              Create a Post
            </h2>
            <button
              className="p-2 rounded-xl hover:bg-white/10 text-secondary hover:text-primary transition-all"
              onClick={() => navigate('/')}
            >
              <X size={24} />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-danger/10 border border-danger rounded-xl text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Title"
              type="text"
              placeholder="Give your post a catchy title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-primary ml-1">Content</label>
              <textarea
                className="w-full px-4 py-3 glass rounded-xl text-primary placeholder:text-tertiary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                placeholder="Share your thoughts..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                required
              />
              <div className="text-sm text-tertiary text-right">
                {content.length} characters
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                icon={<Send size={20} />}
              >
                Publish Post
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CreatePost;
