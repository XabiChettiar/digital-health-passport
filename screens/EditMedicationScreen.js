// Import React hooks for managing state and lifecycle
import React, { useState, useEffect } from "react";

// Import required React Native components
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  StatusBar,
} from "react-native";

// SafeAreaView prevents UI overlap with device notches
import { SafeAreaView } from "react-native-safe-area-context";

// Custom layout wrapper used across screens
import ScreenWrapper from "../components/ScreenWrapper";

// Header component displaying screen title
import Header from "../components/Header";

// Supabase client used for authentication and database queries
import { supabase } from "../config/supabase";

// Popup component used to show success, warning, or error messages
import SuccessPopup from "../components/SuccessPopup";

// Screen used to edit an existing medication
export default function EditMedicationScreen({ route, navigation }) {

  // Get medication ID passed from previous screen through navigation
  const medicationId = route?.params?.medicationId || null;

  // State variables for medication fields
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [times, setTimes] = useState(1);

  // Controls loading spinner while fetching medication data
  const [loading, setLoading] = useState(true);

  // Controls saving state when updating medication
  const [saving, setSaving] = useState(false);

  // Popup message states
  const [showPopup, setShowPopup] = useState(false);
  const [popupText, setPopupText] = useState("");
  const [popupType, setPopupType] = useState("success");

  // Function to fetch medication details from the database
  const fetchMedication = async () => {

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If user is not found show error and navigate back
    if (!user) {
      setPopupText("User not found");
      setPopupType("error");
      setShowPopup(true);
      navigation.goBack();
      return;
    }

    // Fetch medication belonging to the logged-in user
    const { data, error } = await supabase
      .from("medications")
      .select("*")
      .eq("id", medicationId)
      .eq("user_id", user.id)
      .single();

    // Handle error if medication cannot be fetched
    if (error || !data) {
      setPopupText("Failed to load medication");
      setPopupType("error");
      setShowPopup(true);
      navigation.goBack();
      return;
    }

    // Populate form fields with medication data
    setName(data.name);
    setDosage(data.dosage || "");
    setTimes(data.times_per_day || 1);

    // Stop loading spinner
    setLoading(false);
  };

  // Load medication data when screen is opened
  useEffect(() => {
    if (!medicationId) {
      setLoading(false);
      return;
    }

    fetchMedication();
  }, [medicationId]);

  // Function to update medication information in the database
  const updateMedication = async () => {

    // Validate medication name field
    if (!name.trim()) {
      setPopupText("Medication name is required");
      setPopupType("warning");
      setShowPopup(true);
      return;
    }

    // Enable saving state to prevent multiple presses
    setSaving(true);

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Update medication record in Supabase
    const { error } = await supabase
      .from("medications")
      .update({
        name,
        dosage,
        times_per_day: times,
      })
      .eq("id", medicationId)
      .eq("user_id", user.id);

    // Disable saving state
    setSaving(false);

    // Handle update error
    if (error) {
      setPopupText("Failed to update medication");
      setPopupType("error");
      setShowPopup(true);
      return;
    }

    // Show success popup
    setPopupText("Medication updated successfully");
    setPopupType("success");
    setShowPopup(true);

    // Navigate back after short delay
    setTimeout(() => navigation.goBack(), 1200);
  };

  // If medication ID is missing show message
  if (!medicationId)
    return (
      <ScreenWrapper style={{ backgroundColor: "#F6FFF7" }}>
        <SafeAreaView style={{ flex: 1 }}>
          <Header title="Edit Medication" />
          <View style={{ marginTop: 50, alignItems: "center" }}>
            <Text style={{ color: "#1B4332" }}>
              No medication selected.
            </Text>
          </View>
        </SafeAreaView>
      </ScreenWrapper>
    );

  // Show loading spinner while medication data is being fetched
  if (loading)
    return (
      <ScreenWrapper style={{ backgroundColor: "#F6FFF7" }}>
        <StatusBar backgroundColor="#F6FFF7" barStyle="dark-content" />
        <SafeAreaView style={{ flex: 1 }}>
          <Header title="Edit Medication" />
          <ActivityIndicator
            size="large"
            color="#0FA958"
            style={{ marginTop: 50 }}
          />
        </SafeAreaView>
      </ScreenWrapper>
    );

  return (
    <ScreenWrapper style={{ backgroundColor: "#F6FFF7" }}>
      <StatusBar backgroundColor="#F6FFF7" barStyle="dark-content" />

      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <Header title="Edit Medication" />

        {/* Popup for feedback messages */}
        <SuccessPopup
          visible={showPopup}
          text={popupText}
          type={popupType}
          onHide={() => setShowPopup(false)}
        />

        <View style={{ padding: 20 }}>

          {/* Medication icon display */}
          <View style={styles.iconBox}>
            <Text style={[styles.icon, { color: "#0FA958" }]}>💊</Text>
          </View>

          {/* Medication name input */}
          <TextInput
            style={styles.input}
            placeholder="Medication Name"
            placeholderTextColor="#6B7280"
            value={name}
            onChangeText={setName}
          />

          {/* Dosage input */}
          <TextInput
            style={styles.input}
            placeholder="Dosage (optional)"
            placeholderTextColor="#6B7280"
            value={dosage}
            onChangeText={setDosage}
          />

          {/* Label for frequency counter */}
          <Text style={styles.label}>Times Per Day</Text>

          {/* Counter controls for medication frequency */}
          <View style={styles.counterBox}>
            <TouchableOpacity
              style={styles.countBtn}
              onPress={() => setTimes(Math.max(1, times - 1))}
            >
              <Text style={styles.countText}>-</Text>
            </TouchableOpacity>

            <Text style={styles.timesValue}>{times}</Text>

            <TouchableOpacity
              style={styles.countBtn}
              onPress={() => setTimes(times + 1)}
            >
              <Text style={styles.countText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Save changes button */}
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={updateMedication}
            disabled={saving}
          >
            <Text style={styles.saveText}>
              {saving ? "Saving..." : "Save Changes"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ScreenWrapper>
  );
}

// Styles used in this screen
const styles = StyleSheet.create({
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

  icon: {
    fontSize: 45,
  },

  input: {
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 12,
    color: "#1B4332", // ensures typed text is dark
  },

  label: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 15,
    marginBottom: 8,
    color: "#1B4332",
  },

  counterBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  countBtn: {
    padding: 14,
    width: 55,
    borderRadius: 12,
    backgroundColor: "#0FA958",
    alignItems: "center",
  },

  countText: {
    color: "#ffffff",
    fontSize: 22,
    fontFamily: "Montserrat_700Bold",
  },

  timesValue: {
    marginHorizontal: 25,
    fontSize: 22,
    fontFamily: "Montserrat_700Bold",
    color: "#1B4332",
  },

  saveBtn: {
    backgroundColor: "#0FA958",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },

  saveText: {
    color: "#ffffff",
    fontFamily: "Montserrat_700Bold",
    fontSize: 16,
  },
});