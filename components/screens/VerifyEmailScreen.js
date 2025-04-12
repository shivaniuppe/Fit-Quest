import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function VerifyEmailScreen({ route, navigation }) {
  // Get the email passed from SignupScreen
  const { email } = route.params;

  return (
    <View style={styles.container}>
      {/* Message informing the user */}
      <Text style={styles.text}>A verification link has been sent to:</Text>

      {/* Display user's email */}
      <Text style={styles.email}>{email}</Text>

      {/* Instruction message */}
      <Text style={styles.text}>Please check your inbox and verify your email before logging in.</Text>

      {/* Button to go back to Login screen */}
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.loginText}>Go to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

// Styles 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  email: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  loginButton: {
    padding: 15,
    backgroundColor: "white",
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  loginText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
});
