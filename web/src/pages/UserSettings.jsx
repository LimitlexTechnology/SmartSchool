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
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-teal mx-auto"></div>
        <p className="text-sm text-muted-text font-bold">Redirecting to new Settings Panel...</p>
      </div>
    </div>
  );
};

export default UserSettings;
