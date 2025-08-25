# Journal App 

Team **CTRL_ALT_ELITE TEAM**

# Table of Contents

- [CTL_ALT_ELITE TEAM](#CTL-ALT-ELITE-TEAM)
- [Table of Contents](#table-of-contents)
  - [About the team](#about-the-team)
  - [About our project "Journaling App"](#about-our-project)
  - [User Guide](#user-guide)
  - [Watch the video Walkthrough](#watch-the-video-walkthrough)
  - [Tutorial](#tutorial)
  - [License](#license)

# About the team

We are a team of 2 members:

[Journal App Monorepo](https://github.com/brysonwaisi/journal-app)

<img src="https://avatars.githubusercontent.com/u/39270063?v=4"
     width="100"
     height="100">
<img src="https://avatars.githubusercontent.com/u/47030219?v=4" width="100px" height="100px">

[Bryson Nyamwange](https://github.com/brysonwaisi) [Clive Limo](https://github.com/clive-limo)

# About our project 

[Journal APP](https://journal-app-web-xi.vercel.app/) <br />
This app helps you capture your thoughts and learn from them. Write, talk, or draw. Keep your entries in one place. Build a steady habit and see your mood over time.

This project is part of **Co-Creating with GPT-5** Hackathon sponsored by [lablab.ai](https://lablab.ai/) 

### Frontend Development – Vue

Stack: Vue 3 + Vite + Pinia + Vue Router + Tailwind

Purpose: Create, view, and filter entries. Run AI analysis. Chat with the AI guide.

### Backend Development – Nest & PostgreSQL

Stack: NestJS + Prisma + PostgreSQL

Purpose: Persist journals, entries, media, AI analyses, and reflection messages. Expose REST endpoints for the frontend.

### AI Integration with GPT-5

Goal: Analyze an entry and save a normalized result. Guide short reflections and save both sides of the chat.

# User Guide

## Step 1: Access the app & register

Open the app at **`https://journal-app-web-xi.vercel.app`**.

You’ll land on your **Get Started** view.

To create an account, click **Get Started** in the center:

- Continue with **Google**.

Already have an account? Click **LOGIN** in the top right corner and:

- Continue with **Google**.

## Step 2: Create a journal and add an entry

1. Go to **Journals** and click **Write Your First journal**.
2. Choose the entry type: **Write**, **Talk**, or **Draw**.
3. Open the journal and enter journal entry under **New Journal entry**.
   - For **Talk**, allow microphone access and record your note.
   - For **Draw** or images, upload a picture if you like.

4. Write your **body**, and Start Journaling.

## Step 3: Analyze and reflect with AI

- Open Reflection Tab by clicking **Start Reflection**.
  The AI will help you explore your thougths, focusing on:
  - mood
  - themes and insights
  - patterns
  - suggestions

- Start a short chat.
  - Type your message.
  - The AI replies with 2–3 sentences and offers quick prompts.
  - Your messages and the AI replies save to the entry.

## Step 4: Review your Analysis and Progress

- See your  **daily mood points** on the dashboard.
- Filter entries by **tags**, **type** (Write, Talk, Draw), or **date**.
- Open any entry to view its media, analysis, and reflection history.

## Step 5: Manage your account

- Go to **Account (right top corner)**   to manage your account.
- You can delete entries or an entire journal at any time.

## Step 6: Tour the app

- Explore the app and tour each sections to see various aspects and how AI reflection works.

# Watch the video Walkthrough

App Walkthrough https://www.loom.com/share/0f81ee1fa7b14727a65d86fff43a217e?sid=cb1b541d-f9ff-4bd0-81c5-c44a2c38ebca

# License

See the [LICENSE](https://github.com/brysonwaisi/journal-app/blob/main/LICENSE) file for license rights and limitations (Apache).

# Tutorial

## Install Dependencies

```
npm install
```

## PostreSQL DB

Connect to PostgreSQL and run:

```
npm run prisma:migrate
```

## Build

```
npm run build
```

## Run in Development Mode

```
npm run dev 
```
