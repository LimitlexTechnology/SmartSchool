import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * DEPRECATED: Consolidated into AdminSettings.jsx
 * This file remains as a fallback redirect.
 */
const UserSettings = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the new unified Admin Panel's preferences tab
    navigate('/dashboard/admin-settings?tab=preferences', { replace: true });
  }, [navigate]);

  return (
    <div className="p-6 flex items-center justify-center h-full">
      <div className="text-muted-text">Redirecting to settings...</div>
    </div>
  );
};

export default UserSettings;
