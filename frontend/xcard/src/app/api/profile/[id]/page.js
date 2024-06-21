'use client';
import React, { useEffect, useState } from 'react';

const ProfilePage = ({ params }) => {
  const { id } = params;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/profile/view/${id}`);
        const data = await response.json();
        if (data.success) {
          setProfile(data.data);
        } else {
          console.error('Profile not found');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProfile();
    }
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <div>
      <h1>{profile.profile.name}</h1>
      <p>{profile.profile.designation}</p>
      <p>{profile.profile.companyName}</p>
      <p>{profile.profile.bio}</p>
      {/* Render other profile fields as needed */}
    </div>
  );
};

export default ProfilePage;
