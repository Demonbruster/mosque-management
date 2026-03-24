# TASK-024: Governance & Election Management

**Epic:** Human Resources, Governance & Education Management  
**Priority:** 🟢 P3 — Low  
**Estimate:** 5 days  
**Labels:** `epic: hr`, `priority: low`, `type: fullstack`  
**Assignee:** _TBD_  
**Blocked by:** TASK-003  
**Blocks:** None

---

## 📋 Story

> **As a** mosque community,  
> **I want** a transparent online voting system to elect management board members, a module to track the official organizational hierarchy, and strict system access audit logs,  
> **so that** governance is democratic, transparent, and compliant with Waqf Board requirements.

## ✅ Current Status

- ✅ `management_committees` table with person_id, role_title, tenure_start/end, is_active
- ⬜ No election/voting system
- ⬜ No audit logs
- ⬜ No CRUD API or UI

## 📝 Sub-Tasks

### Backend

- [ ] **ST-24.1** — Build CRUD API for `/api/committees` (list current + historical committee members)
- [ ] **ST-24.2** — Create `elections` table: election_name, election_date, positions (JSON), status (Upcoming/Active/Completed), voting_start, voting_end
- [ ] **ST-24.3** — Create `election_candidates` table: election_id, person_id, position, manifesto
- [ ] **ST-24.4** — Create `election_votes` table: election_id, voter_id, candidate_id, voted_at (one vote per voter per position)
- [ ] **ST-24.5** — Build `POST /api/elections` — create new election with positions
- [ ] **ST-24.6** — Build `POST /api/elections/:id/vote` — cast a vote (verify voter is eligible member, hasn't voted already)
- [ ] **ST-24.7** — Build `GET /api/elections/:id/results` — tallied results (only available after voting_end)
- [ ] **ST-24.8** — Create `system_audit_logs` table: user_id, action, resource_type, resource_id, details (JSON), ip_address, timestamp
- [ ] **ST-24.9** — Build audit middleware: log all write operations automatically
- [ ] **ST-24.10** — Build `GET /api/admin/audit-logs` — searchable audit log viewer

### Frontend

- [ ] **ST-24.11** — Build Committee page (`/governance/committee`): current org chart, historical list
- [ ] **ST-24.12** — Build Election page (`/governance/elections`): list elections, create new election
- [ ] **ST-24.13** — Build Voting page: ballot view, cast vote, confirmation
- [ ] **ST-24.14** — Build Results page: bar chart of votes per candidate per position
- [ ] **ST-24.15** — Build Audit Log viewer (`/admin/audit-logs`): filterable table

## 🧪 Acceptance Criteria

- [ ] Each eligible member can vote exactly once per position per election
- [ ] Results are hidden until voting period ends
- [ ] Votes are secret (admin cannot see who voted for whom)
- [ ] Committee hierarchy displays current and historical boards
- [ ] All system actions are logged with user identity and timestamp
