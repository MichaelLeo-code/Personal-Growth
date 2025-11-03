import { useAuth, useThemeColors } from "@/my_hooks";
import React, { useState } from "react";
import { Alert, Platform, ViewStyle } from "react-native";
import { FloatingButton } from "../floating-button";
import { WebConfirmDialog } from "./WebConfirmDialog";

export const LogoutButton: React.FC<{ style: ViewStyle }> = ({ style }) => {
  const { logout } = useAuth();
  const colors = useThemeColors();
  const [showWebDialog, setShowWebDialog] = useState(false);

  const handleLogout = async () => {
    if (Platform.OS === "web") {
      setShowWebDialog(true);
    } else {
      // Use React Native Alert on mobile
      Alert.alert("Logout", "Are you sure you want to logout?", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            const result = await logout();
            if (!result.success) {
              Alert.alert("Error", result.error || "Failed to logout");
            }
          },
        },
      ]);
    }
  };

  const handleWebConfirm = async () => {
    setShowWebDialog(false);
    const result = await logout();
    if (!result.success) {
      // Show error using another dialog or simple alert
      alert(result.error || "Failed to logout");
    }
  };

  const handleWebCancel = () => {
    setShowWebDialog(false);
  };

  return (
    <>
      <FloatingButton
        onPress={handleLogout}
        backgroundColor={colors.error}
        label="Log out"
        style={style}
      />
      {Platform.OS === "web" && showWebDialog && (
        <WebConfirmDialog
          title="Logout"
          message="Are you sure you want to logout?"
          onConfirm={handleWebConfirm}
          onCancel={handleWebCancel}
        />
      )}
    </>
  );
};
