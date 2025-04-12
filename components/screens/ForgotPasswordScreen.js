import React, { useState } from "react";
import { TextInput, TouchableOpacity, Text, StyleSheet } from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");        // User's email input
  const [message, setMessage] = useState("");    // Success or error message

  // Trigger Firebase password reset email
  const handleForgotPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Check your inbox.");
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>

      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
      />

      {/* Display feedback message */}
      {message ? <Text style={styles.messageText}>{message}</Text> : null}

      {/* Send Reset Link */}
      <TouchableOpacity style={styles.resetButton} onPress={handleForgotPassword}>
        <Text style={styles.resetButtonText}>Send Reset Link</Text>
      </TouchableOpacity>

      {/* Navigate back to Login */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("Login")}>
        <Text style={styles.backButtonText}>Back to Login</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    backgroundColor: "#1E1E1E",
    color: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  resetButton: {
    backgroundColor: "white",
    padding: 15,
    width: "100%",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 15,
  },
  resetButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    borderColor: "white",
    borderWidth: 1,
    padding: 15,
    width: "100%",
    alignItems: "center",
    borderRadius: 8,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  messageText: {
    color: "white",
    marginBottom: 10,
    textAlign: "center",
  },
});
