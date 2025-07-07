import { useAuth } from "@/my_hooks";
import React from "react";
import { Alert, ViewStyle } from "react-native";
import { FloatingButton } from "../floating-button";

export const LogoutButton: React.FC<{ style: ViewStyle }> = ({ style }) => {
  const { logout } = useAuth();

  const handleLogout = async () => {
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
  };

  return (
    <FloatingButton
      onPress={handleLogout}
      backgroundColor="#a81000"
      label="Log out"
      style={style}
    ></FloatingButton>
  );
};
