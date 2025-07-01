import { useAuth } from "@/my_hooks";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native";

export const LogoutButton: React.FC = () => {
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
    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
      <Text style={styles.logoutText}>Logout</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  logoutButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "#FF3B30",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    zIndex: 1000,
  },
  logoutText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
