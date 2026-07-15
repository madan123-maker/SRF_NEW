# Action Points Module

This module manages Action Points, representing the second level in the Schema Builder (Edition -> Reform Area -> Action Point).

## Features
- **Hierarchical Validation**: Enforces conditions on ReformArea and the parent Edition.
- **Tenant Validation**: Prevents data access across organizations.
- **Auto-Sequencing**: Supports auto `displayOrder`.
- **Audit Logging**: Deep integration with `AuditService`.
