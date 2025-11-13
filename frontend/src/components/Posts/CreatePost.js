import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postAPI } from '../../services/api';
import Markdown from 'markdown-to-jsx';
import './Posts.css';

const CreatePost = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // SEND POST DATA TO BACKEND
      // Create new post with title, content, and tags
      await postAPI.createPost(
        formData.title,
        formData.content,
        formData.tags
      );
      // REDIRECT TO HOME AFTER SUCCESSFUL POST CREATION
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-container">
      <div className="create-post-form">
        <h2>Create New Post</h2>
        <div className="markdown-support-notice">
          ✨ <strong>Markdown is supported!</strong> Use markdown syntax to format your content.
        </div>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Post Title"
            value={formData.title}
            onChange={handleChange}
            required
          />
          
          <div className="content-editor-preview">
            <div className="editor-section">
              <label>Content (Markdown)</label>
              <textarea
                name="content"
                placeholder="What's on your mind? Share your thoughts...&#10;&#10;You can use markdown:&#10;# Heading&#10;**bold** *italic* `code`&#10;- Lists&#10;[links](url)"
                value={formData.content}
                onChange={handleChange}
                rows="12"
                required
              />
            </div>

            <div className="preview-section">
              <label>Preview</label>
              <div className="markdown-preview">
                {formData.content ? (
                  <Markdown>{formData.content}</Markdown>
                ) : (
                  <p className="preview-placeholder">Your markdown preview will appear here...</p>
                )}
              </div>
            </div>
          </div>

          <input
            type="text"
            name="tags"
            placeholder="Tags (comma separated)"
            value={formData.tags}
            onChange={handleChange}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Publishing...' : 'Publish Post'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
