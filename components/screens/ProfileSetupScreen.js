import React, { useState, useEffect } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image, ActivityIndicator } from "react-native";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { FontAwesome } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileSetupScreen = ({ route, navigation }) => {
  const { userId, email } = route.params;
  const [name, setName] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (mediaStatus !== 'granted' || cameraStatus !== 'granted') {
        setError("Camera and gallery permissions are required");
      }
    })();
  }, []);

  const processAndCompressImage = async (uri) => {
    try {
      // First resize the image
      const resizedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 500, height: 500 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Then convert to Base64
      const base64 = await FileSystem.readAsStringAsync(resizedImage.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Check size (Firestore document limit is 1MB)
      const sizeInBytes = (base64.length * 3) / 4; // Approximate byte size
      if (sizeInBytes > 900000) { // ~0.9MB safety margin
        throw new Error("Image is too large after compression");
      }

      return base64;
    } catch (error) {
      console.error("Image processing error:", error);
      throw error;
    }
  };

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setProfilePic(result.assets[0].uri);
      }
    } catch (error) {
      setError("Error selecting image");
      console.error("Image picker error:", error);
    }
  };

  const takePhoto = async () => {
    try {
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setProfilePic(result.assets[0].uri);
      }
    } catch (error) {
      setError("Error taking photo");
      console.error("Camera error:", error);
    }
  };

  const handleProfileSetup = async () => {
    if (!name) {
      setError("Please enter your name");
      return;
    }
    if (!profilePic) {
      setError("Please add a profile picture");
      return;
    }

    setUploading(true);
    setError("");

    try {
      // Process and compress the image
      const base64Image = await processAndCompressImage(profilePic);
      
      // Save to Firestore
      await setDoc(doc(db, "users", userId), {
        userId,
        username: name,
        email,
        profilePicBase64: `data:image/jpeg;base64,${base64Image}`,
        bio,
        title: "Beginner",
        xp: 0,
        xpGoal: 1000,
        level: 1,
        stepsToday: 0,
        totalSteps: 0,
        quests: 0,
        streak: 1,
        caloriesBurned: 0,
        achievements: {},
        questsThisWeek: 0,
        activeMinutesToday: 0,
        activeDaysStreak: 0,
        cyclingDistance: 0,      
        runningDistance: 0,
        lastActiveDay: new Date().toISOString().split("T")[0],
        lastQuestReset: new Date().toISOString().split('T')[0],
        loggedDays: 0,
        lastLoggedDay: "",
        profileComplete: name.trim() !== "" && profilePic && bio.trim() !== "",
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      }, { merge: true });

      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });      
      await AsyncStorage.removeItem("stepsToday");
      await AsyncStorage.removeItem("baseStepCount");

    } catch (err) {
      console.error("Profile setup error:", err);
      setError(err?.message?.toString() || "Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>FitQuest</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor="#aaa"
        value={name}
        onChangeText={setName}
      />

      <View style={styles.profilePicContainer}>
        {profilePic ? (
          <Image source={{ uri: profilePic }} style={styles.profilePic} />
        ) : (
          <FontAwesome name="user-circle" size={100} color="#aaa" />
        )}
        <View style={styles.profilePicButtons}>
          <TouchableOpacity 
            style={styles.profilePicButton} 
            onPress={pickImage}
            disabled={uploading}
          >
            <Text style={styles.profilePicButtonText}>Choose from Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.profilePicButton} 
            onPress={takePhoto}
            disabled={uploading}
          >
            <Text style={styles.profilePicButtonText}>Take a Photo</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Bio (Optional)"
        placeholderTextColor="#aaa"
        value={bio}
        onChangeText={setBio}
        multiline
      />

      <TouchableOpacity 
        style={styles.saveButton} 
        onPress={handleProfileSetup}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="black" />
        ) : (
          <Text style={styles.saveButtonText}>Save Profile</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
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