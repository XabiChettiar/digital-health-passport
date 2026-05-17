import React, { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";

export default function SuccessPopup({
  visible,
  text = "Success",
  type = "success", // success | error | warning
  onHide,
}) {
  const slideAnim = useRef(new Animated.Value(-120)).current;

  const theme = {
    success: { border: "#0FA958", title: "#0B3D2E", sub: "#4C6F54" },
    error: { border: "#E74C3C", title: "#7A0B0B", sub: "#B35C5C" },
    warning: { border: "#F1C40F", title: "#7A6A0B", sub: "#9C8C36" },
  }[type];

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -120,
          duration: 300,
          useNativeDriver: true,
        }).start(() => onHide && onHide());
      }, 1800);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 60,
        left: 0,
        right: 0,
        transform: [{ translateY: slideAnim }],
        alignItems: "center",
        zIndex: 999,
      }}
    >
      <View
        style={{
          backgroundColor: "#FFFFFF",
          paddingVertical: 14,
          paddingHorizontal: 18,
          borderRadius: 16,
          width: "92%",
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 6,
          borderWidth: 2,
          borderColor: theme.border,
        }}
      >
        <Text
          style={{
            color: theme.title,
            fontSize: 16,
            fontWeight: "700",
          }}
        >
          {text}
        </Text>

        <Text
          style={{
            color: theme.sub,
            marginTop: 4,
            fontSize: 13,
          }}
        >
          Digital Health Passport
        </Text>
      </View>
    </Animated.View>
  );
}