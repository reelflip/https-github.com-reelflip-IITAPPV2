
# IIT JEE Prep Tracker: System Design Document (v19.0)

## 1. Executive Summary
A full-stack preparation tracking platform for IIT JEE aspirants. The system uses a React frontend and a stateless PHP API backend with a MySQL database. Designed specifically for Hostinger Shared Hosting environments.

## 2. Architecture Overview
- **Frontend**: React 19 SPA (Single Page Application).
- **Backend**: RESTful API built with PHP 8.x.
- **Database**: MySQL 8.0 (InnoDB) for relational data persistence.
- **Protocol**: JSON over HTTPS.
- **Strict Requirement**: No local caching or fallback mirroring. All state is managed by the server.

## 3. Component Breakdown
### 3.1 Role-Based Access Control (RBAC)
- **ADMIN**: Access to System Diagnostics, User Verification, Content Publishing (Blog/Hacks/Flashcards), and global analytics.
- **STUDENT**: Access to Syllabus tracking, Timetable generation, Mock Test center, Spaced-Repetition Revise tab, and AI Tutor.
- **PARENT**: Linked read-only access to a specific Student ID. Monitors scores and psychometric readiness.

### 3.2 Key Modules
- **Syllabus Engine**: Maps ~150 topics across Physics, Chemistry, and Maths. Tracks 'Status' and 'Solved Questions'.
- **Test Engine**: Timed JEE-pattern exam simulator (+4/-1 scoring). Saves results to `test_attempts` table.
- **Spaced Repetition**: Logic calculating `next_revision_date` based on a 1-7-30 day algorithm.
- **Psychometric Module**: 45-question behavioral assessment with a generated profile score.

## 4. Database Schema (MySQL)
- `users`: Primary identity (id, name, email, password_hash, role, is_verified).
- `user_progress`: Relational table (user_id, topic_id, status, last_revised, revision_level, next_revision_date).
- `test_attempts`: Performance history (user_id, test_id, score, accuracy, detailed_results_json).
- `timetables`: JSON configuration storage for personalized daily routines.
- `backlogs/goals`: Task management records for students.

## 5. Deployment Instructions (Hostinger)
1. Upload `index.html` and `assets/` to `public_html/`.
2. Upload the `api/` folder containing PHP files to `public_html/api/`.
3. Configure `api/config.php` with MySQL credentials.
4. Import `database_mysql.sql` via phpMyAdmin.
5. Ensure `.htaccess` redirects API calls to `index.php`.
