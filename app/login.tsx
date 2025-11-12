import { LoginScreen } from "@/my_components";
import { useThemeColor } from "@/my_hooks";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function LoginPage() {
  const backgroundColor = useThemeColor({}, "background");
  const router = useRouter();

  const closeLogin = () => {
    router.push("/");
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <LoginScreen initialMode="login" closeLogin={closeLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
