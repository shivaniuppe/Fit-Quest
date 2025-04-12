import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function VerifyEmailScreen({ route, navigation }) {
  const { email } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>A verification link has been sent to:</Text>
      <Text style={styles.email}>{email}</Text>
      <Text style={styles.text}>Please check your inbox and verify your email before logging in.</Text>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.loginText}>Go to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

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
