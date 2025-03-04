import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "/Users/shivaniuppe/Desktop/Fit-Quest/components/screens/LoginScreen.js";
import SignupScreen from "/Users/shivaniuppe/Desktop/Fit-Quest/components/screens/SignupScreen.js";
import MainHomeScreen from "/Users/shivaniuppe/Desktop/Fit-Quest/components/screens/HomeScreen.js";
import ForgotPasswordScreen from "/Users/shivaniuppe/Desktop/Fit-Quest/components/screens/ForgotPasswordScreen.js";
import ProfileSetupScreen from "/Users/shivaniuppe/Desktop/Fit-Quest/components/screens/ProfileSetupScreen.js";
import RunQuestScreen from "./components/QuestScreens/RunQuestScreen";
import JourneyScreen from "./components/QuestScreens/JourneyScreen";
import { useEffect } from "react";
import { uploadQuests } from "./components/utils/uploadQuests"; 

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    uploadQuests();
  }, []);
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Home" component={MainHomeScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} /> 
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        <Stack.Screen name="RunQuestScreen" component={RunQuestScreen} />
        <Stack.Screen name="JourneyScreen" component={JourneyScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
