// Import React and useState hook for managing component state
import React, { useState } from "react";

// Import required React Native UI components
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  StatusBar,
} from "react-native";

// SafeAreaView prevents UI from overlapping with device notches
import { SafeAreaView } from "react-native-safe-area-context";

// Custom wrapper component used for consistent screen layout
import ScreenWrapper from "../components/ScreenWrapper";

// Custom header component displaying screen title
import Header from "../components/Header";

// Supabase client used for authentication and database operations
import { supabase } from "../config/supabase";

// Popup component used to show success, warning, or error messages
import SuccessPopup from "../components/SuccessPopup";

// Main component for adding medication details
export default function AddMedicationScreen({ navigation }) {

  // State variables for storing medication information
  const [name, setName] = useState("");       // Medication name
  const [dosage, setDosage] = useState("");   // Medication dosage
  const [times, setTimes] = useState(1);      // Number of times medication is taken per day
  const [saving, setSaving] = useState(false); // Indicates if save operation is in progress

  // States used to control popup messages
  const [showPopup, setShowPopup] = useState(false);
  const [popupText, setPopupText] = useState("");
  const [popupType, setPopupType] = useState("success");

  // Function to save medication details into Supabase database
  const saveMedication = async () => {

    // Validate medication name input
    if (!name.trim()) {
      setPopupText("Medication name is required");
      setPopupType("warning");
      setShowPopup(true);
      return;
    }

    // Enable saving state to prevent multiple button presses
    setSaving(true);

    // Get the currently authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If no user is found, show error message
    if (!user) {
      setPopupText("User not found");
      setPopupType("error");
      setShowPopup(true);
      setSaving(false);
      return;
    }

    // Insert medication record into the "medications" table
    const { error } = await supabase.from("medications").insert({
      user_id: user.id,      // Link medication to logged-in user
      name: name,            // Medication name
      dosage: dosage,        // Medication dosage
      times_per_day: times,  // Number of times medication is taken per day
    });

    // Disable saving state after request
    setSaving(false);

    // Handle error if insertion fails
    if (error) {
      console.log(error);
      setPopupText("Failed to add medication");
      setPopupType("error");
      setShowPopup(true);
      return;
    }

    // Show success popup when medication is added
    setPopupText("Medication added successfully");
    setPopupType("success");
    setShowPopup(true);

    // Navigate back after short delay
    setTimeout(() => navigation.goBack(), 1200);
  };

  return (
    // Screen wrapper providing consistent background layout
    <ScreenWrapper style={{ backgroundColor: "#F6FFF7" }}>
      
      {/* Configure status bar appearance */}
      <StatusBar backgroundColor="#F6FFF7" barStyle="dark-content" />

      {/* Safe area container */}
      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        
        {/* Header displaying screen title */}
        <Header title="Add Medication" />

        {/* Popup component for displaying feedback messages */}
        <SuccessPopup
          visible={showPopup}
          text={popupText}
          type={popupType}
          onHide={() => setShowPopup(false)}
        />

        {/* Main content container */}
        <View style={{ padding: 20 }}>

          {/* Medication icon */}
          <View style={styles.iconBox}>
            <Text style={[styles.icon, { color: "#0FA958" }]}>💊</Text>
          </View>

          {/* Input field for medication name */}
          <TextInput
            style={styles.input}
            placeholder="Medication Name"
            placeholderTextColor="#6B7280"
            value={name}
            onChangeText={setName}
          />

          {/* Input field for medication dosage */}
          <TextInput
            style={styles.input}
            placeholder="Dosage (optional)"
            placeholderTextColor="#6B7280"
            value={dosage}
            onChangeText={setDosage}
          />

          {/* Label for times per day counter */}
          <Text style={styles.label}>Times Per Day</Text>

          {/* Counter control for selecting medication frequency */}
          <View style={styles.counterBox}>

            {/* Decrease button */}
            <TouchableOpacity
              style={styles.countBtn}
              onPress={() => setTimes(Math.max(1, times - 1))}
            >
              <Text style={styles.countText}>-</Text>
            </TouchableOpacity>

            {/* Display current times per day value */}
            <Text style={styles.timesValue}>{times}</Text>

            {/* Increase button */}
            <TouchableOpacity
              style={styles.countBtn}
              onPress={() => setTimes(times + 1)}
            >
              <Text style={styles.countText}>+</Text>
            </TouchableOpacity>

          </View>

          {/* Button to save medication */}
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={saveMedication}
            disabled={saving}
          >
            <Text style={styles.saveText}>
              {saving ? "Saving..." : "Save Medication"}
            </Text>
          </TouchableOpacity>

        </View>
      </SafeAreaView>
    </ScreenWrapper>
  );
}

// Styles used in this screen
const styles = StyleSheet.create({

  // Circular container for medication icon
  iconBox: {
    width: 140,
    height: 140,
    borderRadius: 100,
    backgroundColor: "#eaf7ea",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  // Icon styling
  icon: { fontSize: 45 },

  // Input field styling
  input: {
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 12,
    color: "#1B4332", // ensures typed text is dark in release build
  },

  // Label styling
  label: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 15,
    marginBottom: 8,
    color: "#1B4332",
  },

  // Counter container
  counterBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  // Counter buttons (+ / -)
  countBtn: {
    padding: 14,
    width: 55,
    borderRadius: 12,
    backgroundColor: "#0FA958",
    alignItems: "center",
  },

  // Counter button text
  countText: {
    color: "#ffffff",
    fontSize: 22,
    fontFamily: "Montserrat_700Bold",
  },

  // Displayed number of times per day
  timesValue: {
    marginHorizontal: 25,
    fontSize: 22,
    fontFamily: "Montserrat_700Bold",
    color: "#1B4332",
  },

  // Save button styling
  saveBtn: {
    backgroundColor: "#0FA958",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },

  // Save button text styling
  saveText: {
    color: "#ffffff",
    fontFamily: "Montserrat_700Bold",
    fontSize: 16,
  },
});