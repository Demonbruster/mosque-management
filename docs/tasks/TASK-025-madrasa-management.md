# TASK-025: Islamic School (Madrasa) Management

**Epic:** Human Resources, Governance & Education Management  
**Priority:** 🟢 P3 — Low  
**Estimate:** 5 days  
**Labels:** `epic: hr`, `priority: low`, `type: fullstack`  
**Assignee:** _TBD_  
**Blocked by:** TASK-005  
**Blocks:** None

---

## 📋 Story

> **As a** Madrasa coordinator,  
> **I want** to manage classes, student enrollments, teacher assignments, homework, attendance, and parent communication,  
> **so that** the mosque's Islamic education programs are administered professionally.

## ✅ Current Status

- ✅ `madrasa_classes` table with class_name, schedule, teacher_id
- ✅ `student_enrollments` table with student_id, class_id, enrollment_date, status
- ⬜ No attendance tracking
- ⬜ No homework/assignment tracking
- ⬜ No parent communication portal
- ⬜ No CRUD API or UI

## 📝 Sub-Tasks

### Backend

- [ ] **ST-25.1** — Build CRUD API for `/api/madrasa/classes` (list, create, update, deactivate)
- [ ] **ST-25.2** — Build CRUD API for `/api/madrasa/enrollments` (enroll, update status, list by class/student)
- [ ] **ST-25.3** — Create `madrasa_attendance` table: class_id, student_id, date, status (Present/Absent/Excused)
- [ ] **ST-25.4** — Build `POST /api/madrasa/attendance/batch` — batch mark attendance for a class on a date
- [ ] **ST-25.5** — Create `madrasa_assignments` table: class_id, title, description, due_date, assigned_by
- [ ] **ST-25.6** — Build CRUD API for `/api/madrasa/assignments`
- [ ] **ST-25.7** — Build `GET /api/madrasa/students/:id/report` — attendance percentage, assignments, enrollment status
- [ ] **ST-25.8** — Build parent notification endpoint: send attendance/progress updates via WhatsApp to parent (using person_relationships to find parent)

### Frontend

- [ ] **ST-25.9** — Build Classes page (`/madrasa/classes`): list with teacher name, schedule, student count
- [ ] **ST-25.10** — Build Class Detail page: enrolled students, attendance sheet, assignments
- [ ] **ST-25.11** — Build Attendance Sheet: date-based grid, batch mark present/absent
- [ ] **ST-25.12** — Build Student Report Card: attendance %, assignments overview
- [ ] **ST-25.13** — Build Parent Portal view (member role): read-only view of child's attendance and assignments

## 🧪 Acceptance Criteria

- [ ] Batch attendance marking works for a full class in one action
- [ ] Student report shows attendance percentage and assignment completion
- [ ] Parents receive WhatsApp updates about their children's progress (if opted in)
- [ ] Teacher can manage assignments for their assigned classes
- [ ] Enrollment status transitions (Active → Completed/Dropped) are tracked
