# Reform Areas Module

This module is responsible for managing Reform Areas, which act as the first layer in the Enterprise Schema Builder under the `Edition` module.

## Features
- **Strict Edition Integration**: Reform areas belong to an Edition.
- **Tenant Isolation**: Only queries within the user's organization are allowed.
- **State Check**: Automatically guards against mutating Reform Areas attached to Locked, Published, Closed, or Archived Editions.
- **Audit Logging**: Fully integrated with `AuditService`.
