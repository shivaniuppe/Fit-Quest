import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./components/screens/LoginScreen";
import SignupScreen from "./components/screens/SignupScreen";
import MainHomeScreen from "./components/screens/HomeScreen";
import ForgotPasswordScreen from "./components/screens/ForgotPasswordScreen";
import ProfileSetupScreen from "./components/screens/ProfileSetupScreen";
import MapQuestScreen from "./components/QuestScreens/MapQuestScreen";
import JourneyScreen from "./components/QuestScreens/JourneyScreen";
import RepsQuestScreen from "./components/QuestScreens/RepsQuestScreen";
import TimedQuestScreen from "./components/QuestScreens/TimedQuestScreen";
import WellnessQuestScreen from "./components/QuestScreens/WellnessQuestScreen";
import { uploadQuests } from "./components/utils/uploadQuests"; 
import { uploadAchievements } from './components/utils/uploadAchievements';
import VerifyEmailScreen from "./components/screens/VerifyEmailScreen";

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    uploadQuests();
    uploadAchievements();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={MainHomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
        <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MapQuestScreen" component={MapQuestScreen} options={{ headerShown: false }} />
        <Stack.Screen name="JourneyScreen" component={JourneyScreen} options={{ headerShown: false }} />
        <Stack.Screen name="RepsQuestScreen" component={RepsQuestScreen} options={{ headerShown: false }} />
        <Stack.Screen name="TimedQuestScreen" component={TimedQuestScreen} options={{ headerShown: false }} />
        <Stack.Screen name="WellnessQuestScreen" component={WellnessQuestScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
