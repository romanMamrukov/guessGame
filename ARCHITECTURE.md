# Guess That Object - Architecture & Organization

This document outlines the high-level architecture of the `guessGame` application, explaining how the different parts of the system interact, where files are located, and how it is deployed.

## 1. High-Level Architecture

The application is a full-stack web application separated into two main repositories/folders: a **React Frontend** and a **Node.js/Express Backend**. It uses **Supabase** for its database and file storage.

### Data Flow
1. **Frontend (Client):** The user interacts with the React app in their browser.
2. **Backend (API):** The frontend sends HTTP requests to the Node.js API (e.g., getting an image, submitting a guess, updating a score).
3. **Database (Supabase):** The backend securely queries the Supabase PostgreSQL database or uploads files to Supabase Storage Buckets.

---

## 2. Directory Structure

### `/frontend`
This directory contains the user interface, built with React, TypeScript, and Vite, styled with TailwindCSS.
- `src/App.tsx`: The main entry point that handles routing/state (login, menu, game board).
- `src/components/`: Contains all the reusable UI pieces:
  - `Menu.tsx`: The game setup screen (difficulty, category selection).
  - `GameBoard.tsx`: The core game loop where images are shown and guesses are made.
  - `ImageUpload.tsx`: Allows users to upload custom images to the cloud.
  - `Leaderboard.tsx`: Displays the top global scores.
- `src/services/api.ts`: Centralized file for making HTTP `fetch` requests to the remote backend.
- `package.json`: Contains the frontend dependencies and build scripts.

### `/backend`
This directory contains the REST API server, built with Node.js, Express, and TypeScript.
- `src/server.ts`: The main Express application that defines all the API routes (`/api/images`, `/api/guess`, `/api/users`, etc.).
- `src/db/`: Contains database connection logic.
  - `supabase.ts`: Initializes the Supabase client using environment variables.
  - `migrateSupabase.ts`: Provides the raw SQL script used to set up the database tables.
- `package.json`: Contains the backend dependencies (like `multer` for file uploads, `@supabase/supabase-js`, `express`).

---

## 3. Platform & Deployment Map

The project leverages modern free-tier cloud platforms to host the different parts of the stack:

### A. Frontend Hosted on GitHub Pages (`gh-pages` branch)
- **What it is:** The compiled static HTML, CSS, and JS files for the React app.
- **How it works:** When we run `npm run deploy` in the frontend folder, Vite builds the project into a `dist/` folder and pushing it directly to the `gh-pages` branch on GitHub. GitHub then serves these static files to the public internet.

### B. Backend API Hosted on Render.com
- **What it is:** A web service running the Node.js Express server (`server.ts`).
- **How it works:** Render listens to the `main` branch of our GitHub repository. Whenever code is pushed, Render automatically runs `npm install && npm run build` to compile the TypeScript, and `npm start` to run the server. It exposes the API securely over HTTPS (e.g., `https://guessgame-api.onrender.com`).
- **Environment Variables:** Render holds the secret keys (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) so they are never exposed to the public frontend code.

### C. Database & Storage Hosted on Supabase
- **What it is:** A cloud provider offering a managed PostgreSQL database and S3-compatible file storage.
- **Database:** Stores the `users` (usernames, scores) and `objects` (image URLs, answers, categories, difficulties) tables.
- **Storage Buckets:** Contains a public bucket named `images`. When a user uploads a file through the frontend, it goes to the backend, which streams it directly into this Supabase Bucket and returns a persistent public URL.

---

## 4. Development & Running Locally

If you need to make changes locally on your personal machine:

1. **Start the Frontend:**
   - cd `frontend`
   - `npm install`
   - `npm run dev`
   - Open `localhost:5173`

2. **Start the Backend:**
   - cd `backend`
   - Create a `.env` file and add your `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
   - `npm install`
   - `npm run dev`
   - Server runs on `localhost:3000`

*Note: If testing locally, you must temporarily change the `API_BASE` variable in `frontend/src/services/api.ts` to `http://localhost:3000/api`.*
