# [Utinerary](https://utinerary.vercel.app/)

Utinerary is a collaborative web application designed to simplify how you plan trips, hangouts, and dates. Instead of juggling through notes, spreadsheets and documents, Utinerary lets you centralize your itinerary in one place and share it with friends for easy planning and collaboration.

<img width="1797" alt="Screenshot 2025-06-08 at 1 24 01 AM" src="https://github.com/user-attachments/assets/6eaffcb6-398d-4c84-9b33-32abaa681fb9" />

## Features

- **Create and manage itineraries** with titles, locations, times, and notes

- **Collaborate** with friends through editing and sharing

- **Public sharable links** for guests to view plans without needing an account

- **Maps** opens locations directly in Google Maps, both on desktop or mobile

- **Live updates** using Supabase Realtime for seamless collaboration (no page refresh needed!)

- **Optional activity details** like notes and time for each activity

## Tech Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, ShadCN UI
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)

## Codebase Structure

```bash
.
├── node_modules             # Project dependencies (not committed)
├── public                   # Static public files
├── src                      # Main source code directory
│   ├── assets               # Static assets like images, icons, and fonts
│   ├── components           # Reusable UI components
│   ├── context              # React context providers (e.g., auth, plan context)
│   ├── pages                # Top-level pages (plan view, home, share view, etc.)
│   ├── utils                # Utility functions and Supabase client setup
│   ├── App.tsx              # Root component that defines application structure
│   ├── index.css            # Global Tailwind or CSS styles
│   ├── main.tsx             # App entry point for rendering React to the DOM
│   └── vite-env.d.ts        # Vite's TypeScript environment definitions
├── .env                     # Environment variables (not committed)
├── .env.example             # Example environment variables
├── .gitignore               # Git ignore rules
├── components.json          # Component configurations for ShadCN
├── .eslint.config.js        # ESLint configuration
├── index.html               # HTML template used by Vite
├── package-lock.json        # Exact version lock file for installed npm packages
├── package.json             # Project metadata, dependencies, and scripts
├── README.md                # Project documentation
├── tsconfig.node.json       # TypeScript configuration for Node.js-specific tooling 
├── vercel.json              # Vercel deployment configuration
└── vite.config.ts           # Vite configuration 

```

## Installation

To run this project locally, you’ll need Node.js installed and a Supabase project set up. Follow the steps below to get started.

### Prerequisites

  - Node.js (v18 or higher recommended)
  - Supabase account and project

### Clone the Repository

```bash
git clone https://github.com/jpham364/Utinerary.git
cd Utinerary
```

### Install Dependencies

```bash
npm install
```

### Set Up Environment Variables

Copy over an .env file based on the .env.example provided:

```bash
cp .env.example .env
```

### Initialize the Database

Before running the app, you'll need to set up your database schema and row-level security (RLS) policies in Supabase.

1. Create / Navigate to your a [Supabase project](https://app.supabase.com/)
2. Navigate to **Table Editor → Create a new table**
3. Create the following tables:
   - `plans`
   - `activities`
   - `plan_collaborators`
4. Enable **Row Level Security (RLS)** for each table
5. Add appropriate **RLS policies** to restrict or allow access  
   > For example, allow users to read/update their own plans and activities.

### Start the App

You can now run the development server:

```bash
npm run dev
```

Visit http://localhost:3000 to view Utinerary in your preferred browser.
