# Role-Based Authentication Implementation Guide

## Overview
This document outlines the necessary fixes and implementations for role-based authentication in the Solarise-Odisha API, specifically focusing on user registration, login, and protected route access for different roles (agent, consumer/document uploader, doc team, site manager, accounts, admin).

## Current State Analysis

### Authentication System (Working)
- **Endpoints**: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- **Middleware**: `auth.middleware.js` validates JWT and sets `req.user`
- **Controllers**: `auth.controller.js` handles auth logic with bcrypt password hashing
- **Registration**: Currently allows role specification (defaults to "agent")
- **Login**: Validates credentials and returns JWT with user info including role

### Role-Based Access Control (Partially Implemented)
- **Middleware**: `roleAuth.js` exists and checks `req.user.role` against allowed roles
- **Inconsistent Application**: Current `users.routes.js` does not consistently follow RBAC guidelines

## Issues to Fix

### 1. Users Routes (`routes/users.routes.js`) - **NEEDS UPDATING**

**Current Code:**
```javascript
router.get("/", roleAuth('admin', 'agent'), getAllUsers);       
router.get("/:id", roleAuth('admin', 'agent'), getUserById);     
router.get("/role/:role", getUsersByRole);                      
router.post("/", createUser);                                   
router.put("/:id", roleAuth('admin', 'agent'), updateUser);     
router.delete("/:id", roleAuth('admin'), deleteUser);           
```

**Required Changes (per RBAC Guide):**
```javascript
// Only admin can manage users (create, update, delete, list all)
router.get("/", roleAuth('admin'), getAllUsers);                          
router.get("/:id", roleAuth('admin'), getUserById);                       
router.get("/role/:role", roleAuth('doc_team', 'admin'), getUsersByRole); 
router.post("/", roleAuth('admin'), createUser);                          
router.put("/:id", roleAuth('admin'), updateUser);                        
router.delete("/:id", roleAuth('admin'), deleteUser);                     
```

**Rationale**: 
- User management (CRUD) should be restricted to admin only per RBAC matrix
- Only doc_team and admin should be able to list users by role
- Regular agents should not be able to manage other users

### 2. Registration Endpoint Security Consideration

**Current Behavior**: 
- `POST /api/auth/register` allows any unauthenticated user to register with any role (defaults to "agent")

**Security Considerations**:
- Should public registration be restricted to certain roles only? (e.g., only "agent"/"consumer" roles)
- Should admin approval be required for certain roles?
- Current implementation may be intentional for public agent/consumer registration

**Recommendation**: 
If public registration should be limited, add role validation in `auth.controller.js`:
```javascript
// In register function, after extracting role:
const allowedPublicRoles = ['agent', 'consumer']; // or whatever roles should be publicly registrable
if (role && !allowedPublicRoles.includes(role)) {
  return res.status(403).json({ 
    error: 'Not authorized to register with this role' 
  });
}
```

### 3. Role Consistency

**Defined Roles** (from `role_based_access_control.md`):
- `agent`: Base level - consumers, document uploads, basic project info
- `site_manager`: Material delivery, installation progress  
- `doc_team`: Document verification, action required, registration pipeline
- `accounts`: Payments, subsidy disbursal
- `admin`: Full access + user/role management

**Note**: The term "consumer" appears in documentation but seems to map to the "agent" role in implementation. Clarify terminology:
- Is "consumer" synonymous with "agent" in the codebase?
- Or should there be a separate "consumer" role?

### 4. Protected Route Pattern

For any new route files, follow this pattern:
```javascript
const roleAuth = require('../middleware/roleAuth');
// ... imports

// Example: Protecting a route for multiple roles
router.get('/endpoint', roleAuth('role1', 'role2', 'admin'), controller.method);

// Example: Protecting for admin only
router.delete('/endpoint/:id', roleAuth('admin'), controller.method);
```

## Implementation Checklist

- [ ] Update `routes/users.routes.js` to match RBAC guide specifications
- [ ] Review and potentially secure `POST /api/auth/register` endpoint for role restrictions
- [ ] Ensure all new route files follow the roleAuth pattern consistently
- [ ] Verify role naming consistency between documentation and implementation
- [ ] Test all role-based access scenarios to confirm proper authorization

## Testing Recommendations

1. **Admin Access**: Verify admin can access all user management endpoints
2. **Agent Access**: Verify agents CANNOT access user management endpoints (except possibly their own profile via `/api/auth/me`)
3. **Role-Based Endpoints**: Test that endpoints like `/api/users/role/agent` are only accessible by doc_team and admin
4. **Registration**: Test that registration works appropriately (with or without restrictions based on decision)
5. **Token Validation**: Ensure expired/invalid tokens are properly rejected

## Files to Modify

1. `solarise-api/routes/users.routes.js` - Primary fix needed
2. `solarise-api/controllers/auth.controller.js` - Optional: Add role validation to registration
3. Documentation: Ensure role terminology is consistent between code and docs

## Notes

- The `auth.middleware.js` correctly sets `req.user` from JWT, which includes the role
- The `roleAuth.js` middleware correctly reads `req.user.role` and compares against allowed roles
- Once routes are properly protected, the RBAC system should work as documented in `role_based_access_control.md`