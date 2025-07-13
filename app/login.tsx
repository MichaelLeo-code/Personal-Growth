import { LoginScreen } from "@/my_components";
import { useThemeColor } from "@/my_hooks";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function LoginPage() {
  const backgroundColor = useThemeColor({}, "background");

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <LoginScreen onLoginSuccess={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
