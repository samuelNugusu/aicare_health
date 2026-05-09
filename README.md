# AiCare Health Assistant - Local Setup Guide

Follow these steps to run the professional AI Health Assistant on your local machine using Visual Studio Code.

## 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **Firebase Project**: A Firebase project with Firestore and Authentication (Google) enabled.
- **Gemini API Key**: Use the one you provided (`AIzaSyDT...`) or get a new one from [Google AI Studio](https://aistudio.google.com/app/apikey).

## 2. Environment Setup
1. Open the project in Visual Studio Code.
2. Create a file named **.env** (exactly like that) in the root directory.
3. Add your Gemini API key:
```env
GEMINI_API_KEY=AIzaSyDTYnz6Cx5wD8vPPzVTrK5pk9woNl4U7eA
```
*Note: Make sure there are no spaces around the `=` sign. The app is configured to handle this key in the frontend for you.*

## 3. Firebase Configuration
Ensure the `firebase-applet-config.json` file in the root directory contains your Firebase web app configuration. It should look like this:
```json
{
  "apiKey": "...",
  "authDomain": "...",
  "projectId": "...",
  "storageBucket": "...",
  "messagingSenderId": "...",
  "appId": "...",
  "firestoreDatabaseId": "(default)"
}
```
**Important**: Add `http://localhost:3000` to the **Authorized Domains** in your Firebase Console (Authentication > Settings > Authorized Domains).

## 4. Installation
Open the integrated terminal in VS Code (Ctrl+` or Cmd+`) and run:
```bash
npm install
```

## 5. Running the Application
To start the application:
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

## 6. Project Features
- **AI Chat**: Powered by Gemini 3 Flash. Works even without login!
- **Lab Analysis**: Upload images of blood tests for instant insights.
- **Secure Auth**: Sign in with Google to save your history to Firestore.
