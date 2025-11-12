import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { postAPI, userAPI } from '../../services/api';
import PostCard from './PostCard';
import './Posts.css';

const PostList = ({ 
  posts: initialPosts = null, 
  loading: initialLoading = false, 
  title = 'Community Posts', 
  username,
  userId = null,
  currentUserId = null,  
  isProfilePage = false  
}) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef(null);
  const navigate = useNavigate();

  const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      let response;
      if (isProfilePage && userId) {
        response = await userAPI.getUserProfile(userId, pageNum, 10);
        const normalizedPosts = (response.data.posts || []).map(p => ({
          ...p,
          likes_count: p.likes_count ?? p.likes?.length ?? 0,
          comments_count: p.comments_count ?? p.comments?.length ?? 0
        }));
        
        if (append) {
          setPosts(prev => [...prev, ...normalizedPosts]);
        } else {
          setPosts(normalizedPosts);
        }
        
        if (response.data.pagination) {
          setHasMore(pageNum < response.data.pagination.totalPages);
        }
      } else {
        const tagsQuery = selectedTags.join(',');
        response = await postAPI.getAllPosts(pageNum, 10, search, tagsQuery);
        const normalizedPosts = (response.data.data || []).map(p => ({
          ...p,
          likes_count: p.likes_count ?? p.likes?.length ?? 0,
          comments_count: p.comments_count ?? p.comments?.length ?? 0
        }));

        if (append) {
          setPosts(prev => [...prev, ...normalizedPosts]);
        } else {
          setPosts(normalizedPosts);
        }

        if (response.data.pagination) {
          setHasMore(pageNum < response.data.pagination.totalPages);
        }
      }

      setError('');
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to fetch posts');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [search, selectedTags, userId, isProfilePage]);

  useEffect(() => {
    if (initialPosts === null) {
      setPage(1);
      fetchPosts(1, false);
    } else {
      const normalized = initialPosts.map(p => ({
        ...p,
        likes_count: p.likes_count ?? p.likes?.length ?? 0,
        comments_count: p.comments_count ?? p.comments?.length ?? 0
      }));
      setPosts(normalized);
    }
  }, [initialPosts, isProfilePage, userId]);

  useEffect(() => {
    if (initialPosts === null && !isProfilePage) {
      setPage(1);
      fetchPosts(1, false);
    }
  }, [search, selectedTags, isProfilePage, initialPosts]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !loading && initialPosts === null) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchPosts(nextPage, true);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, isLoadingMore, loading, page, fetchPosts, initialPosts]);

  const handleAddTag = () => {
    if (tagInput.trim() && !selectedTags.includes(tagInput.trim())) {
      setSelectedTags([...selectedTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleCommentAdded = (postId) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, comments_count: (p.comments_count || 0) + 1 }
          : p
      )
    );
  };

  const handleCommentDeleted = (postId) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, comments_count: Math.max(0, (p.comments_count || 0) - 1) }
          : p
      )
    );
  };

  if (loading && posts.length === 0) {
    return <div className="loading">Loading posts...</div>;
  }

  if (error && posts.length === 0) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="posts-container">
      <h2>{title}</h2>
      
      {initialPosts === null && !isProfilePage && (
        <div className="posts-controls">
          <div className="search-section">
            <input
              type="text"
              placeholder="Search posts by title or content..."
              value={search}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>

          <div className="filter-section">
            <div className="tag-input-group">
              <input
                type="text"
                placeholder="Add tags to filter..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="tag-input"
              />
              <button onClick={handleAddTag} className="add-tag-btn">
                Add Tag
              </button>
            </div>

            {selectedTags.length > 0 && (
              <div className="selected-tags">
                {selectedTags.map(tag => (
                  <span key={tag} className="tag-badge">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="remove-tag"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {posts.length === 0 ? (
        <div className="no-posts">
          {search || selectedTags.length > 0 ? 'No posts match your search or filters' : 'No posts yet'}
        </div>
      ) : (
        <>
          <div className="posts-list">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                username={username}
                currentUserId={currentUserId}
                onLike={() => {
                  setPosts(prev =>
                    prev.map(p =>
                      p.id === post.id
                        ? { ...p, likes_count: p.likes_count + 1 }
                        : p
                    )
                  );
                }}
                onCommentAdded={() => handleCommentAdded(post.id)}
                onCommentDeleted={() => handleCommentDeleted(post.id)}
                onAuthorClick={(id) => id && navigate(`/profile/${id}`)}
              />
            ))}
          </div>

          {hasMore && (
            <div ref={observerTarget} className="infinite-scroll-trigger">
              {isLoadingMore && <div className="loading">Loading more posts...</div>}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PostList;
