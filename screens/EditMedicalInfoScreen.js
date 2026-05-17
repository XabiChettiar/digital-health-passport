// Import React hooks for managing state and lifecycle
import React, { useEffect, useState } from "react";

// SafeAreaView prevents UI from overlapping device notches
import { SafeAreaView } from "react-native-safe-area-context";

// Import required React Native components
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from "react-native";

// Custom components used across the project
import ScreenWrapper from "../components/ScreenWrapper";
import Header from "../components/Header";

// Supabase client for authentication and database interaction
import { supabase } from "../config/supabase";

// Popup component used to show success or error messages
import SuccessPopup from "../components/SuccessPopup";

// Screen used to edit the user's medical information
export default function EditMedicalInfoScreen({ navigation }) {

  // Controls loading state while fetching data
  const [loading, setLoading] = useState(true);

  // Controls saving state while updating database
  const [saving, setSaving] = useState(false);

  // State for storing user's name
  const [name, setName] = useState("");

  // State object for storing medical information
  const [medical, setMedical] = useState({
    age: "",
    blood_group: "",
    allergies: "",
    chronic: "",
    emergency_contact: "",
  });

  // States for popup feedback messages
  const [showPopup, setShowPopup] = useState(false);
  const [popupText, setPopupText] = useState("");
  const [popupType, setPopupType] = useState("success");

  // Load user and medical information when screen mounts
  useEffect(() => {

    const loadMedical = async () => {
      console.log("Loading medical information...");

      // Get currently authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log("No authenticated user found");
        setLoading(false);
        return;
      }

      // Fetch user's name from "users" table
      const { data: userData } = await supabase
        .from("users")
        .select("name")
        .eq("id", user.id)
        .single();

      if (userData?.name) setName(userData.name);

      // Fetch medical information from "medical_info" table
      const { data, error } = await supabase
        .from("medical_info")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.log("Failed to load medical info:", error.message);
      }

      // Populate form fields if data exists
      if (data) {
        setMedical({
          age: data.age || "",
          blood_group: data.blood_group || "",
          allergies: data.allergies || "",
          chronic: data.chronic || "",
          emergency_contact: data.emergency_contact || "",
        });
      }

      console.log("Medical information loaded");
      setLoading(false);
    };

    loadMedical();
  }, []);

  // Function to save updated medical information
  const saveChanges = async () => {
    console.log("Save medical info started");
    setSaving(true);

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("Save failed: No authenticated user");
      setSaving(false);
      return;
    }

    // Update user's name in "users" table
    const { error: nameError } = await supabase
      .from("users")
      .update({ name })
      .eq("id", user.id);

    if (nameError) {
      console.log("Name update failed:", nameError.message);
      setPopupText("Failed to update name");
      setPopupType("error");
      setShowPopup(true);
      setSaving(false);
      return;
    }

    // Upsert medical information (insert or update)
    const { error: medicalError } = await supabase
      .from("medical_info")
      .upsert({
        user_id: user.id,
        ...medical,
      });

    setSaving(false);

    // Handle medical info save error
    if (medicalError) {
      console.log("Medical info save failed:", medicalError.message);
      setPopupText("Failed to save medical info");
      setPopupType("error");
      setShowPopup(true);
      return;
    }

    console.log("Medical information updated successfully");

    // Show success popup
    setPopupText("Medical info updated successfully");
    setPopupType("success");
    setShowPopup(true);

    // Navigate back after short delay
    setTimeout(() => {
      console.log("Navigating back");
      navigation.goBack();
    }, 1200);
  };

  // Show loading spinner while data is being fetched
  if (loading) {
    return (
      <ScreenWrapper style={{ backgroundColor: "#F6FFF7" }}>
        <StatusBar backgroundColor="#F6FFF7" barStyle="dark-content" />
        <SafeAreaView style={{ flex: 1 }}>
          <Header title="Edit Medical Info" />
          <ActivityIndicator
            size="large"
            color="#0FA958"
            style={{ marginTop: 50 }}
          />
        </SafeAreaView>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper style={{ backgroundColor: "#F6FFF7" }}>
      <StatusBar backgroundColor="#F6FFF7" barStyle="dark-content" />

      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <Header title="Edit Medical Info" />

        {/* Popup for success or error messages */}
        <SuccessPopup
          visible={showPopup}
          text={popupText}
          type={popupType}
          onHide={() => setShowPopup(false)}
        />

        {/* Main form card */}
        <View style={styles.card}>

          {/* Name input */}
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            placeholder="Enter your name"
            placeholderTextColor="#6B7280"
            onChangeText={setName}
          />

          {/* Medical information inputs */}
          {renderInput("Age", "age", "numeric")}
          {renderInput("Blood Group", "blood_group")}
          {renderInput("Allergies", "allergies")}
          {renderInput("Chronic Conditions", "chronic")}
          {renderInput("Emergency Contact", "emergency_contact")}

          {/* Save button */}
          <TouchableOpacity style={styles.saveBtn} onPress={saveChanges}>
            <Text style={styles.saveText}>
              {saving ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>

          {/* Warning note for users */}
          <Text style={styles.warning}>
            Please ensure the medical information you provide is accurate.
            Incorrect details may affect emergency treatment.
          </Text>

        </View>
      </SafeAreaView>
    </ScreenWrapper>
  );

  // Reusable function for rendering input fields
  function renderInput(label, key, keyboard) {
    return (
      <>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={styles.input}
          value={medical[key]}
          placeholder={`Enter ${label}`}
          placeholderTextColor="#6B7280"
          keyboardType={keyboard || "default"}
          onChangeText={(text) =>
            setMedical({ ...medical, [key]: text })
          }
        />
      </>
    );
  }
}

// Styles for this screen
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 18,
    margin: 16,
    elevation: 6,
  },

  label: {
    fontFamily: "Montserrat_600SemiBold",
    marginTop: 10,
    color: "#0B3D2E",
  },

  input: {
    backgroundColor: "#F4F8F5",
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
    color: "#1B4332",
  },

  saveBtn: {
    backgroundColor: "#0FA958",
    padding: 12,
    borderRadius: 10,
    marginTop: 18,
    alignItems: "center",
  },

  saveText: {
    color: "#ffffff",
    fontFamily: "Montserrat_700Bold",
    fontSize: 16,
  },

  warning: {
    textAlign: "center",
    fontSize: 11,
    color: "#6b6b6b",
    marginTop: 14,
    fontFamily: "Montserrat_400Regular",
  },
});