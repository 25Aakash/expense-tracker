import safeParse from './safeParse';

/**
 * Always returns a full, boolean-normalised permission object, even when
 * localStorage is empty or corrupted.
 */
export function getPerms() {
  const raw = safeParse(localStorage.getItem('permissions'));

  return {
    canAdd:           !!raw.canAdd,
    canEdit:          !!(raw.canEdit ?? raw.canModify),
    canDelete:        !!raw.canDelete,
    canExport:        !!raw.canExport,
    canAccessReports: !!raw.canAccessReports,
    canViewTeam:      !!raw.canViewTeam,
    canManageUsers:   !!raw.canManageUsers
  };
}
