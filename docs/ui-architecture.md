
# 🦷 DCMS Design System & UI Architecture

---

## 1. Design Philosophy

**Principle: “Clinical Calmness”**

Unlike fintech dashboards (data heavy), a dental clinic UI must reduce cognitive load.

Design Priorities:

1. Zero learning curve
2. Large readable information
3. Instant actions (≤ 2 clicks)
4. No visual noise
5. Works during patient conversation

So instead of dense tables → we use **Patient Cards + Context Panels**

> Dentist should never “operate software”.
> Software should feel invisible.

---

## 2. Technology & Styling Stack

Frontend Architecture:

* Framework: **Next.js (App Router)**
* Styling: **Tailwind CSS + CSS Variables tokens**
* Components: **Radix UI primitives**
* Component layer: **shadcn/ui pattern**
* Icons: **Lucide React**
* Data Sync: **TanStack Query**
* Form handling: **React Hook Form + Zod**
* Charts: **Tremor / Recharts minimal mode**

This mirrors production architecture used in modern SaaS dashboards 

---

## 3. Color System (Medical Neutral Palette)

### Core Palette (Light Mode)

| Token          | Usage               | Color             |
| -------------- | ------------------- | ----------------- |
| Background     | Page                | Pure White        |
| Surface        | Cards               | Very Light Gray   |
| Primary        | Action buttons      | Soft Medical Blue |
| Accent         | Focus info          | Teal              |
| Success        | Completed treatment | Green             |
| Warning        | Follow-up needed    | Amber             |
| Danger         | Pain / urgent       | Soft Red          |
| Text Primary   | Main text           | Near Black        |
| Text Secondary | Metadata            | Neutral Gray      |

### Emotional Goal

* No aggressive colors
* No dark fintech look
* Feels like prescription paper

---

## 4. Typography Scale

Typography must work for doctors aged 28-55.

| Role          | Size | Weight   |
| ------------- | ---- | -------- |
| Page Title    | 22px | Semibold |
| Section Title | 16px | Medium   |
| Body          | 14px | Regular  |
| Label         | 13px | Medium   |
| Metadata      | 12px | Regular  |

### Font Choice

* UI Font: **Inter / Geist Sans**
* Numeric Font: **Monospace for money & tooth numbers**

(Important: aligned digits improve scanning speed )

---

## 5. Layout & Spacing Rules

Uses strict **8px spacing grid**

### Main Layout

```
[ Sidebar ] [ Patient Workspace ]
```

Sidebar width: 240–260px

Workspace concept:

Instead of pages → **Workspaces**

* Today
* Patients
* Appointments
* Billing

Doctors don’t navigate menus → they stay in context.

---

## 6. Core UI Pattern (Key Difference)

Typical software:

> open patient → open treatment → open billing

DCMS:

> Everything inside ONE patient screen

### Patient Workspace Layout

```
Left: Patient Identity
Center: Treatment timeline
Right: Actions (prescription, bill, follow-up)
```

This reduces clicks by ~70%.

---

## 7. Component Library

### Buttons

| Type    | Usage             |
| ------- | ----------------- |
| Primary | Save / Create     |
| Soft    | Secondary actions |
| Ghost   | Navigation        |
| Danger  | Delete            |

Large touch targets (clinic environment = fast clicking)

---

### Data Display (No heavy tables)

Instead of tables:

✔ Patient Cards
✔ Timeline Records
✔ Status Pills

Because medical workflows are chronological, not spreadsheet based.

---

### Status Badges

| Status    | Color        |
| --------- | ------------ |
| Completed | Green        |
| Ongoing   | Blue         |
| Follow-up | Amber        |
| Urgent    | Red          |
| Paid      | Neutral dark |
| Due       | Orange       |

---

## 8. Appointment Interaction Model

Receptionist mode must be ultra fast:

**Click time slot → type name → Enter → Done**

No forms.

Calendar UX = Google Calendar simplicity.

---

## 9. Dental-Specific UI Patterns

### Tooth Chart Interaction

Hover tooth → click → select procedure

No dropdown menus.

### Treatment Timeline

Instead of records:

```
Mar 12 — Filling — Dr. Nusrat
Mar 20 — Pain complaint — Medicine
Apr 02 — Root Canal (Step 1)
```

Doctors think in history, not forms.

---

## 10. Feedback & Motion

Micro-interactions only:

* Save → soft checkmark fade
* Delete → slide away
* Payment → stamp animation

No loaders → skeleton screens 

---

## 11. Responsiveness Strategy

### Desktop (Primary)

Reception computer usage

### Tablet

Chairside consultation

### Mobile

Quick patient lookup only

Mobile is companion — not main system.

---

## 12. UX Rules (Very Important)

1. Never open modal for main workflow
2. Never show empty pages → show guidance
3. Always keep patient visible
4. Always show last visit at top
5. Billing must take ≤ 10 seconds

---

# Final Design Direction

The DCMS should feel like:

> Google Calendar + Notion + Stripe Dashboard
> but emotionally like a medical prescription pad

Clean, calm, professional — not “software looking”.

---


