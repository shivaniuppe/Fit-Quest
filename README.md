# FitQuest 🏃‍♀️🎮  
A gamified fitness tracking app built with React Native, Firebase, and Expo.

## 📱 Overview

**FitQuest** turns everyday fitness activities into an engaging game. Users complete real-world quests like walking, running, or wellness challenges to earn XP, level up, unlock achievements, and compete on a global leaderboard. The app combines motion sensors, GPS tracking, weather-based quest suggestions, and a dynamic UI to keep users motivated and active.

---

## 🚀 Features

- ✅ **Firebase Authentication** – Secure login, signup, and password recovery
- 📸 **Profile Setup** – Name, bio, and profile picture customization
- 👟 **Step Tracking** – Real-time step counting with automatic daily reset
- 🗺️ **GPS-Based Quests** – Live route tracking using Google Maps APIs
- 🌦️ **Weather-Driven Suggestions** – Indoor/outdoor quests based on current weather
- 🧘‍♀️ **Quest Types** – Running, timed, wellness, reps, and journey
- 🏆 **Achievements System** – Dynamic badge unlocking based on user activity
- 📊 **Leaderboard** – Real-time global XP rankings with top 3 crown indicator
- 🎉 **UI/UX Enhancements** – Animations, confetti, XP bars, and intuitive navigation

---

## 🧰 Tech Stack

| Layer            | Technology                         |
|------------------|-------------------------------------|
| Frontend         | React Native (Expo)                |
| Authentication   | Firebase Authentication            |
| Backend / DB     | Firebase Firestore                 |
| APIs             | Expo Pedometer, Google Maps API, Weather API |
| Storage          | AsyncStorage (local), Firestore (cloud) |
| UI Components    | React Native Paper, Expo Camera    |

---

## 🔧 Setup Instructions

1. **Clone this repo**
   ```bash
   git clone https://github.com/shivaniuppe/Fit-Quest.git
   cd fitquest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Add your secrets**
   - Create a `secrets.js` file at the root:
     ```js
     export const GOOGLE_API_KEY = "your_google_maps_api_key";
     export const WEATHER_API_KEY = "your_weather_api_key";
     ```

4. **Start the app**
   ```bash
   npx expo start
   ```
   - Scan the QR code with Expo Go on your phone to run the app.

---

## 📂 Project Structure

```
/components         # Reusable components (e.g., QuestCard, AbandonModal)
/screens            # App screens (Home, Profile, Quests, etc.)
/utils              # Utility functions (user stats, API calls)
/assets             # Images and fonts
firebaseConfig.js   # Firebase setup
App.js              # Root app file
secrets.js          # API keys (not committed)
```

---

## 🧪 Notable Implementations

- `watchPositionAsync()` for live GPS tracking
- Real-time Firestore listeners for quests and leaderboard
- Dynamic achievements system triggered by user activity
- Midnight reset logic for `stepsToday` using AsyncStorage + Firestore
- Weather API integration for quest filtering

---

## 💡 Future Improvements

- Add social features (friend challenges, share progress)
- Include weekly/monthly analytics charts
- Sync with Google Fit / Apple Health
- Offline mode for quest progress

---

## 🧑‍💻 Author

**Shivani Uppe**  
Master of Applied Computer Science  
Dalhousie University  
Course: CSCI 5708 – Mobile Computing

---

## 📜 License

This project is for academic and demonstration purposes only.
