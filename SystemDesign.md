# IIT JEE Prep Tracker: System Design Document (v20.0)

## 1. Executive Summary
A full-stack preparation tracking platform for IIT JEE aspirants. The system uses a React frontend and a stateless PHP API backend with a MySQL database. Designed specifically for Hostinger Shared Hosting environments. Version 20.0 introduces the complete 40-file backend suite.

## 2. Architecture Overview
- **Frontend**: React 19 SPA (Single Page Application).
- **Backend**: 40-file RESTful API built with PHP 8.x.
- **Database**: Full-fledged MySQL 8.0 (InnoDB) schema.
- **Protocol**: JSON over HTTPS with CORS protection.
- **Strict Requirement**: No local caching or fallback mirroring. All state is managed by the server.

## 3. Component Breakdown
### 3.1 Role-Based Access Control (RBAC)
- **ADMIN**: Access to System Diagnostics, User Verification, Content Publishing (Blog/Hacks/Flashcards), and global analytics.
- **STUDENT**: Access to Syllabus tracking, Timetable generation, Mock Test center, Spaced-Repetition Revise tab, and AI Tutor.
- **PARENT**: Linked read-only access to a specific Student ID. Monitors scores and psychometric readiness.

### 3.2 Key Modules
- **Syllabus Engine**: Maps ~150 topics across Physics, Chemistry, and Maths.
- **Test Engine**: Timed JEE-pattern exam simulator (+4/-1 scoring).
- **Spaced Repetition**: Logic calculating `next_revision_date` based on a 1-7-30 day algorithm.
- **Psychometric Module**: Behavioral assessment for exam readiness.

## 4. Database Schema (MySQL)
The v20.0 schema includes 18+ tables covering users, progress, tests, analytics, content, and system configuration.

## 5. Deployment Instructions (Hostinger)
1. Upload `index.html` and `assets/` to `public_html/`.
2. Upload the `api/` folder containing all 40 PHP files to `public_html/api/`.
3. Configure `api/config.php` with MySQL credentials.
4. Import `database_mysql.sql` via phpMyAdmin.
5. Ensure `.htaccess` is present in `public_html/` for routing.