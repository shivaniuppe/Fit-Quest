import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, getDoc } from "firebase/firestore";

export default function LoginScreen({ navigation }) {
  // State to manage user input and errors
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Login handler
  const handleLogin = async () => {
    try {
      // Sign in the user using Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if email is verified
      if (!user.emailVerified) {
        setError("Please verify your email before logging in.");
        return;
      }

      // Check if user document exists in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // Navigate to profile setup screen if no user document exists
        navigation.navigate("ProfileSetup", {
          userId: user.uid,
          email: user.email,
        });
      } else {
        // Clear cached step data
        await AsyncStorage.removeItem("stepsToday");
        await AsyncStorage.removeItem("baseStepCount");

        // Navigate to Home screen
        navigation.navigate("Home");
      }
    } catch (err) {
      // Handle and display common Firebase auth errors
      switch (err.code) {
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setError("Incorrect email or password.");
          break;
        case "auth/email-already-in-use":
          setError("This email is already registered.");
          break;
        case "auth/weak-password":
          setError("Password should be at least 6 characters.");
          break;
        default:
          setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* App header with logo and title */}
      <View style={styles.header}>
        <Image source={require("../../assets/fit-quest-logo.png")} style={styles.logo} />
        <Text style={styles.title}>FitQuest</Text>
      </View>

      {/* Email input */}
      <TextInput 
        style={styles.input} 
        placeholder="Email" 
        placeholderTextColor="#aaa" 
        value={email} 
        onChangeText={setEmail} 
      />

      {/* Password input */}
      <TextInput 
        style={styles.input} 
        placeholder="Password" 
        placeholderTextColor="#aaa" 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry 
      />

      {/* Error message display */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Login button */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      {/* Navigate to Sign Up screen */}
      <TouchableOpacity style={styles.signupButton} onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.signupButtonText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Navigate to Forgot Password screen */}
      <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
        <Text style={styles.forgotPassword}>Forgot password?</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  input: {
    width: "100%",
    backgroundColor: "#1E1E1E",
    color: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  loginButton: {
    backgroundColor: "white",
    padding: 15,
    width: "100%",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 10,
  },
  loginButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
  signupButton: {
    borderColor: "white",
    borderWidth: 1,
    padding: 15,
    width: "100%",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 15,
  },
  signupButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  forgotPassword: {
    color: "#aaa",
    marginBottom: 20,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 28,
    height: 28,
    marginRight: 8,
  },
  title: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
  },
});
