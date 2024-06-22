'use client';
import React, { useEffect, useState } from 'react';
import { ThemeProvider, useTheme } from '../theme.js'; 

const ProfileDetails = ({ profile }) => {
  const { theme, changeTheme } = useTheme();

  const cardStyles = {
    'gold&black': {
      backgroundColor: 'gold',
      color: 'black',
      border: '1px solid black',
      padding: '20px',
      margin: '10px',
      fontSize: '16px',
      borderRadius: '8px',
    },
    'white&black': {
      backgroundColor: 'white',
      color: 'black',
      border: '1px solid black',
      padding: '20px',
      margin: '10px',
      fontSize: '16px',
      borderRadius: '8px',
    },
    'violet&green': {
      backgroundColor: 'violet',
      color: 'green',
      border: '1px solid green',
      padding: '20px',
      margin: '10px',
      fontSize: '16px',
      borderRadius: '8px',
    },
    'orange&black': {
      backgroundColor: 'orange',
      color: 'black',
      border: '1px solid black',
      padding: '20px',
      margin: '10px',
      fontSize: '16px',
      borderRadius: '8px',
    },
    'aero&black': {
      backgroundColor: 'aero',
      color: 'black',
      border: '1px solid black',
      padding: '20px',
      margin: '10px',
      fontSize: '16px',
      borderRadius: '8px',
    },
    'white&blue': {
      backgroundColor: 'white',
      color: 'blue',
      border: '1px solid blue',
      padding: '20px',
      margin: '10px',
      fontSize: '16px',
      borderRadius: '8px',
    },
    'blue&black': {
      backgroundColor: 'blue',
      color: 'black',
      border: '1px solid black',
      padding: '20px',
      margin: '10px',
      fontSize: '16px',
      borderRadius: '8px',
    },
    'restaturants': {
      backgroundColor: 'brown',
      color: 'white',
      border: '1px solid white',
      padding: '20px',
      margin: '10px',
      fontSize: '16px',
      borderRadius: '8px',
    },
  };

  const themeStyle = cardStyles[profile.card.theme] || cardStyles['orange&black'];

  return (
    <div style={themeStyle}>
     <h1>{profile.profile.name}</h1>
      <p>{profile.profile.designation}</p>
      <p>{profile.profile.companyName}</p>
      <p>{profile.profile.bio}</p>
      {/* Render other profile fields as needed */}
      <select value={theme} onChange={(e) => changeTheme(e.target.value)}>
        {Object.keys(cardStyles).map((key) => (
          <option key={key} value={key}>{key}</option>
        ))}
      </select>
      {/* Render other profile fields as needed */}
    </div>
  );
};

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
    <ThemeProvider initialTheme={profile.card.theme}>
      <ProfileDetails profile={profile} />
    </ThemeProvider>
  );
};

export default ProfilePage;
