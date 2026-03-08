# Debug Journal

Complete one entry per bug. All six entries are required for full marks.

---

## Bug 1 — Silent RLS Block

| Field          | Your Entry |
| -------------- | ---------- |
| **Symptom**    |  The table on the dashboard displays “Empty table” even though when checked, there are 5 rows of data in the shipment table in the Supabase database.         |
| **Hypothesis** | RLS Policy sudah ada untuk tabel shipments namun, tidak ada policy untuk anon dapat melakukan read pada tabel shipments           |
| **AI Prompt**  | I am a software engineer intern currently studying next js & supabase, i got a technical assesment where my job is  to read the codebase cold, diagnose six live bugs, fix them, and document your process exactly as you would in a real incident. In this study case i need to resolve all the six bug that OA has filed, then implement new feature but lets focus on fixing the bug first

i already sent you the ReadMe.MD - this is the documentation about what should we do,
legacy_setup.sql - this is the sql code that need to import in supabase.      |

| **Fix**        | Menambahkan RLS policy SELECT untuk role anon pada table shipments supaya dapat membaca tabel yang ada di supabase dan muncul di dashboard.    |

---

## Bug 2 — Ghost Mutation

| Field          | Your Entry |
| -------------- | ---------- |
| **Symptom**    |   • changing a shipment status shows a success toast notification
  • However, after refreshing the page, the shipment status returns to its original value
  •  Inspecting the shipments table in Supabase, it shows that no rows were updated |
| **Hypothesis** |  • Supabase update query may not be executing correctly
  • Server action may be returning success without waiting for database mutation to complete
  • Update query may not bet targeting the row
  • Database might reject update due to constraints or trigger|
| **AI Prompt**  | Moving on to bug number 2, where the root cause is that the status does not change when updated on the server action. Please teach me how to debug and what needs to be done.
Why is it necessary to add await for the change to occur, but when await is not added, the status does not change?
|
| **Fix**        |Added `await` to ensure the database mutation completes before the returning success|

---

## Bug 3 — Infinite Loop

| Field          | Your Entry |
| -------------- | ---------- |
| **Symptom**    |            |
| **Hypothesis** |            |
| **AI Prompt**  |            |
| **Fix**        |            |

---

## Bug 4 — The Invisible Cargo

| Field          | Your Entry |
| -------------- | ---------- |
| **Symptom**    |            |
| **Hypothesis** |            |
| **AI Prompt**  |            |
| **Fix**        |            |

---

## Bug 5 — The Unreliable Search

| Field          | Your Entry |
| -------------- | ---------- |
| **Symptom**    |            |
| **Hypothesis** |            |
| **AI Prompt**  |            |
| **Fix**        |            |

---

## Bug 6 — The Persistent Ghost

| Field          | Your Entry |
| -------------- | ---------- |
| **Symptom**    |            |
| **Hypothesis** |            |
| **AI Prompt**  |            |
| **Fix**        |            |
