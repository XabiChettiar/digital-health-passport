import React, { useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  Platform,
  StatusBar,
} from "react-native";
import Header from "../components/Header";
import ScreenWrapper from "../components/ScreenWrapper";
import * as DocumentPicker from "expo-document-picker";
import { useFocusEffect } from "@react-navigation/native";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "../config/supabase";
import * as FileSystem from "expo-file-system/legacy";
import * as IntentLauncher from "expo-intent-launcher";
import SuccessPopup from "../components/SuccessPopup";
import ConfirmDialog from "../components/ConfirmDialog";

export default function UploadReportsScreen({ route }) {
  const { hospitalId, hospitalName } = route.params;

  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showPopup, setShowPopup] = useState(false);
  const [popupText, setPopupText] = useState("");
  const [popupType, setPopupType] = useState("success");

  const [showDialog, setShowDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Get logged in user
  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data?.user) setUser(data.user);
  };

  // Fetch reports for this hospital
  const fetchReports = async (userId) => {
    const { data } = await supabase
      .from("reports")
      .select("*")
      .eq("user_id", userId)
      .eq("hospital_id", hospitalId)
      .order("created_at", { ascending: false });

    setReports(data || []);
    setLoading(false);
  };

  // Initialize user when screen loads
  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        setLoading(true);
        await getUser();
      };
      init();
    }, [])
  );

  // Fetch reports when user is available
  useFocusEffect(
    useCallback(() => {
      if (user) fetchReports(user.id);
    }, [user])
  );

  // Upload report
  async function uploadReport() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
      });

      if (result.canceled) return;

      const file = result.assets[0];

      const MAX_FILE_SIZE_MB = 1;
      const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

      if (file.size && file.size > MAX_FILE_SIZE) {
        setPopupText(`File must be smaller than ${MAX_FILE_SIZE_MB} MB`);
        setPopupType("error");
        setShowPopup(true);
        return;
      }

      setUploading(true);

      const path = `${user.id}/${hospitalId}/${Date.now()}-${file.name}`;

      const response = await fetch(file.uri);
      const arrayBuffer = await response.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from("reports")
        .upload(path, arrayBuffer, {
          contentType: file.mimeType || "application/octet-stream",
        });

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from("reports").insert({
        user_id: user.id,
        hospital_id: hospitalId,
        name: file.name,
        path: path,
        type: file.mimeType || "unknown",
      });

      if (insertError) throw insertError;

      setPopupText("Report uploaded successfully");
      setPopupType("success");
      setShowPopup(true);

      fetchReports(user.id);
    } catch (e) {
      console.log("Upload Error:", e);
      setPopupText("Upload failed");
      setPopupType("error");
      setShowPopup(true);
    }

    setUploading(false);
  }

  // View report
  async function viewReport(item) {
    try {
      const ext = item.name?.endsWith(".pdf") ? "pdf" : "file";
      const localPath = `${FileSystem.cacheDirectory}${item.id}.${ext}`;

      const fileInfo = await FileSystem.getInfoAsync(localPath);
      let fileUri = localPath;

      if (!fileInfo.exists) {
        const { data } = await supabase.storage
          .from("reports")
          .createSignedUrl(item.path, 60 * 60 * 24);

        const download = await FileSystem.downloadAsync(
          data.signedUrl,
          localPath
        );

        fileUri = download.uri;
      }

      const contentUri = await FileSystem.getContentUriAsync(fileUri);

      if (Platform.OS === "android") {
        await IntentLauncher.startActivityAsync(
          "android.intent.action.VIEW",
          {
            data: contentUri,
            type: item.type || "application/pdf",
            flags: 1,
          }
        );
      } else {
        await WebBrowser.openBrowserAsync(fileUri);
      }
    } catch (e) {
      console.log("Open Error:", e);
      setPopupText("Unable to open file");
      setPopupType("error");
      setShowPopup(true);
    }
  }

  // Ask before deleting
  function deleteReport(item) {
    setSelectedReport(item);
    setShowDialog(true);
  }

  // Confirm delete
  async function confirmDelete() {
    try {
      const item = selectedReport;

      const { error: storageError } = await supabase.storage
        .from("reports")
        .remove([item.path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("reports")
        .delete()
        .eq("id", item.id);

      if (dbError) throw dbError;

      setPopupText("Report deleted");
      setPopupType("success");
      setShowPopup(true);

      fetchReports(user.id);
    } catch (e) {
      console.log("Delete Error:", e);
      setPopupText("Failed to delete report");
      setPopupType("error");
      setShowPopup(true);
    }

    setShowDialog(false);
  }

  // Loading screen
  if (loading || !user) {
    return (
      <ScreenWrapper style={{ backgroundColor: "#F6FFF7" }}>
        <StatusBar backgroundColor="#F6FFF7" barStyle="dark-content" />
        <SafeAreaView style={{ flex: 1 }}>
          <Header title={`Reports - ${hospitalName}`} />
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
        <Header title={`Reports - ${hospitalName}`} />

        <ConfirmDialog
          visible={showDialog}
          title="Delete Report"
          message="This report will be permanently deleted."
          onCancel={() => setShowDialog(false)}
          onConfirm={() => confirmDelete()}
        />

        <SuccessPopup
          visible={showPopup}
          text={popupText}
          type={popupType}
          onHide={() => setShowPopup(false)}
        />

        <TouchableOpacity style={styles.uploadBtn} onPress={uploadReport}>
          <Text style={styles.uploadText}>
            {uploading ? "Uploading..." : "Upload Report"}
          </Text>
        </TouchableOpacity>

        <FlatList
          data={reports}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.reportCard}>
              {item.type?.startsWith("image") ? (
                <Image
                  source={{
                    uri: supabase.storage
                      .from("reports")
                      .getPublicUrl(item.path).data.publicUrl,
                  }}
                  style={styles.thumbnail}
                />
              ) : (
                <View style={styles.pdfThumb}>
                  <Text style={styles.pdfText}>PDF</Text>
                </View>
              )}

              <Text style={styles.reportName}>{item.name}</Text>

              <Text style={styles.date}>
                {new Date(item.created_at).toLocaleString()}
              </Text>

              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.viewBtn}
                  onPress={() => viewReport(item)}
                >
                  <Text style={styles.btnText}>View</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => deleteReport(item)}
                >
                  <Text style={styles.btnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No reports yet for this hospital.
            </Text>
          }
        />
      </SafeAreaView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  uploadBtn: {
    backgroundColor: "#0FA958",
    padding: 14,
    borderRadius: 12,
    margin: 16,
    alignItems: "center",
  },

  uploadText: {
    color: "#ffffff",
    fontFamily: "Montserrat_700Bold",
    fontSize: 16,
  },

  reportCard: {
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 4,
  },

  thumbnail: {
    width: "100%",
    height: 140,
    borderRadius: 10,
    marginBottom: 10,
  },

  pdfThumb: {
    width: "100%",
    height: 140,
    borderRadius: 10,
    backgroundColor: "#FFEAEA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  pdfText: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 22,
    color: "#E53935",
  },

  reportName: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 16,
    color: "#0B3D2E",
  },

  date: {
    fontFamily: "Montserrat_400Regular",
    color: "#7a8b7a",
    marginTop: 6,
  },

  row: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },

  viewBtn: {
    flex: 1,
    backgroundColor: "#0FA958",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  deleteBtn: {
    flex: 1,
    backgroundColor: "#E53935",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  btnText: {
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