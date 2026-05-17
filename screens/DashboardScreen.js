import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "../config/supabase";
import SuccessPopup from "../components/SuccessPopup";

export default function DashboardScreen({ navigation }) {
  const [name, setName] = useState(""); // Stores user's display name
  const [loading, setLoading] = useState(true); // Controls loading indicator visibility
  const [showPopup, setShowPopup] = useState(true); // Controls login success popup

  useEffect(() => {
    // Automatically hide success popup after 1.5 seconds
    const t = setTimeout(() => setShowPopup(false), 1500);
    return () => clearTimeout(t);
  }, []);

  const fetchUser = async () => {
    setLoading(true); // Show loading indicator while fetching user data

    // Get currently authenticated user from Supabase
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch user's name from "users" table using user ID
      const { data } = await supabase
        .from("users")
        .select("name")
        .eq("id", user.id)
        .single();

      // Set name from database, fallback to email or default
      setName(data?.name || user.email || "User");
    } catch {
      setName("User"); // Fallback name in case of error
    }

    setLoading(false); // Hide loading indicator after fetching
  };

  useFocusEffect(
    useCallback(() => {
      fetchUser(); // Refresh user data whenever screen comes into focus
    }, [])
  );

  if (loading) {
    // Show loading spinner while user data is being fetched
    return (
      <>
        <StatusBar backgroundColor="#F6FFF7" barStyle="dark-content" />
        <SafeAreaView style={styles.safeArea}>
          <Header title="Dashboard" />
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

      <SafeAreaView style={styles.safeArea}>
        <SuccessPopup
          visible={showPopup} // Controls popup visibility
          text="Logged in successfully"
          type="success"
          onHide={() => setShowPopup(false)}
        />

        <Header title="Dashboard" />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <Text style={styles.greeting}>Hello,</Text>

            {/* Navigate to Profile screen when name is pressed */}
            <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
              <Text style={styles.name}>{name || "User"}</Text>
            </TouchableOpacity>

            <Text style={styles.small}>Digital Health Passport</Text>
          </View>

          {/* Navigate to Medical Information screen */}
          <TouchableOpacity
            style={styles.smallCard}
            onPress={() => navigation.navigate("MedicalInfo")}
          >
            <Text style={styles.cardTitle}>Medical Information</Text>
            <Text style={styles.cardSub}>
              View and edit your conditions, allergies & details
            </Text>
          </TouchableOpacity>

          {/* Navigate to Medications screen */}
          <TouchableOpacity
            style={styles.smallCard}
            onPress={() => navigation.navigate("Medications")}
          >
            <Text style={styles.cardTitle}>Medications</Text>
            <Text style={styles.cardSub}>
              View, add and manage your medications
            </Text>
          </TouchableOpacity>

          {/* Navigate to Emergency QR screen */}
          <TouchableOpacity
            style={styles.smallCard}
            onPress={() => navigation.navigate("Emergency")}
          >
            <Text style={styles.cardTitle}>Emergency QR</Text>
            <Text style={styles.cardSub}>
              Show QR code to first responders
            </Text>
          </TouchableOpacity>

          {/* Navigate to Reports screen */}
          <TouchableOpacity
            style={styles.smallCard}
            onPress={() => navigation.navigate("Reports")}
          >
            <Text style={styles.cardTitle}>View Reports</Text>
            <Text style={styles.cardSub}>
              View hospitals and manage uploaded reports
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6FFF7", // Main background color
  },

  scrollContent: {
    padding: 16, // Padding for screen content
    paddingBottom: 20,
  },

  card: {
    backgroundColor: "#ffffff", // Main user info card
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 6,
  },

  greeting: {
    color: "#556e58",
    fontFamily: "Montserrat_400Regular",
  },

  name: {
    fontSize: 28, // User name display styling
    fontFamily: "Montserrat_700Bold",
    color: "#0B3D2E",
    marginVertical: 6,
  },

  small: {
    color: "#7a8b7a",
    fontFamily: "Montserrat_400Regular",
  },

  smallCard: {
    backgroundColor: "#ffffff", // Navigation cards styling
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 4,
  },

  cardTitle: {
    fontSize: 16,
    fontFamily: "Montserrat_600SemiBold",
    color: "#0B3D2E",
  },

  cardSub: {
    color: "#556e58",
    fontFamily: "Montserrat_400Regular",
    marginTop: 6,
  },
});
