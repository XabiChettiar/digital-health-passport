// Import React hooks for state management and lifecycle
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

// SafeAreaView prevents UI from overlapping device notches
// useSafeAreaInsets provides safe area padding values
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

// Hook used to run logic whenever the screen comes into focus
import { useFocusEffect } from "@react-navigation/native";

// Custom header component
import Header from "../components/Header";

// Supabase client used for authentication and database queries
import { supabase } from "../config/supabase";

// Popup component used to show success or error messages
import SuccessPopup from "../components/SuccessPopup";

// Confirmation dialog used before deleting a hospital
import ConfirmDialog from "../components/ConfirmDialog";

// Main screen displaying hospitals where reports are stored
export default function HospitalsScreen({ navigation }) {

  // Get safe area insets (used for bottom padding in FlatList)
  const insets = useSafeAreaInsets();

  // State to store logged-in user
  const [user, setUser] = useState(null);

  // Controls loading indicator while data is fetched
  const [loading, setLoading] = useState(true);

  // Stores list of hospitals
  const [hospitals, setHospitals] = useState([]);

  // Popup message states
  const [showPopup, setShowPopup] = useState(false);
  const [popupText, setPopupText] = useState("");
  const [popupType, setPopupType] = useState("success");

  // Confirmation dialog states
  const [showDialog, setShowDialog] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);

  // Fetch the authenticated user from Supabase
  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data?.user) setUser(data.user);
  };

  // Fetch hospitals associated with the logged-in user
  const fetchHospitals = async (userId) => {
    const { data } = await supabase
      .from("hospitals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    // Store hospitals in state
    setHospitals(data || []);

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

  // Fetch hospitals once the user is available
  useFocusEffect(
    useCallback(() => {
      if (user) fetchHospitals(user.id);
    }, [user])
  );

  // Trigger delete confirmation dialog
  const deleteHospital = (hospital) => {
    setSelectedHospital(hospital);
    setShowDialog(true);
  };

  // Function executed after confirming hospital deletion
  const confirmDelete = async () => {
    try {

      // Fetch all reports linked to the selected hospital
      const { data: reports } = await supabase
        .from("reports")
        .select("path")
        .eq("hospital_id", selectedHospital.id)
        .eq("user_id", user.id);

      // If reports exist, delete files from Supabase storage
      if (reports?.length) {
        const paths = reports.map((r) => r.path);
        await supabase.storage.from("reports").remove(paths);
      }

      // Delete reports from database
      await supabase.from("reports").delete().eq("hospital_id", selectedHospital.id);

      // Delete hospital from database
      await supabase.from("hospitals").delete().eq("id", selectedHospital.id);

      // Show success popup
      setPopupText("Hospital and reports deleted");
      setPopupType("success");
      setShowPopup(true);

      // Refresh hospital list
      fetchHospitals(user.id);

    } catch (e) {

      // Show error popup if deletion fails
      setPopupText("Failed to delete hospital");
      setPopupType("error");
      setShowPopup(true);
    }

    // Close confirmation dialog
    setShowDialog(false);
  };

  // Show loading spinner while fetching hospital data
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor="#F6FFF7" barStyle="dark-content" />
        <Header title="Reports" />

        {/* Loading indicator */}
        <ActivityIndicator
          size="large"
          color="#0FA958"
          style={{ marginTop: 50 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar backgroundColor="#F6FFF7" barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <Header title="Reports" />

        {/* Confirmation dialog for deleting hospital */}
        <ConfirmDialog
          visible={showDialog}
          title="Delete Hospital"
          message={`This will delete ALL reports from "${selectedHospital?.name}". This cannot be undone.`}
          onCancel={() => setShowDialog(false)}
          onConfirm={confirmDelete}
        />

        {/* Popup message for success or error feedback */}
        <SuccessPopup
          visible={showPopup}
          text={popupText}
          type={popupType}
          onHide={() => setShowPopup(false)}
        />

        {/* Button to add a new hospital */}
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate("AddHospital")}
        >
          <Text style={styles.addText}>+ Add Hospital</Text>
        </TouchableOpacity>

        {/* Display message if no hospitals exist */}
        {hospitals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No hospitals added yet.
            </Text>
          </View>
        ) : (

          // Display list of hospitals
          <FlatList
            data={hospitals}
            keyExtractor={(item) => item.id.toString()}

            // Add padding including safe area bottom space
            contentContainerStyle={{
              padding: 16,
              paddingBottom: insets.bottom + 20,
            }}

            renderItem={({ item }) => (
              <View style={styles.card}>

                {/* Navigate to UploadReports screen when hospital is pressed */}
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() =>
                    navigation.navigate("UploadReports", {
                      hospitalId: item.id,
                      hospitalName: item.name,
                    })
                  }
                >
                  <Text style={styles.name}>🏥 {item.name}</Text>

                  {/* Display date hospital was added */}
                  <Text style={styles.date}>
                    Added: {new Date(item.created_at).toLocaleString()}
                  </Text>
                </TouchableOpacity>

                {/* Delete hospital button */}
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => deleteHospital(item)}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>

              </View>
            )}
          />
        )}
      </SafeAreaView>
    </>
  );
}

// Styles used in this screen
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6FFF7",
  },

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

  date: {
    fontFamily: "Montserrat_400Regular",
    marginTop: 6,
    color: "#556e58",
  },

  deleteBtn: {
    padding: 10,
    backgroundColor: "#E74C3C",
    borderRadius: 10,
    marginLeft: 10,
  },

  deleteText: {
    color: "#ffffff",
    fontFamily: "Montserrat_700Bold",
  },

  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
  },

  emptyText: {
    color: "#556e58",
    fontFamily: "Montserrat_400Regular",
  },
});