# Debug Journal

Complete one entry per bug. All six entries are required for full marks.

---

## Bug 1 — Silent RLS Block

| Field | Entry |
|------|------|
| **Symptom** | The dashboard table displays **“Empty table”** even though there are **5 rows of data in the `shipments` table** in the Supabase database. |
| **Hypothesis** | Row Level Security (RLS) is enabled on the `shipments` table, but there is **no policy allowing the `anon` role to read data** from the table. Because the dashboard uses the public Supabase `anon` key, the query returns an empty result set.<br><br>**Investigation:** After verifying that the database actually contains shipment records in Supabase, the next step was checking the database policies defined in `legacy_setup.sql`. The table had RLS enabled but only defined an **UPDATE policy**, with no policy allowing SELECT access for the `anon` role. Since Supabase enforces RLS strictly, any query executed by the frontend using the anon key would return an empty result set even though data exists. |
| **AI Prompt** | I am debugging a Next.js logistics dashboard that uses Supabase as the backend database. The dashboard loads a table of shipments on the `/dashboard` page, but the table shows “Empty table” even though the `shipments` table in Supabase contains 5 rows. There are no errors in the browser console. Since Supabase Row Level Security is enabled, could the issue be caused by the `anon` role not having permission to read the table? How can I verify this and configure the correct SELECT policy while keeping RLS enabled? |
| **Fix** | Added a **SELECT policy for the `anon` role** on the `shipments` table so the dashboard can read shipment records from Supabase. |

---

## Bug 2 — Ghost Mutation

| Field | Entry |
|------|------|
| **Symptom** | Changing a shipment status shows a **success toast notification**, but after refreshing the page the shipment status returns to its original value. Inspecting the `shipments` table in Supabase confirms that **no rows were updated**. |
| **Hypothesis** | The Supabase update query might not execute correctly, the server action might return success before the database mutation completes, the update query might not target the correct row, or the database might reject the update due to constraints or triggers.<br><br>**Investigation:** The issue was reproduced by updating a shipment status in the dashboard and refreshing the page, which confirmed that the database value did not change. Inspecting the server action responsible for updating the status showed that the Supabase `.update()` call was executed without `await`. Because the mutation is asynchronous, the server action returned a success response before the database operation completed, causing the UI to display a success toast even though the update had not yet persisted. |
| **AI Prompt** | I am debugging a server action in a Next.js application that updates shipment status in a Supabase database. When the user updates the status, the UI shows a success toast notification, but after refreshing the page the status returns to the original value and the database shows no change. The update logic uses a Supabase `.update()` query inside a server action. Could this issue occur if the database mutation is asynchronous but not awaited? Why would adding `await` allow the update to persist while removing it causes the change to disappear? |
| **Fix** | Added `await` to ensure the **database mutation completes before returning a success response**. |

---

## Bug 3 — Infinite Loop

| Field | Entry |
|------|------|
| **Symptom** | The dashboard becomes **unresponsive immediately after loading** and users cannot interact with any UI elements. Network inspection shows **hundreds of `GET /dashboard` requests per second** originating from `data-table.tsx`. |
| **Hypothesis** | A client-side navigation loop may be occurring due to a `useEffect` dependency repeatedly triggering `router.push`. Because navigation updates the URL, `searchParams` may be recreated on each render and cause the effect to run repeatedly. |
| **AI Prompt** | I am debugging a Next.js 15 logistics dashboard that uses TanStack Table and Supabase. The issue occurs in the `DataTable` client component where the page freezes immediately after loading and the Network panel shows hundreds of `GET /dashboard` requests per second, even though the user is not interacting with the page. The requests originate from a `useEffect` that updates the URL using `router.push` based on sorting state. The dependency array currently includes `table.getState().sorting`, `searchParams`, and `router`. I suspect one of these dependencies is causing the effect to rerun repeatedly and create a navigation loop. How can I determine which dependency is triggering the rerenders and what would be the correct dependency configuration to prevent the infinite loop while still updating the URL when sorting changes? |
| **Fix** | Updated the dependency array to depend only on the stable React state `sorting`. This prevents repeated navigation and stops the infinite request loop. |

---

## Bug 4 — The Invisible Cargo

| Field | Entry |
|------|------|
| **Symptom** | After fixing the initial data loading issue, the dashboard successfully renders all 5 shipment rows. However, the Cargo column appears blank for most rows, even though the database contains valid cargo data. |
| **Hypothesis** |The TypeScript type definition for `Shipment` expects `cargo_details` to be an object with the shape { item: string, weight_kg: number } or null. <br><br>However, after inspecting the `shipments` table directly in Supabase, the `cargo_details` column is stored as a JSONB array containing an object, for example `[{"item": "Laptop Batch A", "weight_kg": 120}]`.<br><br>This means the actual runtime data returned by Supabase is an array, while the frontend TypeScript type assumes it is a single object. Because the TanStack Table cell renderer attempts to access `cargo.item` and `cargo.weight_kg`, the values appear undefined when the value is actually an array, resulting in an empty Cargo column.<br><br>The repository already includes a utility function `normalizeCargoDetails` designed to convert the JSON array format into a single object, but this function is not currently used when rendering the TanStack Table column. Therefore, the issue is likely caused by a mismatch between the database JSON structure and the expected TypeScript type, combined with the missing normalization step before rendering.|
| **AI Prompt** | I am debugging a Next.js logistics dashboard using Supabase. The `shipments` table contains a `cargo_details` column stored as JSONB. The dashboard loads correctly and displays all shipment rows, but the Cargo column appears empty even though the database contains cargo information. The TypeScript type defines `cargo_details` as an object with `item` and `weight_kg`, but inspecting the database shows the values stored as JSON arrays. Could the issue be caused by a mismatch between the actual JSON structure returned by Supabase and the expected TypeScript type? Could the JSON be normalized using the existing `normalizeCargoDetails` function to convert the JSON array into an object so that TanStack Table can correctly render the cargo item name and weight? |
| **Fix** | Normalized the `cargo_details` value by converting the returned JSON array into an object using the `normalizeCargoDetails` utility before rendering it in the table. |

---

## Bug 5 — The Unreliable Search

| Field | Entry |
|------|------|
| **Symptom** | |
| **Hypothesis** | |
| **AI Prompt** | |
| **Fix** | |

---

## Bug 6 — The Persistent Ghost

| Field | Entry |
|------|------|
| **Symptom** | |
| **Hypothesis** | |
| **AI Prompt** | |
| **Fix** | |

---
