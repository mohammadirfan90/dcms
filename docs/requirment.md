
---

# Dental Chamber Management System (DCMS)

## Phase 1 — Product Requirements Document

**Project Name:** Antigravity DCMS
**Version:** Phase 1 (MVP)
**Tech Stack:** Next.js + Supabase + Cloudinary
**Target Users:** Small dental chamber (2 dentists + receptionist)

---

## 1. Purpose

The goal of this system is to digitize daily operations of a small dental clinic by replacing paper records with a simple, fast, and reliable web application.

The MVP focuses on **core daily workflow only**:

* Patient handling
* Appointments
* Treatment notes
* Billing
* Basic reporting

This is not a hospital system.
The system must remain minimal and extremely easy to use.

---

## 2. User Roles

### Admin

* Full access
* Manage system settings
* Manage doctors
* View all reports

### Dentist

* View assigned patients
* Add treatment notes
* Add prescriptions
* Create bills

### Receptionist (Optional in MVP but supported)

* Add patients
* Book appointments
* View schedules
* Create bills

---

## 3. Core Modules (Phase 1)

---

### 3.1 Authentication

Users log in using email and password.

Requirements:

* Secure login
* Role-based access
* Persistent session
* Logout

Supabase will handle authentication.

---

### 3.2 Patient Management

The clinic must be able to create and manage patient profiles.

Patient Fields:

* Full Name (required)
* Phone Number (required, unique preferred)
* Age
* Gender
* Address
* Medical Notes
* Created At
* Last Visit Date

Functional Requirements:

* Add patient
* Edit patient
* Search patient by name or phone
* View patient profile
* View visit history

---

### 3.3 Appointment Scheduling

The clinic must manage daily appointments.

Fields:

* Patient
* Doctor
* Date
* Time Slot
* Status (Booked / Completed / Cancelled)

Functional Requirements:

* Create appointment
* Change time/date
* Mark completed
* Cancel appointment
* View daily list
* Filter by doctor

Constraints:

* Prevent double booking same doctor + time

---

### 3.4 Treatment Records

Each visit creates a treatment record.

Fields:

* Patient ID
* Doctor ID
* Visit Date
* Complaint
* Diagnosis
* Procedure
* Tooth Number(s)
* Notes
* Follow-up Date
* Attachments (X-ray via Cloudinary)

Functional Requirements:

* Add treatment record
* Edit record
* View history timeline
* Upload images

---

### 3.5 Billing

System generates a simple bill per visit.

Fields:

* Patient
* Treatment Items
* Amount
* Discount
* Total
* Paid Amount
* Due Amount
* Payment Status (Paid / Partial / Due)
* Created Date

Functional Requirements:

* Create bill
* Edit bill
* Mark paid
* Print/share invoice

---

### 3.6 Dashboard

Simple overview screen.

Show:

* Today’s appointments
* Total patients today
* Today income
* Pending payments count

---

### 3.7 Reports (Basic)

Monthly summary only.

Show:

* Total patients
* Total revenue
* Pending dues

---

## 4. Non-Functional Requirements

Performance:

* Page load < 2 seconds
* Instant search results

Usability:

* Receptionist can learn within 10 minutes
* Max 2 clicks for common actions

Reliability:

* No data loss
* Cloud storage only
* Uptime keepalive strategy (10-min pinger)

Security:

* Authenticated routes only
* Role based restrictions
* Private patient data

---

## 5. Integrations

### Supabase

Used for:

* Authentication (Supabase Auth)
* Database (PostgreSQL)
* Role permissions (RLS + Profiles table)

### Cloudinary

Used for:

* X-ray images
* Attachments

---

## 6. Data Model Overview

Tables Required (Postgres):

* profiles (Extended user info)
* patients
* appointments
* treatments
* bills
* bill_items

Relationships:

* Patient → many appointments
* Patient → many treatments
* Treatment → one bill
* Doctor → many appointments

---

## 7. Out of Scope (Phase 1)

Not included in MVP:

* SMS reminders
* Online booking
* Inventory management
* Insurance claims
* Advanced analytics
* Multi-branch support
* Mobile app

---

## 8. Success Criteria

The system is considered complete when the clinic can:

1. Add a patient
2. Book an appointment
3. Record treatment
4. Generate a bill
5. Track daily income

without using paper.

---

## 9. Future Phases

Phase 2 may include:

* SMS reminders
* Patient portal
* Online booking
* Inventory
* AI assistance

---

**End of Document**
