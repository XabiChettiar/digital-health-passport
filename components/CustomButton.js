import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";


export default function CustomButton({ title, onPress, style, textStyle }) {
return (
<TouchableOpacity style={[styles.btn, style]} onPress={onPress} activeOpacity={0.8}>
<Text style={[styles.text, textStyle]}>{title}</Text>
</TouchableOpacity>
);
}


const styles = StyleSheet.create({
btn: {
backgroundColor: "#0FA958",
paddingVertical: 14,
paddingHorizontal: 16,
borderRadius: 12,
alignItems: "center",
},
text: { color: "#fff", fontSize: 16, fontFamily: "Montserrat_600SemiBold" },
});