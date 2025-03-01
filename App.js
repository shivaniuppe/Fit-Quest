import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "/Users/shivaniuppe/Desktop/FitQuest/components/screens/LoginScreen.js";
import SignupScreen from "/Users/shivaniuppe/Desktop/FitQuest/components/screens/SignupScreen.js";
import MainHomeScreen from "/Users/shivaniuppe/Desktop/FitQuest/components/screens/HomeScreen.js";
import ForgotPasswordScreen from "/Users/shivaniuppe/Desktop/FitQuest/components/screens/ForgotPasswordScreen.js"; // Import Forgot Password Screen
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
