# TeaCrack Café

This project now includes a production-ready review system backed by Firebase Firestore.

## Review system setup

1. Create a Firebase project at https://console.firebase.google.com.
2. Enable Firestore Database.
3. Create a web app and copy the config values into the Vite environment variables.
4. Copy .env.example to .env and fill in the values.
5. Deploy the Firestore rules from firestore.rules.

## Required environment variables

- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID

## Vercel deployment

1. Push the repository to GitHub.
2. In Vercel, create a new project from the repository.
3. Add the same six Firebase values in Project Settings > Environment Variables.
4. Deploy.

## Firestore rules

The public review collection uses the rules in firestore.rules to allow reads for everyone and writes with validation.

## Local development

- npm install
- cp .env.example .env
- npm run dev
