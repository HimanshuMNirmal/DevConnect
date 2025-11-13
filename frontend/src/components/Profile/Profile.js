import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { userAPI } from '../../services/api';
import PostList from '../Posts/PostList';
import './Profile.css';

const Profile = ({ currentUserId }) => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    skills: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('user'));

  // FETCH USER PROFILE DATA
  // Load user profile information and their posts on component mount
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const numericUserId = parseInt(userId, 10);
      const response = await userAPI.getUserProfile(numericUserId, 1, 10);
      setProfile(response.data);
      setFormData({
        bio: response.data.bio || '',
        skills: response.data.skills || '',
      });
    } catch (err) {
      setError('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const numericUserId = parseInt(userId, 10);
      // UPDATE USER PROFILE IN BACKEND
      // Send updated bio and skills to backend
      await userAPI.updateUserProfile(numericUserId, formData.bio, formData.skills);
      setIsEditing(false);
      // REFRESH PROFILE DATA AFTER UPDATE
      fetchProfile();
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  if (loading) return <div className="loading">Loading profile...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!profile) return <div className="error">Profile not found</div>;

  const numericUserId = parseInt(userId, 10);
  // CHECK IF VIEWING OWN PROFILE
  // Enable edit functionality only for the profile owner
  const isOwnProfile = currentUser?.id === numericUserId;

  return (
    <div className="profile-wrapper">
      <div className="profile-container">
        <div className="profile-header">
          {profile.profile_pic && (
            <img src={profile.profile_pic} alt={profile.username} className="profile-pic" />
          )}
          <div className="profile-info">
            <h2>{profile.username}</h2>
            <p className="profile-email">{profile.email}</p>
            <p className="profile-date">
              Member since {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {isEditing && isOwnProfile ? (
          <form onSubmit={handleUpdate} className="profile-form">
            <textarea
              name="bio"
              placeholder="Add your bio..."
              value={formData.bio}
              onChange={handleChange}
              rows="4"
            />
            <input
              type="text"
              name="skills"
              placeholder="Add your skills (comma separated)"
              value={formData.skills}
              onChange={handleChange}
            />
            <div className="form-buttons">
              <button type="submit" className="save-btn">
                Save Changes
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-details">
            {profile.bio && (
              <div className="detail-section">
                <h3>Bio</h3>
                <p>{profile.bio}</p>
              </div>
            )}
            {profile.skills && (
              <div className="detail-section">
                <h3>Skills</h3>
                <div className="skills-list">
                  {profile.skills.split(',').map((skill, idx) => (
                    <span key={idx} className="skill-tag">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {isOwnProfile && (
              <button className="edit-btn" onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            )}
          </div>
        )}
      </div>

      <div className="profile-posts-section">
        <PostList
          userId={numericUserId}
          isProfilePage={true}
          loading={false}
          title={`${profile.username}'s Posts`}
          username={profile.username}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
};

export default Profile;
