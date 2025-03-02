import React, { useState, useEffect } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image } from "react-native";
import { doc, setDoc } from "firebase/firestore";
import { db } from "/Users/shivaniuppe/Desktop/Fit-Quest/firebaseConfig.js";
import { FontAwesome } from "@expo/vector-icons";

import * as ImagePicker from "expo-image-picker";

const ProfileSetupScreen = ({ route, navigation }) => {
  const { userId, email } = route.params;
  const [name, setName] = useState("");
  const [profilePic, setProfilePic] = useState(null); // Store the image URI
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");

  // Request camera and gallery permissions
  useEffect(() => {
    (async () => {
      // Request media library permissions
      const mediaLibraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (mediaLibraryStatus.status !== "granted") {
        alert("Sorry, we need media library permissions to make this work!");
      }
  
      // Request camera permissions
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus.status !== "granted") {
        alert("Sorry, we need camera permissions to make this work!");
      }
    })();
  }, []);

  // Function to pick an image from the gallery
  const pickImage = async () => {
    console.log("Opening image picker...");
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio
      quality: 1, // Highest quality
    });
  
    console.log("Image picker result:", result);
  
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImageUri = result.assets[0].uri;
      setProfilePic(selectedImageUri); // Set the image URI
      console.log("Selected image URI:", selectedImageUri);
    } else {
      console.log("Image selection was canceled or no image was selected.");
    }
  };
  
  const takePhoto = async () => {
    console.log("Opening camera...");
  
    try {
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio
        quality: 1, // Highest quality
      });
  
      console.log("Camera result:", result);
  
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const capturedImageUri = result.assets[0].uri;
        setProfilePic(capturedImageUri); // Set the image URI
        console.log("Captured image URI:", capturedImageUri);
      } else {
        console.log("Camera was canceled or no photo was taken.");
      }
    } catch (error) {
      console.error("Error opening camera:", error);
    }
  };

  const handleProfileSetup = async () => {
    if (!name || !profilePic || !bio) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      // Upload the image to Firebase Storage (optional)
      // You can use `expo-file-system` to upload the image to Firebase Storage
      // and get a download URL to store in Firestore.
      console.log("Updating profile...");
      console.log("User ID:", userId);
      console.log("Name:", name);
      console.log("Email:", email);
      console.log("Profile Picture:", profilePic);
      console.log("Bio:", bio);

      // For now, we'll store the local image URI in Firestore
      await setDoc(doc(db, "users", userId), {
        userId,
        name,
        email,
        profilePic, // Store the local image URI
        bio,
        title: "Beginner",
        xp: 0,
        xpGoal: 1000,
        level: 1,
        completedQuests: [],
        acceptedQuests: [],
        totalSteps: 0,
        workouts: 0,
        streak: 0,
        caloriesBurned: 0,
        achievements: [],
        friends: [],
        friendRequests: [],
        blockedUsers: [],
        notificationsEnabled: true,
        privacySettings: {
          showOnLeaderboard: true,
        },
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      });

      // Navigate to Home screen
      navigation.navigate("Home");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* App Logo */}
      <Text style={styles.title}>FitQuest</Text>

      {/* Name Input */}
      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor="#aaa"
        value={name}
        onChangeText={setName}
      />

      {/* Profile Picture Upload */}
      <View style={styles.profilePicContainer}>
        {profilePic ? (
          <Image source={{ uri: profilePic }} style={styles.profilePic} />
        ) : (
          <FontAwesome name="user-circle" size={100} color="#aaa" />
        )}
        <View style={styles.profilePicButtons}>
          <TouchableOpacity style={styles.profilePicButton} onPress={pickImage}>
            <Text style={styles.profilePicButtonText}>Choose from Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profilePicButton} onPress={takePhoto}>
            <Text style={styles.profilePicButtonText}>Take a Photo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bio Input */}
      <TextInput
        style={styles.input}
        placeholder="Bio"
        placeholderTextColor="#aaa"
        value={bio}
        onChangeText={setBio}
        multiline
      />

      {/* Error Message */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Save Profile Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleProfileSetup}>
        <Text style={styles.saveButtonText}>Save Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
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
  profilePicContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  profilePicButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  profilePicButton: {
    backgroundColor: "#1E1E1E",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  profilePicButtonText: {
    color: "white",
    fontSize: 12,
  },
  saveButton: {
    backgroundColor: "white",
    padding: 15,
    width: "100%",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 15,
  },
  saveButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
});

export default ProfileSetupScreen;