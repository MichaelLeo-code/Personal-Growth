import { useThemeColors } from "@/my_hooks";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Modal, Platform, ViewStyle } from "react-native";
import { FloatingButton } from "../floating-button";
import { LoginScreen } from "./LoginScreen";


export const LoginButton: React.FC<{ style: ViewStyle }> = ({ style }) => {
  const colors = useThemeColors();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const router = useRouter();

  const handleLoginPress = () => {
    if (Platform.OS === "web") {
      router.push("/signup");
    } else {
      setShowLoginModal(true);
    }
  };

  return (
    <>
      <FloatingButton
        onPress={handleLoginPress}
        backgroundColor={colors.accent}
        label="Log in"
        style={style}
      />
      
      <Modal
        visible={showLoginModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLoginModal(false)}
      >
        <LoginScreen onLoginSuccess={() => setShowLoginModal(false)} />
      </Modal>
    </>
  );
};
