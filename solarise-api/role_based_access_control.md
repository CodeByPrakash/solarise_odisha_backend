# Role-Based Access Control Implementation Guide

**File:** `role_based_access_control.md`  
**Purpose:** Code chunks to add for implementing role-based access control in Solarise-Odisha API  
**Roles Defined:** 
- `agent`: Base level - consumers, document uploads, basic project info
- `site_manager`: Material delivery, installation progress
- `doc_team`: Document verification, action required, registration pipeline
- `accounts`: Payments, subsidy disbursal
- `admin`: Full access + user/role management

---

## 1. Create Role Authentication Middleware

Create a new file: `middleware/roleAuth.js`

```javascript
/**
 * Role-based authentication middleware
 * Checks if the authenticated user has required role(s) to access a route
 */

const roleAuth = (...allowedRoles) => {
  return (req, res, next) => {
    // If no roles specified, allow all authenticated users
    if (allowedRoles.length === 0) {
      return next();
    }

    // Get user role from request (assuming auth middleware sets req.user)
    const userRole = req.user?.role;

    // Check if user is authenticated
    if (!userRole) {
      return res.status(401).json({ 
        error: 'Authentication required', 
        message: 'You must be logged in to access this resource' 
      });
    }

    // Check if user's role is in allowed roles
    const hasPermission = allowedRoles.includes(userRole);

    if (!hasPermission) {
      return res.status(403).json({ 
        error: 'Insufficient permissions', 
        message: `You do not have permission to perform this action. Required roles: ${allowedRoles.join(', ')}` 
      });
    }

    // User has required role, proceed to next middleware/route handler
    next();
  };
};

module.exports = roleAuth;
```

---

## 2. Update Authentication Flow (if needed)

Ensure your authentication middleware (likely in `server.js` or a separate auth middleware) attaches user information to `req.user`. Example:

In your auth middleware (after verifying JWT/session):
```javascript
// After verifying token/session
req.user = {
  id: decoded.userId,
  email: decoded.email,
  role: decoded.role, // Make sure your token includes role
  // ...other user fields
};
next();
```

---

## 3. Apply Role-Based Access to Routes

### Example: Users Routes (`routes/users.routes.js`)
```javascript
// Add at top of file
const roleAuth = require('../middleware/roleAuth');
const { Router } = require("express");
const {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getUsersByRole,
} = require("../controllers/users.controller.js");

const router = Router();

// Only admin can manage users (create, update, delete, list all)
router.get("/", roleAuth('admin'), getAllUsers);      // GET /api/users
router.get("/:id", roleAuth('agent'), getUserById);     // GET /api/users/3 - agents can view their own or others? Adjust as needed
router.get("/role/:role", roleAuth('doc_team', 'admin'), getUsersByRole); // GET /api/users/role/agent
router.post("/", roleAuth('admin'), createUser);      // POST /api/users - only admin can create users
router.put("/:id", roleAuth('admin'), updateUser);      // PUT /api/users/3
router.delete("/:id", roleAuth('admin'), deleteUser);      // DELETE /api/users/3

module.exports = router;
```

### Example: Documents Routes (`routes/documents.routes.js`)
```javascript
const roleAuth = require('../middleware/roleAuth');
const { Router } = require("express");
const {
    getDocumentsByConsumer,
    createDocument,
    verifyDocument,
    rejectDocument,
    reuploadDocument,
    getDocumentStatusSummary
} = require("../controllers/documents.controller.js");

const router = Router();

// Agents can upload documents for their consumers
router.post("/", roleAuth('agent'), createDocument);

// Agents and doc team can view documents (based on consumer ownership/verification needs)
router.get("/:consumerId", roleAuth('agent', 'doc_team', 'site_manager'), getDocumentsByConsumer);

// Only doc team can verify/reject documents
router.patch("/verify/:id", roleAuth('doc_team'), verifyDocument);
router.patch("/reject/:id", roleAuth('doc_team'), rejectDocument);

// Agents can reupload documents (their own uploads)
router.patch("/reupload/:id", roleAuth('agent'), reuploadDocument);

// Doc team and admin can see document status summary
router.get("/status/summary", roleAuth('doc_team', 'admin'), getDocumentStatusSummary);

module.exports = router;
```

### Example: Payments Routes (`routes/payments.routes.js`)
```javascript
const roleAuth = require('../middleware/roleAuth');
const { Router } = require("express");
const {
    getPaymentsByProject,
    createPayment,
    updatePaymentStatus,
    getPendingPayments,
    getPaymentsSummary
} = require("../controllers/payments.controller.js");

const router = Router();

// Only accounts and admin can manage payments
router.get("/project/:projectId", roleAuth('accounts', 'admin'), getPaymentsByProject);
router.post("/", roleAuth('accounts', 'admin'), createPayment);
router.patch("/:id/status", roleAuth('accounts', 'admin'), updatePaymentStatus);
router.get("/pending", roleAuth('accounts', 'admin'), getPendingPayments);
router.get("/summary", roleAuth('accounts', 'admin'), getPaymentsSummary);

module.exports = router;
```

### Example: Projects Routes (`routes/projects.routes.js`)
```javascript
const roleAuth = require('../middleware/roleAuth');
const { Router } = require("express");
const {
    getAllProjects,
    getProjectsDashboard,
    getProjectsByStatus,
    getProjectById,
    createProject,
    updateProjectStatus,
    updateProject,
    deleteProject
} = require("../controllers/projects.controller.js");

const router = Router();

// Role-based access for projects
router.get("/", roleAuth('agent', 'site_manager', 'doc_team', 'accounts', 'admin'), getAllProjects);
router.get("/dashboard", roleAuth('doc_team', 'accounts', 'admin'), getProjectsDashboard);
router.get("/status/:status", roleAuth('agent', 'site_manager', 'doc_team', 'accounts', 'admin'), getProjectsByStatus);
router.get("/:id", roleAuth('agent', 'site_manager', 'doc_team', 'accounts', 'admin'), getProjectById);

// Project creation: agents create projects for their consumers
router.post("/", roleAuth('agent'), createProject);

// Status updates: depends on who can change what status
// Doc team can move projects through registration pipeline
// Site manager handles installation-related statuses
// Accounts handles payment-related statuses
// Admin can override any status
router.patch("/:id/status", 
  roleAuth('doc_team', 'site_manager', 'accounts', 'admin'), 
  updateProjectStatus
);

// General project updates: varies by field
// For simplicity, applying role-based here - could be more granular
router.put("/:id", roleAuth('agent', 'doc_team', 'accounts', 'admin'), updateProject);
router.delete("/:id", roleAuth('admin'), deleteProject); // Only admin can delete

module.exports = router;
```

### Example: Installation Progress Routes (`routes/installationProgress.routes.js`)
```javascript
const roleAuth = require('../middleware/roleAuth');
const { Router } = require("express");
const {
    getChecklistByProject,
    initChecklist,
    completeItem,
    getProgress
} = require("../controllers/installationProgress.controller.js");

const router = Router();

// Site managers initialize and update installation progress
// Agents and doc team can view progress
router.get("/project/:projectId", roleAuth('agent', 'site_manager', 'doc_team'), getChecklistByProject);
router.post("/project/:projectId/init", roleAuth('site_manager'), initChecklist);
router.patch("/:id/complete", roleAuth('site_manager'), completeItem);
router.get("/project/:projectId/progress", roleAuth('agent', 'site_manager', 'doc_team'), getProgress);

module.exports = router;
```

### Example: Action Required Routes (`routes/actions.routes.js`)
```javascript
const roleAuth = require('../middleware/roleAuth');
const { Router } = require("express");
const {
    getAllOpenActions,
    getActionsByProject,
    createAction,
    updateActionStatus,
    getOverdueActions
} = require("../controllers/actionRequired.controller.js");

const router = Router();

// Doc team creates and manages actions
// Agents view actions assigned to them
// Others can view based on project access
router.get("/", roleAuth('doc_team', 'agent'), getAllOpenActions);
router.get("/project/:projectId", roleAuth('agent', 'doc_team', 'site_manager', 'accounts', 'admin'), getActionsByProject);
router.post("/", roleAuth('doc_team'), createAction);
router.patch("/:id/status", roleAuth('doc_team'), updateActionStatus);
router.get("/overdue", roleAuth('doc_team', 'admin'), getOverdueActions);

module.exports = router;
```

### Example: Notifications Routes (`routes/notifications.routes.js`)
```javascript
const roleAuth = require('../middleware/roleAuth');
const { Router } = require("express");
const { 
    // Add your notification controller methods here once implemented
    getUserNotifications,
    markAsRead,
    deleteNotification
} = require("../controllers/notifications.controller.js"); // Make sure to create this controller

const router = Router();

// Users can view their own notifications
router.get("/", roleAuth('agent', 'site_manager', 'doc_team', 'accounts', 'admin'), getUserNotifications);
router.patch("/:id/read", roleAuth('agent', 'site_manager', 'doc_team', 'accounts', 'admin'), markAsRead);
router.delete("/:id", roleAuth('agent', 'site_manager', 'doc_team', 'accounts', 'admin'), deleteNotification);

module.exports = router;
```

### Example: Status History Routes (`routes/statusHistory.routes.js`)
```javascript
const roleAuth = require('../middleware/roleAuth');
const { Router } = require("express");
const {
    // Add your status history controller methods here
    getProjectStatusHistory,
    addStatusHistoryEntry
} = require("../controllers/statusHistory.controller.js"); // Make sure to create this controller

const router = Router();

// Various roles can view status history based on project access
router.get("/project/:projectId", roleAuth('agent', 'site_manager', 'doc_team', 'accounts', 'admin'), getProjectStatusHistory);
router.post("/", roleAuth('doc_team', 'accounts', 'admin'), addStatusHistoryEntry); // Only certain roles can manually add entries

module.exports = router;
```

---

## 4. Role-Based Access Matrix Summary

| Role | Users | Area Blocks | Consumers | Bank Loans | Projects | Documents | Status History | Action Required | Ownership Transfers | Material Deliveries | Installation Progress | Payments | Notifications |
|------|-------|-------------|-----------|------------|----------|-----------|----------------|-----------------|---------------------|---------------------|----------------------|----------|---------------|
| **agent** | View own/create?* | View | Create/View own | View own | Create/View own | Upload/View own (assigned) | View (related projects) | View assigned | - | - | View | - | View own |
| **site_manager** | - | - | - | - | View assigned | - | View (related projects) | - | - | Create/View own | Create/Update/View own | - | View own |
| **doc_team** | View by role | - | View | View | View all | Verify/View all | View all | Create/Manage all | Manage all | - | View all | - | View all |
| **accounts** | - | - | - | View | View payment-related | View (for verification?) | View payment-related | - | - | - | - | Create/Manage all | View own |
| **admin** | Full CRUD | Full CRUD | Full CRUD | Full CRUD | Full CRUD | Full CRUD | Full CRUD | Full CRUD | Full CRUD | Full CRUD | Full CRUD | Full CRUD | Full CRUD |

*Note: "Create own" means agent can create consumers/projects but only for themselves (via created_by). For user management, only admin should create users.*

---

## 5. Implementation Notes & Best Practices

### 5.1. Where to Place Middleware
In each route file:
1. Import the middleware at the top: `const roleAuth = require('../middleware/roleAuth');`
2. Apply it as the second argument to route definitions (after path, before controller):
   ```javascript
   router.get("/path", roleAuth('role1', 'role2'), controllerMethod);
   ```

### 5.2. Granular Control Options
For more fine-grained control, consider:
- **Resource ownership checks** in controllers (e.g., verify user owns the consumer before allowing document upload)
- **Combination of middleware + controller checks**: Use middleware for role-based access, controllers for ownership/specific business rules
- **Custom middleware** for complex scenarios (e.g., "can only update own profile")

### 5.3. Example Ownership Check (to add in controllers)
Add this pattern in controllers where users should only access their own resources:
```javascript
// In a controller method
if (req.params.userId !== req.user.id && !['admin', 'doc_team'].includes(req.user.role)) {
  return res.status(403).json({ error: 'Access denied: can only access own resources' });
}
```

### 5.4. Testing the Implementation
After implementing:
1. Test with different user roles (create test users for each role)
2. Verify unauthorized attempts return 403
3. Verify authorized attempts succeed
4. Check that admin can access everything
5. Ensure agents cannot access payments/admin-only routes

### 5.5. Enhancement: Centralized Role Definitions
Consider creating a roles constant file for consistency:
```javascript
// utils/roles.js
module.exports = {
  AGENT: 'agent',
  SITE_MANAGER: 'site_manager',
  DOC_TEAM: 'doc_team',
  ACCOUNTS: 'accounts',
  ADMIN: 'admin',
  
  // Role groups for convenience
  CAN_MANAGE_USERS: ['admin'],
  CAN_UPLOAD_DOCUMENTS: ['agent'],
  CAN_VERIFY_DOCUMENTS: ['doc_team'],
  CAN_MANAGE_PAYMENTS: ['accounts', 'admin'],
  // ...etc
};
```

Then use: `roleAuth(roleUtils.CAN_MANAGE_USERS)` instead of hardcoding strings.

---

## 6. Files to Create/Modify

### New Files to Create:
1. `middleware/roleAuth.js` - The role authentication middleware
2. `controllers/notifications.controller.js` - Implement notification controller methods
3. `controllers/statusHistory.controller.js` - Implement status history controller methods

### Existing Files to Modify:
1. `routes/users.routes.js` - Add role protection
2. `routes/documents.routes.js` - Add role protection
3. `routes/payments.routes.js` - Add role protection
4. `routes/projects.routes.js` - Add role protection
5. `routes/installationProgress.routes.js` - Add role protection
6. `routes/actions.routes.js` - Add role protection
7. `routes/notifications.routes.js` - Create with role protection (currently empty)
8. `routes/statusHistory.routes.js` - Create with role protection (currently empty)
9. `server.js` - Ensure authentication middleware sets `req.user.role`

### Optional Enhancement:
Create `utils/roles.js` for centralized role definitions.

---

## 7. Summary

This implementation provides:
- ✅ **Role-based route protection** using reusable middleware
- ✅ **Clear separation of concerns** (middleware handles auth, controllers handle business logic)
- ✅ **Flexibility** to adjust role requirements per route
- ✅ **Security** by preventing unauthorized access at the route level
- ✅ **Maintainability** through consistent patterns

**Next Steps:**
1. Create the middleware file
2. Implement missing controllers (notifications, statusHistory)
3. Apply role protection to all route files using the examples above
4. Test thoroughly with different user roles
5. Consider adding ownership checks in controllers where appropriate

The role definitions match exactly what's specified in your `DB_design.md` file under section 1.1 Roles, ensuring consistency between database design and application logic.