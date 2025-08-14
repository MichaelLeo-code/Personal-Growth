import { useAuth, useThemeColors } from "@/my_hooks";
import React, { useState } from "react";
import { Modal, ViewStyle } from "react-native";
import { FloatingButton } from "../floating-button";
import { LoginScreen } from "./LoginScreen";

export const LoginButton: React.FC<{ style: ViewStyle }> = ({ style }) => {
  const { user } = useAuth();
  const colors = useThemeColors();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLoginPress = () => {
    setShowLoginModal(true);
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
  };

  // Don't show login button if user is already logged in
  if (user) {
    return null;
  }

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
        onRequestClose={handleCloseModal}
      >
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      </Modal>
    </>
  );
};
