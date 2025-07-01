import React from "react";
import { View, StyleSheet } from "react-native";
import { LoginScreen } from "@/my_components";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";

export default function LoginPage() {
  return (
    <ThemeProvider value={DarkTheme}>
      <View style={styles.container}>
        <LoginScreen onLoginSuccess={() => {}} />
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});
