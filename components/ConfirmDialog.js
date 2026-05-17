import React, { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";

export default function ConfirmDialog({
  visible,
  title = "Confirm",
  message = "Are you sure?",
  onCancel,
  onConfirm,
}) {
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.35)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <Animated.View
        style={{
          width: "85%",
          backgroundColor: "#fff",
          padding: 18,
          borderRadius: 18,
          transform: [{ scale }],
          opacity,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: "#0B3D2E",
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            marginTop: 8,
            color: "#4C6F54",
          }}
        >
          {message}
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            marginTop: 18,
          }}
        >
          <TouchableOpacity
            onPress={onCancel}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 10,
              marginRight: 10,
              backgroundColor: "#F4F8F5",
            }}
          >
            <Text style={{ color: "#0B3D2E", fontWeight: "600" }}>
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onConfirm}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 18,
              borderRadius: 10,
              backgroundColor: "#E74C3C",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}
