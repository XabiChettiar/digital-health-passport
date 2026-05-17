// Import React hooks for managing state and lifecycle
import React, { useState, useCallback } from "react";

// Import React Native UI components
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  StatusBar,
} from "react-native";

// SafeAreaView prevents UI overlap with device notches
import { SafeAreaView } from "react-native-safe-area-context";

// Hook used to run code whenever the screen comes into focus
import { useFocusEffect } from "@react-navigation/native";

// Custom header component for screen titles
import Header from "../components/Header";

// Wrapper component used across screens for consistent layout
import ScreenWrapper from "../components/ScreenWrapper";

// Supabase client used for authentication and database operations
import { supabase } from "../config/supabase";

// Popup component used for success/error messages
import SuccessPopup from "../components/SuccessPopup";

// Confirmation dialog used before deleting medication
import ConfirmDialog from "../components/ConfirmDialog";

// Screen displaying all medications added by the user
export default function MedicationsScreen({ navigation }) {

  // State to store authenticated user
  const [user, setUser] = useState(null);

  // Controls loading indicator while medications are fetched
  const [loading, setLoading] = useState(true);

  // Stores medications list
  const [medications, setMedications] = useState([]);

  // Popup message states
  const [showPopup, setShowPopup] = useState(false);
  const [popupText, setPopupText] = useState("");
  const [popupType, setPopupType] = useState("success");

  // Confirmation dialog states
  const [showDialog, setShowDialog] = useState(false);
  const [selectedMed, setSelectedMed] = useState(null);

  // Function to get the currently authenticated user
  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data?.user) setUser(data.user);
  };

  // Function to fetch medications belonging to the logged-in user
  const fetchMedications = async (userId) => {
    const { data, error } = await supabase
      .from("medications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    // Store medications if query succeeds
    if (!error) setMedications(data || []);

    // Disable loading spinner
    setLoading(false);
  };

  // Runs when the screen gains focus to initialize data
  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        setLoading(true);
        await getUser();
      };
      init();
    }, [])
  );

  // Fetch medications once the user is available
  useFocusEffect(
    useCallback(() => {
      if (user) fetchMedications(user.id);
    }, [user])
  );

  // Open confirmation dialog before deleting medication
  const deleteMedication = (item) => {
    setSelectedMed(item);
    setShowDialog(true);
  };

  // Confirm and perform medication deletion
  const confirmDelete = async (item) => {
    try {
      // Delete medication record from Supabase
      await supabase.from("medications").delete().eq("id", item.id);

      // Show success popup
      setPopupText("Medication deleted successfully");
      setPopupType("success");
      setShowPopup(true);

      // Close confirmation dialog
      setShowDialog(false);

      // Refresh medication list
      fetchMedications(user.id);
    } catch (e) {
      // Show error popup if deletion fails
      setPopupText("Failed to delete medication");
      setPopupType("error");
      setShowPopup(true);
      setShowDialog(false);
    }
  };

  // Show loading spinner while medications are being fetched
  if (loading) {
    return (
      <ScreenWrapper style={{ backgroundColor: "#F6FFF7" }}>
        <StatusBar backgroundColor="#F6FFF7" barStyle="dark-content" />
        <SafeAreaView style={{ flex: 1 }}>
          <Header title="Medications" />
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
        <Header title="Medications" />

        {/* Confirmation dialog before deleting medication */}
        <ConfirmDialog
          visible={showDialog}
          title="Delete Medication"
          message={`Are you sure you want to delete "${selectedMed?.name}"?`}
          onCancel={() => setShowDialog(false)}
          onConfirm={() => confirmDelete(selectedMed)}
        />

        {/* Popup feedback messages */}
        <SuccessPopup
          visible={showPopup}
          text={popupText}
          type={popupType}
          onHide={() => setShowPopup(false)}
        />

        {/* Button to add a new medication */}
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate("AddMedication")}
        >
          <Text style={styles.addText}>+ Add Medication</Text>
        </TouchableOpacity>

        {/* List displaying medications */}
        <FlatList
          data={medications}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.card}>

              {/* Medication details */}
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>💊 {item.name}</Text>

                {/* Show dosage only if available */}
                {item.dosage ? (
                  <Text style={styles.detail}>
                    Dosage: {item.dosage}
                  </Text>
                ) : null}

                <Text style={styles.detail}>
                  Times per day: {item.times_per_day}
                </Text>

                <Text style={styles.date}>
                  Added: {new Date(item.created_at).toLocaleString()}
                </Text>
              </View>

              {/* Button to edit medication */}
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() =>
                  navigation.navigate("EditMedication", {
                    medicationId: item.id,
                  })
                }
              >
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>

              {/* Button to delete medication */}
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => deleteMedication(item)}
              >
                <Text style={styles.actionText}>Delete</Text>
              </TouchableOpacity>

            </View>
          )}

          /* Message shown if there are no medications */
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No medications yet. Add one!
            </Text>
          }
        />
      </SafeAreaView>
    </ScreenWrapper>
  );
}

// Styles used in this screen
const styles = StyleSheet.create({
  addBtn: {
    backgroundColor: "#0FA958",
    padding: 14,
    borderRadius: 12,
    margin: 16,
    alignItems: "center",
  },

  addText: {
    color: "#ffffff",
    fontFamily: "Montserrat_700Bold",
    fontSize: 16,
  },

  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 4,
    flexDirection: "row",
    alignItems: "center",
  },

  name: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 17,
    color: "#0B3D2E",
  },

  detail: {
    marginTop: 6,
    fontFamily: "Montserrat_500Medium",
    color: "#556e58",
  },

  date: {
    marginTop: 6,
    fontFamily: "Montserrat_400Regular",
    color: "#7a8b7a",
  },

  editBtn: {
    padding: 10,
    backgroundColor: "#F59E0B",
    borderRadius: 10,
    marginLeft: 10,
  },

  deleteBtn: {
    padding: 10,
    backgroundColor: "#E53935",
    borderRadius: 10,
    marginLeft: 10,
  },

  actionText: {
    color: "#ffffff",
    fontFamily: "Montserrat_700Bold",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#556e58",
    fontFamily: "Montserrat_400Regular",
  },
});