import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      await AsyncStorage.removeItem("stepsToday");
      await AsyncStorage.removeItem("baseStepCount");
      navigation.navigate("Home");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={require("../../assets/fit-quest-logo.png")} style={styles.logo} />
        <Text style={styles.title}>FitQuest</Text>
      </View>

      <TextInput 
        style={styles.input} 
        placeholder="Email" 
        placeholderTextColor="#aaa" 
        value={email} 
        onChangeText={setEmail} 
      />

      <TextInput 
        style={styles.input} 
        placeholder="Password" 
        placeholderTextColor="#aaa" 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry 
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signupButton} onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.signupButtonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
        <Text style={styles.forgotPassword}>Forgot password?</Text>
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

