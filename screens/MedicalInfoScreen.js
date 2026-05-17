// Import React hooks for state management and lifecycle control
import React, { useState, useCallback } from "react";

// SafeAreaView ensures UI does not overlap with device notches
import { SafeAreaView } from "react-native-safe-area-context";

// Import required React Native UI components
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StatusBar,
  View,
} from "react-native";

// Custom header component used for displaying screen title
import Header from "../components/Header";

// Custom component used to display label-value information rows
import InfoRow from "../components/InfoRow";

// Hook used to trigger actions when the screen gains focus
import { useFocusEffect } from "@react-navigation/native";

// Supabase client used for authentication and database queries
import { supabase } from "../config/supabase";

// Hook used to retrieve safe area spacing values
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Main screen displaying user's medical information
export default function MedicalInfoScreen({ navigation }) {

  // Get safe area insets to apply proper padding at the bottom
  const insets = useSafeAreaInsets();

  // State to store medical information
  const [medical, setMedical] = useState(null);

  // Controls loading indicator while fetching data
  const [loading, setLoading] = useState(true);

  // Stores number of medications the user has
  const [medCount, setMedCount] = useState(0);

  // Stores user's name
  const [name, setName] = useState("");

  // Function to fetch medical information from the database
  const fetchMedicalInfo = async () => {

    // Get the currently authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If user is not found exit function
    if (!user) return;

    // Fetch user's name from "users" table
    const { data: userData } = await supabase
      .from("users")
      .select("name")
      .eq("id", user.id)
      .single();

    // Store user's name if available
    if (userData?.name) setName(userData.name);

    // Fetch medical information from "medical_info" table
    const { data, error } = await supabase
      .from("medical_info")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Store medical information if successfully retrieved
    if (!error && data) setMedical(data);

    // Count the number of medications the user has
    const { count } = await supabase
      .from("medications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    // Store medication count
    setMedCount(count || 0);

    // Disable loading spinner
    setLoading(false);
  };

  // Refresh medical information whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchMedicalInfo();
    }, [])
  );

  // Show loading spinner while data is being fetched
  if (loading) {
    return (
      <>
        <StatusBar backgroundColor="#F6FFF7" barStyle="dark-content" />

        <SafeAreaView style={styles.container}>
          <Header title="Medical Info" />

          {/* Loading indicator */}
          <ActivityIndicator
            size="large"
            color="#0FA958"
            style={{ marginTop: 50 }}
          />
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <StatusBar backgroundColor="#F6FFF7" barStyle="dark-content" />

      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="Medical Info" />

        {/* Scrollable container for displaying medical information */}
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 20 },
          ]}
        >

          {/* Display user's medical information */}
          <InfoRow label="Name" value={name || "Not Set"} />
          <InfoRow label="Age" value={medical?.age || "Not Set"} />
          <InfoRow
            label="Blood Group"
            value={medical?.blood_group || "Not Set"}
          />
          <InfoRow
            label="Allergies"
            value={medical?.allergies || "Not Set"}
          />
          <InfoRow
            label="Chronic Conditions"
            value={medical?.chronic || "Not Set"}
          />
          <InfoRow
            label="Emergency Contact"
            value={medical?.emergency_contact || "Not Set"}
          />

          {/* Medications section */}
          <View style={styles.sectionCard}>

            {/* Medication info text */}
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Medications</Text>

              <Text style={styles.sectionDesc}>
                {medCount > 0
                  ? `${medCount} active medication${medCount > 1 ? "s" : ""}`
                  : "No medications added yet"}
              </Text>
            </View>

            {/* Button to navigate to medications screen */}
            <TouchableOpacity
              style={styles.sectionBtn}
              onPress={() => navigation.navigate("Medications")}
            >
              <Text style={styles.sectionBtnText}>Open</Text>
            </TouchableOpacity>

          </View>

          {/* Button to navigate to edit medical information screen */}
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate("EditMedicalInfo")}
          >
            <Text style={styles.editText}>Edit Information</Text>
          </TouchableOpacity>

          {/* Warning message reminding user to keep information accurate */}
          <Text style={styles.warning}>
            Please make sure all medical information is accurate and up to date.
            Incorrect details may affect emergency treatment.
          </Text>

        </ScrollView>
      </SafeAreaView>
    </>
  );
}

// Styles used in this screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6FFF7",
  },

  content: {
    padding: 16,
  },

  sectionCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    marginVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  sectionTitle: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 16,
    color: "#0B3D2E",
  },

  sectionDesc: {
    fontFamily: "Montserrat_400Regular",
    color: "#556e58",
    marginTop: 6,
  },

  sectionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#0FA958",
    borderRadius: 10,
    marginLeft: 10,
  },

  sectionBtnText: {
    color: "#ffffff",
    fontFamily: "Montserrat_700Bold",
  },

  editBtn: {
    backgroundColor: "#0FA958",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },

  editText: {
    color: "#ffffff",
    fontFamily: "Montserrat_600SemiBold",
  },

  warning: {
    textAlign: "center",
    fontSize: 11,
    color: "#6b6b6b",
    marginTop: 14,
    marginBottom: 8,
    paddingHorizontal: 10,
    fontFamily: "Montserrat_400Regular",
  },
});