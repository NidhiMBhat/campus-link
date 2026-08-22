# Campus Link

 A lightweight campus task & help app built with React, Vite, Tailwind CSS and Firebase.

 ## Features
 - Post and claim help requests (bounties)
 - Task listing, profile and leaderboard
 - Geolocation and nearby-request notifications

 ## Tech Stack
 - React (JSX)
 - Vite
 - Tailwind CSS
 - Firebase (Auth & Firestore)

 ## Prerequisites
 - Node.js (LTS) and npm

 ## Quick Setup

 1. Install dependencies

 ```bash
 npm install
 ```

 2. Start dev server

 ```bash
 npm run dev
 ```

 3. Build for production

 ```bash
 npm run build
 ```

 ## Firebase
 - Firebase configuration lives in `src/firebase.js` — replace with your project keys and ensure Firestore rules and Authentication are configured.

 ## Project Structure (important files)

 - `src/main.jsx` — app entry
 - `src/App.jsx` — root component
 - `src/firebase.js` — Firebase initialization
 - `src/pages/` — page views (Home, Tasks, Profile, etc.)
 - `src/components/` — UI components (NavCard, LeaderboardCard, NotificationBell)
 - `src/services/` — helper services (location, notifications, completeTask)

 See [src/pages/Home.jsx](src/pages/Home.jsx#L1) for an example of user/profile checks and notifications.

 ## Environment & Permissions
 - The app requests geolocation and notification permissions from users — test in a secure (HTTPS) environment or via `localhost`.

 ## Contributing
 - Open issues or submit PRs. Keep changes focused and include small commits.

 ## License
 - MIT
