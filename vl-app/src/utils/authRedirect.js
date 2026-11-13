export const DASHBOARD_MAP = {
  admin:          '/dashboard/admin',
  vl_manager:     '/dashboard/vl-manager',
  vl_coordinator: '/dashboard/vl-coordinator',
  nodal_centre:   '/dashboard/nodal',
  teacher:        '/dashboard/teacher',
  student:        '/labs',
  guest:          '/labs',
};

/**
 * Resolves the safe post-authentication redirect path for a user role.
 */
export function getAuthRedirectPath(loggedInUser, locationState) {
  const source = locationState?.from;
  const rawTarget = typeof source === 'string'
    ? source
    : (source?.pathname ? `${source.pathname}${source.search || ''}` : '');

  const isRestrictedForGuest = loggedInUser?.role === 'guest' && (
    rawTarget.startsWith('/dashboard') ||
    rawTarget.startsWith('/student/assignments') ||
    rawTarget.startsWith('/student/account')
  );

  if (!rawTarget || isRestrictedForGuest) {
    return DASHBOARD_MAP[loggedInUser?.role] || '/labs';
  }
  return rawTarget;
}

