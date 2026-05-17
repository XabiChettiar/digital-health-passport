// Import React hooks for state management and lifecycle handling
import React, { useEffect, useState, useCallback } from "react";

// SafeAreaView ensures UI does not overlap with device notches or system UI
import { SafeAreaView } from "react-native-safe-area-context";

// Import required React Native UI components
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";

// Custom layout wrapper used across screens
import ScreenWrapper from "../components/ScreenWrapper";

// Header component displaying the screen title
import Header from "../components/Header";

// Library used to generate QR codes
import QRCode from "react-native-qrcode-svg";

// Camera component used for scanning QR codes
import { CameraView, useCameraPermissions } from "expo-camera";

// Supabase client used for authentication and database queries
import { supabase } from "../config/supabase";

// Navigation hook used to trigger actions when screen gains focus
import { useFocusEffect } from "@react-navigation/native";

// Main Emergency screen component
export default function EmergencyScreen() {

  // Mode determines whether the user is generating their QR or scanning one
  const [mode, setMode] = useState("generate");

  // Camera permission state
  const [permission, requestPermission] = useCameraPermissions();

  // Stores the generated QR code value
  const [qrValue, setQrValue] = useState("");

  // Tracks whether a QR code has already been scanned
  const [scanned, setScanned] = useState(false);

  // Stores the data extracted from the scanned QR code
  const [scannedData, setScannedData] = useState(null);

  // Runs whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Reset screen state
      setMode("generate");
      setScanned(false);
      setScannedData(null);

      // Load user's emergency information
      loadEmergencyData();
    }, [])
  );

  // React to mode changes (generate or scan)
  useEffect(() => {

    // If generate mode is active, load QR data
    if (mode === "generate") loadEmergencyData();

    // If scan mode is active, reset scanning state
    if (mode === "scan") {
      setScanned(false);
      setScannedData(null);

      // Request camera permission if not granted
      if (!permission?.granted) requestPermission();
    }

  }, [mode]);

  // Function to load user emergency information and generate QR value
  const loadEmergencyData = async () => {

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If user not found exit function
    if (!user) return;

    // Fetch user's name from the "users" table
    const { data: userData } = await supabase
      .from("users")
      .select("name")
      .eq("id", user.id)
      .single();

    // Fetch medical emergency data from the "medical_info" table
    const { data, error } = await supabase
      .from("medical_info")
      .select("blood_group, allergies, chronic, emergency_contact, age")
      .eq("user_id", user.id)
      .single();

    // Helper function to safely format values before storing in QR
    const safe = (value) => {
      if (!value) return "Not Set";
      if (Array.isArray(value)) return value.join(", ");
      if (typeof value === "object") return JSON.stringify(value);
      return value;
    };

    // Create JSON object containing emergency information
    const emergencyData = JSON.stringify({
      name: safe(userData?.name),
      age: safe(data?.age),
      bloodGroup: safe(data?.blood_group),
      allergies: safe(data?.allergies),
      chronic: safe(data?.chronic),
      emergency: safe(data?.emergency_contact),
    });

    // Store QR value
    setQrValue(emergencyData);
  };

  // Function triggered when QR code is scanned
  const handleBarCodeScanned = ({ data }) => {

    // Prevent scanning multiple times
    if (scanned) return;

    setScanned(true);

    try {
      // Parse scanned QR JSON data
      const parsed = JSON.parse(data);
      setScannedData(parsed);
    } catch {
      // If QR code is invalid show error
      setScannedData({ error: "Invalid QR Code" });
    }
  };

  return (
    <ScreenWrapper style={{ backgroundColor: "#F6FFF7" }}>
      <StatusBar backgroundColor="#F6FFF7" barStyle="dark-content" />

      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <Header title="Emergency" />

        {/* Toggle buttons for switching between QR generation and scanning */}
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              mode === "generate" && styles.activeBtn,
            ]}
            onPress={() => setMode("generate")}
          >
            <Text
              style={[
                styles.btnText,
                mode !== "generate" && styles.inactiveText,
              ]}
            >
              My QR
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              mode === "scan" && styles.activeBtn,
            ]}
            onPress={() => setMode("scan")}
          >
            <Text
              style={[
                styles.btnText,
                mode !== "scan" && styles.inactiveText,
              ]}
            >
              Scan QR
            </Text>
          </TouchableOpacity>
        </View>

        {/* QR Generation Mode */}
        {mode === "generate" && (
          <View style={styles.container}>
            <View style={styles.qrBox}>

              {/* Display generated QR code */}
              {qrValue ? (
                <QRCode value={qrValue} size={220} />
              ) : (
                <Text style={{ color: "#1B4332" }}>Loading...</Text>
              )}

            </View>

            <Text style={styles.info}>
              Present this QR to medical staff during an emergency
            </Text>
          </View>
        )}

        {/* QR Scanning Mode */}
        {mode === "scan" && (
          <View style={styles.scannerBox}>

            {/* Check if camera permission is granted */}
            {!permission?.granted ? (
              <Text style={styles.permissionText}>
                Grant camera permission in settings
              </Text>
            ) : (

              // Camera view used for scanning QR codes
              <CameraView
                style={{ width: "100%", height: "100%" }}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={handleBarCodeScanned}
              />

            )}
          </View>
        )}

        {/* Display scanned QR result */}
        {scannedData && (
          <View style={styles.overlay}>
            <View style={styles.resultCard}>

              {/* Show error if QR is invalid */}
              {scannedData?.error ? (
                <Text style={styles.errorText}>Invalid QR Code</Text>
              ) : (
                <>
                  <Text style={styles.title}>Emergency Details</Text>

                  {/* Loop through scanned data and display each field */}
                  {Object.entries(scannedData).map(([key, value]) => (
                    <Text key={key} style={styles.row}>
                      <Text style={styles.label}>
                        {key.charAt(0).toUpperCase() +
                          key.slice(1)}
                        :{" "}
                      </Text>
                      {value}
                    </Text>
                  ))}
                </>
              )}

              {/* Button to reset scanner */}
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => {
                  setScanned(false);
                  setScannedData(null);
                }}
              >
                <Text style={styles.closeText}>Scan Again</Text>
              </TouchableOpacity>

            </View>
          </View>
        )}

      </SafeAreaView>
    </ScreenWrapper>
  );
}

// Styles used in this screen
const styles = StyleSheet.create({
  toggle: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
    gap: 10,
  },

  toggleBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: "#dbe8dd",
  },

  activeBtn: {
    backgroundColor: "#0FA958",
  },

  btnText: {
    fontFamily: "Montserrat_600SemiBold",
    color: "#ffffff",
  },

  inactiveText: {
    color: "#1B4332",
  },

  container: {
    alignItems: "center",
    paddingTop: 28,
  },

  qrBox: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 12,
    elevation: 6,
  },

  info: {
    marginTop: 18,
    color: "#556e58",
    fontFamily: "Montserrat_400Regular",
    textAlign: "center",
    paddingHorizontal: 20,
  },

  scannerBox: {
    marginTop: 20,
    marginHorizontal: 25,
    height: 400,
    borderRadius: 18,
    overflow: "hidden",
  },

  permissionText: {
    textAlign: "center",
    color: "#1B4332",
    marginTop: 20,
  },

  overlay: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    padding: 16,
  },

  resultCard: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 16,
    elevation: 10,
  },

  title: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 18,
    marginBottom: 10,
    color: "#0B3D2E",
    textAlign: "center",
  },

  row: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 14,
    marginTop: 6,
    color: "#2f4f4f",
  },

  label: {
    fontFamily: "Montserrat_600SemiBold",
    color: "#0FA958",
  },

  errorText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 16,
    textAlign: "center",
    color: "#D32F2F",
  },

  closeBtn: {
    backgroundColor: "#0FA958",
    padding: 10,
    borderRadius: 10,
    marginTop: 14,
    alignItems: "center",
  },

  closeText: {
    color: "#ffffff",
    fontFamily: "Montserrat_600SemiBold",
  },
});