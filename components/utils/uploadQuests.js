import { db } from "../../firebaseConfig";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

const sampleQuests = [
  { 
    title: "Run 2km", 
    category: "Cardio Challenge",
    environment: "Outdoor", 
    activityType: "Active", 
    fitnessCategory: "Cardio",
    xp: 200, 
    icon: "running", 
    iconType: "FontAwesome5", 
    status: "active", 
    goal: "2km",
    calories: 200 
  },
  { 
    title: "Cycle 5km", 
    category: "Cardio Challenge", 
    environment: "Outdoor",
    activityType: "Active",
    fitnessCategory: "Cardio",
    xp: 250, 
    icon: "bicycle", 
    iconType: "FontAwesome5", 
    status: "active", 
    goal: "5km",
    calories: 300
  },
  { 
    title: "Walk 5,000 Steps", 
    category: "Cardio Challenge",
    environment: "Outdoor",
    activityType: "Active",
    fitnessCategory: "Cardio", 
    xp: 100, 
    icon: "shoe-prints", 
    iconType: "FontAwesome5", 
    status: "active", 
    goal: "5000",
    calories: 250
  },
  { 
    title: "Jump Rope 100 Times", 
    category: "Cardio Challenge",
    environment: "Any",
    activityType: "Reps",
    fitnessCategory: "Cardio", 
    xp: 180, 
    icon: "dumbbell", 
    iconType: "FontAwesome5", 
    status: "active", 
    goal: "100",
    calories: 60 
  },
  { 
    title: "Do 50 Squats", 
    category: "Strength Challenge",
    environment: "Indoor",
    activityType: "Reps",
    fitnessCategory: "Strength", 
    xp: 150, 
    icon: "dumbbell", 
    iconType: "FontAwesome5", 
    status: "active", 
    goal: "50",
    calories: 16
  },
  { 
    title: "Push-ups 30 Times", 
    category: "Strength Challenge",
    environment: "Indoor",
    activityType: "Reps",
    fitnessCategory: "Strength", 
    xp: 170, 
    icon: "hand-rock", 
    iconType: "FontAwesome5", 
    status: "active", 
    goal: "30",
    calories: 9
  },
  { 
    title: "Plank for 10 Seconds", 
    category: "Core Challenge",
    environment: "Indoor",
    activityType: "Timed",
    fitnessCategory: "Strength", 
    xp: 120, 
    icon: "stopwatch", 
    iconType: "FontAwesome5", 
    status: "active", 
    goal: "0:10",
    calories: 5 
  },
  { 
    title: "Drink 2L of Water", 
    category: "Health Challenge",
    environment: "Indoor",
    activityType: "Wellness",
    fitnessCategory: "Health", 
    xp: 50, 
    icon: "tint", 
    iconType: "FontAwesome5", 
    status: "active", 
    goal: "2L",
    calories: 0 
  },
  { 
    title: "Sleep 8 Hours", 
    category: "Wellness Challenge",
    environment: "Indoor",
    activityType: "Wellness",
    fitnessCategory: "Health", 
    xp: 80, 
    icon: "bed", 
    iconType: "FontAwesome5", 
    status: "active", 
    goal: "8h",
    calories: 0 
  },
  { 
    title: "Meditate for 10 Minutes", 
    category: "Mindfulness Challenge",
    environment: "Indoor",
    activityType: "Timed",
    fitnessCategory: "Mindfulness", 
    xp: 90, 
    icon: "om", 
    iconType: "FontAwesome5", 
    status: "active", 
    goal: "10:00",
    calories: 3 
  },
  {
    title: "Run 5km",
    category: "Cardio Challenge",
    environment: "Outdoor",
    activityType: "Active",
    fitnessCategory: "Cardio",
    xp: 300,
    icon: "running",
    iconType: "FontAwesome5",
    status: "active",
    goal: "5km",
    calories: 500
  },
  {
    title: "Walk 10,000 Steps",
    category: "Cardio Challenge",
    environment: "Outdoor",
    activityType: "Active",
    fitnessCategory: "Cardio",
    xp: 150,
    icon: "shoe-prints",
    iconType: "FontAwesome5",
    status: "active",
    goal: "10000",
    calories: 500
  },
  {
    title: "Do 100 Lunges",
    category: "Strength Challenge",
    environment: "Indoor",
    activityType: "Reps",
    fitnessCategory: "Strength",
    xp: 180,
    icon: "dumbbell",
    iconType: "FontAwesome5",
    status: "active",
    goal: "100",
    calories: 35
  },
  {
    title: "Do 40 Push-ups",
    category: "Strength Challenge",
    environment: "Indoor",
    activityType: "Reps",
    fitnessCategory: "Strength",
    xp: 190,
    icon: "hand-rock",
    iconType: "FontAwesome5",
    status: "active",
    goal: "40",
    calories: 12
  },
  {
    title: "Do 60 Squats",
    category: "Strength Challenge",
    environment: "Indoor",
    activityType: "Reps",
    fitnessCategory: "Strength",
    xp: 160,
    icon: "dumbbell",
    iconType: "FontAwesome5",
    status: "active",
    goal: "60",
    calories: 20
  },
  {
    title: "Breathe Deeply for 5 Minutes",
    category: "Mindfulness Challenge",
    environment: "Indoor",
    activityType: "Timed",
    fitnessCategory: "Mindfulness",
    xp: 60,
    icon: "om",
    iconType: "FontAwesome5",
    status: "active",
    goal: "5:00",
    calories: 2
  },
  {
    title: "Gratitude Meditation for 15 Minutes",
    category: "Mindfulness Challenge",
    environment: "Indoor",
    activityType: "Timed",
    fitnessCategory: "Mindfulness",
    xp: 100,
    icon: "om",
    iconType: "FontAwesome5",
    status: "active",
    goal: "15:00",
    calories: 5
  },
  {
    title: "Plank for 2 Minutes",
    category: "Core Challenge",
    environment: "Indoor",
    activityType: "Timed",
    fitnessCategory: "Strength",
    xp: 150,
    icon: "stopwatch",
    iconType: "FontAwesome5",
    status: "active",
    goal: "2:00",
    calories: 25
  },
  {
    title: "Do 50 Crunches",
    category: "Core Challenge",
    environment: "Indoor",
    activityType: "Reps",
    fitnessCategory: "Strength",
    xp: 130,
    icon: "dumbbell",
    iconType: "FontAwesome5",
    status: "active",
    goal: "50",
    calories: 10
  },
  {
    title: "Stretch for 10 Minutes",
    category: "Health Challenge",
    environment: "Indoor",
    activityType: "Timed",
    fitnessCategory: "Health",
    xp: 70,
    icon: "child",
    iconType: "FontAwesome5",
    status: "active",
    goal: "10:00",
    calories: 15
  },
  {
    title: "Drink 3L of Water",
    category: "Health Challenge",
    environment: "Indoor",
    activityType: "Wellness",
    fitnessCategory: "Health",
    xp: 70,
    icon: "tint",
    iconType: "FontAwesome5",
    status: "active",
    goal: "3L",
    calories: 0
  },
  {
    title: "Sleep 7 Hours",
    category: "Wellness Challenge",
    environment: "Indoor",
    activityType: "Wellness",
    fitnessCategory: "Health",
    xp: 70,
    icon: "bed",
    iconType: "FontAwesome5",
    status: "active",
    goal: "7h",
    calories: 0
  },
  {
    title: "No Sugar for a Day",
    category: "Health Challenge",
    environment: "Any",
    activityType: "Wellness",
    fitnessCategory: "Health",
    xp: 90,
    icon: "ban",
    iconType: "FontAwesome5",
    status: "active",
    goal: "1d",
    calories: 0
  },
  {
    title: "Journal for 10 Minutes",
    category: "Mindfulness Challenge",
    environment: "Indoor",
    activityType: "Timed",
    fitnessCategory: "Mindfulness",
    xp: 80,
    icon: "book",
    iconType: "FontAwesome5",
    status: "active",
    goal: "10:00",
    calories: 4
  },
  {
    title: "Eat 3 Servings of Vegetables",
    category: "Health Challenge",
    environment: "Any",
    activityType: "Wellness",
    fitnessCategory: "Health",
    xp: 60,
    icon: "carrot",
    iconType: "FontAwesome5",
    status: "active",
    goal: "3",
    calories: 45
  },
  {
    title: "Run 3km",
    category: "Cardio Challenge",
    environment: "Outdoor",
    activityType: "Active",
    fitnessCategory: "Cardio",
    xp: 230,
    icon: "running",
    iconType: "FontAwesome5",
    status: "active",
    goal: "3km",
    calories: 300
  },
  {
    title: "Run 4km",
    category: "Cardio Challenge",
    environment: "Outdoor",
    activityType: "Active",
    fitnessCategory: "Cardio",
    xp: 260,
    icon: "running",
    iconType: "FontAwesome5",
    status: "active",
    goal: "4km",
    calories: 400
  },
  {
    title: "Cycle 3.5km",
    category: "Cardio Challenge",
    environment: "Outdoor",
    activityType: "Active",
    fitnessCategory: "Cardio",
    xp: 240,
    icon: "bicycle",
    iconType: "FontAwesome5",
    status: "active",
    goal: "3.5km",
    calories: 210
  },
  {
    title: "Walk 2.5km",
    category: "Cardio Challenge",
    environment: "Outdoor",
    activityType: "Active",
    fitnessCategory: "Cardio",
    xp: 120,
    icon: "shoe-prints",
    iconType: "FontAwesome5",
    status: "active",
    goal: "2.5km",
    calories: 125
  },
  {
    title: "Walk 3.2km",
    category: "Cardio Challenge",
    environment: "Outdoor",
    activityType: "Active",
    fitnessCategory: "Cardio",
    xp: 135,
    icon: "shoe-prints",
    iconType: "FontAwesome5",
    status: "active",
    goal: "3.2km",
    calories: 160
  },
  {
    title: "Cycle 4.8km",
    category: "Cardio Challenge",
    environment: "Outdoor",
    activityType: "Active",
    fitnessCategory: "Cardio",
    xp: 270,
    icon: "bicycle",
    iconType: "FontAwesome5",
    status: "active",
    goal: "4.8km",
    calories: 288
  }
];

export const uploadQuests = async () => {
  try {
    const questsRef = collection(db, "quests");

    for (const quest of sampleQuests) {
      const querySnapshot = await getDocs(query(questsRef, where("title", "==", quest.title)));
      if (!querySnapshot.empty) {
        console.log(`Quest "${quest.title}" already exists. Skipping.`);
        continue;
      }
      await addDoc(questsRef, quest);
      console.log(`Quest "${quest.title}" added successfully!`);
    }
  } catch (error) {
    console.error("Error uploading quests:", error);
  }
};
