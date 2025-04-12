import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image } from "react-native";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignupScreen({ navigation }) {
  // Input states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Handle user registration
  const handleSignup = async () => {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user);

      // Navigate to VerifyEmail screen with email param
      navigation.navigate("VerifyEmail", {
        email: user.email,
      });
    } catch (err) {
      // Handle common signup errors
      switch (err.code) {
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;
        case "auth/email-already-in-use":
          setError("This email is already registered.");
          break;
        case "auth/weak-password":
          setError("Password should be at least 6 characters long.");
          break;
        default:
          setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo and title */}
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

      {/* Error display */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Signup button */}
      <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
        <Text style={styles.signupButtonText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Navigate to Login screen */}
      <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate("Login")}>
        <Text style={styles.loginButtonText}>Login</Text>
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
  signupButton: {
    backgroundColor: "white",
    padding: 15,
    width: "100%",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 15,
  },
  signupButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginButton: {
    borderColor: "white",
    borderWidth: 1,
    padding: 15,
    width: "100%",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 15,
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
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

