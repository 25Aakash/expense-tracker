import { useAuth } from '../context/AuthContext';

export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = (permission) => {
    // Admin and manager roles have all permissions
    if (user?.role === 'admin' || user?.role === 'manager') {
      return true;
    }

    // For regular users, check their specific permissions
    if (!user?.permissions) {
      return false;
    }

    return user.permissions[permission] === true;
  };

  const canAdd = () => hasPermission('canAdd');
  const canEdit = () => hasPermission('canEdit');
  const canDelete = () => hasPermission('canDelete');
  const canViewTeam = () => hasPermission('canViewTeam');
  const canManageUsers = () => hasPermission('canManageUsers');
  const canExport = () => hasPermission('canExport');
  const canAccessReports = () => hasPermission('canAccessReports');

  return {
    hasPermission,
    canAdd,
    canEdit,
    canDelete,
    canViewTeam,
    canManageUsers,
    canExport,
    canAccessReports,
    user,
  };
};

export default usePermissions;
