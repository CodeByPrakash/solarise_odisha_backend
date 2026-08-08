import React from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * RoleGuard Component
 * Allowed roles from adp_solarise_system_table.sql:
 * - 'admin'
 * - 'agent'
 * - 'site_manager'
 * - 'doc_team'
 * - 'accounts'
 */
export const RoleGuard = ({ allowedRoles = [], children, fallback = null }) => {
  const { user } = useAuth();

  if (!user) {
    return fallback;
  }

  // Super admin always has access to all actions and views
  if (user.role === 'admin') {
    return children;
  }

  if (allowedRoles.length > 0 && allowedRoles.includes(user.role)) {
    return children;
  }

  return fallback;
};

export const HasRole = ({ roles = [] }) => {
  const { user } = useAuth();
  if (!user) return false;
  if (user.role === 'admin') return true;
  return roles.includes(user.role);
};

export default RoleGuard;
