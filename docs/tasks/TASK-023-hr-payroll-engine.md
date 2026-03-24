# TASK-023: HR & Payroll Engine

**Epic:** Human Resources, Governance & Education Management  
**Priority:** 🟢 P3 — Low  
**Estimate:** 5 days  
**Labels:** `epic: hr`, `priority: low`, `type: fullstack`  
**Assignee:** _TBD_  
**Blocked by:** TASK-003  
**Blocks:** None

---

## 📋 Story

> **As a** mosque administrator,  
> **I want** to manage employee records (Imams, facility workers), process monthly payroll, track attendance, handle loans with auto-deductions, and generate final settlements/experience certificates,  
> **so that** staff management is digitized and transparent.

## ✅ Current Status

- ✅ `employee_payrolls` table with salary, allowances, deductions, net_salary, payment_date
- ✅ `employee_loans` table with total_amount, pending_balance, monthly_deduction
- ⬜ No employee profiles (uses persons table with category = "Staff")
- ⬜ No attendance tracking
- ⬜ No payslip generation
- ⬜ No CRUD API or UI

## 📝 Sub-Tasks

### Backend

- [ ] **ST-23.1** — Create `employee_profiles` table: person_id, designation, joining_date, education_bg, accommodation_benefit, food_allowance, employment_status (Active/Resigned/Terminated)
- [ ] **ST-23.2** — Create `employee_attendance` table: employee_id, date, status (Present/Absent/Leave/Half_Day)
- [ ] **ST-23.3** — Build CRUD API for `/api/employees` (list, get, create, update)
- [ ] **ST-23.4** — Build `POST /api/payroll/generate` — auto-generates monthly payslips for all active employees (salary - deductions + allowances - loan_deduction = net)
- [ ] **ST-23.5** — Build `GET /api/payroll/:employee_id/payslips` — list payslips
- [ ] **ST-23.6** — Build `GET /api/payroll/:id/payslip-pdf` — generates PDF payslip
- [ ] **ST-23.7** — Build loan management: auto-deduct monthly_deduction from salary, reduce pending_balance
- [ ] **ST-23.8** — Build `POST /api/employees/:id/settlement` — final settlement calculator (pending salary + leave encashment - loans)
- [ ] **ST-23.9** — Build `GET /api/employees/:id/experience-certificate` — generates PDF experience certificate

### Frontend

- [ ] **ST-23.10** — Build Employee List page (`/hr/employees`): staff directory with designation, status
- [ ] **ST-23.11** — Build Employee Detail page: profile, attendance calendar, payroll history, loans
- [ ] **ST-23.12** — Build Payroll Processing page (`/hr/payroll`): monthly batch generation, review, approve
- [ ] **ST-23.13** — Build Attendance Tracker: calendar-based mark attendance
- [ ] **ST-23.14** — Build Settlement Wizard: calculate and generate final settlement

## 🧪 Acceptance Criteria

- [ ] Monthly payroll auto-deducts loan installments
- [ ] Payslips include all line items (basic, allowances, deductions, loans, net)
- [ ] Loans with zero pending balance are highlighted as "Cleared"
- [ ] Final settlement calculates all dues and generates downloadable PDF
- [ ] Experience certificate generates with standardized format
