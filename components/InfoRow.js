import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function InfoRow({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || "Not provided"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontFamily: "Montserrat_600SemiBold",
    color: "#0B3D2E",
    marginBottom: 6,
  },
  value: {
    fontFamily: "Montserrat_400Regular",
    color: "#556e58",
  },
});
