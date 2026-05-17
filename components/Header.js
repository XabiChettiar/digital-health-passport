import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";


export default function Header({ title, onBack, right }) {
return (
<View style={styles.header}>
{onBack ? (
<TouchableOpacity onPress={onBack} style={styles.backBtn}>
<MaterialCommunityIcons name="arrow-left" size={20} color="#fff" />
</TouchableOpacity>
) : (
<View style={{ width: 44 }} />
)}


<Text style={styles.title}>{title}</Text>


{right ? <View style={{ width: 44 }}>{right}</View> : <View style={{ width: 44 }} />}
</View>
);
}


const styles = StyleSheet.create({
header: {
height: 64,
backgroundColor: "#0FA958",
flexDirection: "row",
alignItems: "center",
justifyContent: "space-between",
paddingHorizontal: 12,
borderBottomLeftRadius: 12,
borderBottomRightRadius: 12,
},
backBtn: { padding: 6 },
title: { color: "#fff", fontSize: 18, fontFamily: "Montserrat_600SemiBold" },
});