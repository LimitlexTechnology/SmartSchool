
/**
 * Utility to check granular permissions based on the new role system.
 */

export const getPermissions = () => {
  const role = (localStorage.getItem('userRole') || 'admin').toLowerCase();
  const schoolId = localStorage.getItem('schoolId') || 'local';
  const teacherId = localStorage.getItem('teacherId');
  
  // Grant full access to all admin-level roles
  const fullAccessRoles = ['superadmin', 'admin', 'systemadmin', 'system_admin', 'administrator', 'sch', 'schooladmin'];
  if (fullAccessRoles.includes(role)) return ['*'];
  
  // Load roles from storage
  const storedRoles = localStorage.getItem(`schoolRoles:${schoolId}`);
  if (!storedRoles) return [];

  try {
    const roles = JSON.parse(storedRoles);
    
    // Find roles assigned to this user
    // In this demo, we use teacherId to match staff assignment
    const userRoles = roles.filter(r => 
      r.staffIds && Array.isArray(r.staffIds) && r.staffIds.includes(teacherId)
    );

    // Combine all permissions from all assigned roles
    const permissions = userRoles.reduce((acc, r) => {
      return [...acc, ...(r.permissions || [])];
    }, []);

    return [...new Set(permissions)]; // Unique permissions
  } catch (e) {
    console.error('Error parsing roles for permissions', e);
    return [];
  }
};

export const hasPermission = (permissionId) => {
  const perms = getPermissions();
  if (perms.includes('*')) return true;
  return perms.includes(permissionId);
};

export const hasAnyPermission = (permissionIds) => {
  const perms = getPermissions();
  if (perms.includes('*')) return true;
  return permissionIds.some(id => perms.includes(id));
};

export const getRoleNames = () => {
  const schoolId = localStorage.getItem('schoolId') || 'local';
  const teacherId = localStorage.getItem('teacherId');
  const storedRoles = localStorage.getItem(`schoolRoles:${schoolId}`);
  if (!storedRoles) return [];

  try {
    const roles = JSON.parse(storedRoles);
    return roles
      .filter(r => r.staffIds && r.staffIds.includes(teacherId))
      .map(r => r.name);
  } catch (e) {
    return [];
  }
};
