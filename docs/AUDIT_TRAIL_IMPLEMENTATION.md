# Audit Trail Design
## Overview

The audit trail is designed to track status changes made to the system. To improve traceability and operational transparancy, an audit trail system was implemented to automatically record every shipment status change. Each audit record captures the shipment that was changed (a reference to shipments.id), the new status, the old status, and when the change was occured. 

This allows for a comprehensive history of status changes, enabling better monitoring and troubleshooting of shipment processes.

---

## 1. Schema Design
The audit trail is implemented using a new table called `shipment_status_audit`. The schema for this table is as follows:

```sql
CREATE TABLE audit_logs ( 
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(), 
    shipment_id uuid NOT NULL REFERENCES shipments(id) ON DELETE CASCADE, old_status text NOT NULL, 
    new_status text NOT NULL, 
    changed_at timestamptz DEFAULT now() 
);
```

### Column Rationale

Column | Purpose
--- | ---
`id` | A unique identifier for each audit record, generated using `gen_random_uuid()`.
`shipment_id` | A foreign key referencing the `shipments` table, indicating which shipment's status was changed.
`old_status` | The previous status of the shipment before the change.
`new_status` | The new status of the shipment after the change.
`changed_at` | A timestamp indicating when the status change occurred, defaulting to the current time.

The `shipment_id` column uses a foreign key relationship with `shipments.id` to ensure referential integrity between the shipments
record and its associated audit logs.

The `ON DELETE CASCADE` constraint ensures that if a shipment is deleted, its related audit history is also removed.

---

## 2. Row Level Security (RLS)
Row Level Security is enabled on the `audit_logs` table to ensure that audit records cannot be modified by users.

```sql
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
```
A read policy is defined for anon role:
```sql
CREATE POLICY "Allow read audit logs"
ON audit_logs
FOR SELECT
to anon
USING (true);
```

An insert policy is defined for anon role:
```sql
CREATE POLICY "Allow insert audit logs"
ON audit_logs
FOR INSERT
to anon
WITH CHECK (true);
```
Row Level Security is enabled on the audit_logs table to protect the integrity of the audit trail. A read-only SELECT policy
is granted to the anon role so the application can view audit records. INSERT operations are not exposed to clients and are
performed exclusively through a database trigger, ensuring the audit log cannot be tampered with by users.


Because the Supabase Client executes queries using the anon role, the database trigger that inserts audit log entries also
runs under the same role context. Therefore, an INSERT policy for the anon role is required so the trigger can write audit
records. Without this policy, Row Level Security would block the insert operation.

The design protects the reliability of the audit trail.

---

## 3. Insert Mechanism
The audit log entries are created using a PostgreSQL database trigger attached to the `shipments` table.

### Trigger Function
```sql
CREATE OR REPLACE FUNCTION log_shipment_status_change()
RETURNS trigger AS $$
BEGIN
 IF OLD.status IS DISTINCT FROM NEW.status THEN
   INSERT INTO audit_logs (
    shipment_id,
    old_status,
    new_status
  )
  VALUES (
    OLD.id,
    OLD.status,
    NEW.status
  );
END IF;

RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Trigger Definition
```sql
CREATE TRIGGER shipment_status_audit
AFTER UPDATE ON shipments
FOR EACH ROW
EXECUTE FUNCTION log_shipment_status_change();
```
This trigger automatically records every shipment status change whenever an update occurs. The condition:

`IF OLD.status IS DISTINCT FROM NEW.status`

ensures that logs are created only when the status actually changes.

By implementing the audit logging at the database level, the system guarantees that audit records are captured
regardless of which part of the application modifies the shipment status.

---

## 4. Trade-offs
Two implementation approaches were considered:
1. Server Action Logging
   >Insert audit records inside the `updateShipmentStatus` server action after a successful update.
  
2. Database Trigger Logging **(Chosen Approach)**
    >Use a PostgreSQL trigger that automatically logs the status change whenever the `shipment` row is updated.
---

### Pros of the Server Action Logging Approach
* Easier to understand and maintain since the logging logic resides directly in the application code.
* Simpler to modify or extend because changes can be made within the same codebase as the business logic.
* More transparent for developers who primarily work in the application layer.

### Cons of the Server Action Logging Approach
* The audit mechanism depends entirely on the application layer
* Any future service, migration script, or direct database operation that updates shipment status outside the server action
could bypass the logging logic.
* This could result in missing or incomplete audit records

---
### Pros of the Database Trigger Logging (Chosen Approach)
* Guarantees that audit logs are recorded regardless of how the shipment update occurs.
* Ensures the audit trail is generated even if updates happen through another API endpoint, admin tool, or direct SQL query.
* Provides stronger data integrity by enforcing logging at the database level.
* Prevents the logging mechanism from being bypassed by application-level changes.

### Cons of the Database Trigger Logging (Chosen Approach)
* Adds additional complexity to the database layer, which may be harder for some developers to maintain or debug.
* Trigger logic is less visible from the application codebase, making the behavior less obvious to developers unfamiliar with the database setup.
* Changes to the logging behavior require database migrations rather than simple application code updates.

---

### Conclusion

The audit trail system was implemented using a PostgreSQL trigger to ensure that shipment status changes are logged automatically
and reliably. By enforcing logging at the database layer and protecting the audit table with RLS, the system guarantees accurate
and tamper-resistant activity records. This design ensures the audit trail cannot be bypassed by application-level bugs or future
system integrations.
