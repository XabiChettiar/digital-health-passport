import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ScreenWrapper({ children, style }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        {
          flex: 1,
          paddingTop: insets.top,   // keep status bar safe
          
        },
        style
      ]}
    >
      {children}
    </View>
  );
}
