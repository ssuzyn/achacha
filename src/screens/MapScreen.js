import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import KakaoMapWebView from "../components/KakaoMapView";
const MapScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerText}>기프티콘 Map</Text>
      </View>

      <View style={styles.mapContainer}>
        <KakaoMapWebView />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 20,
    backgroundColor: "#f8f8f8",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  mapContainer: {
    flex: 1,
  },
});

export default MapScreen;
