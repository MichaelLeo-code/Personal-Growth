import React from "react";
import { ConfirmDialog, DialogButton, DialogContent } from "../shared";

interface WebConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const WebConfirmDialog: React.FC<WebConfirmDialogProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  const content: DialogContent = {
    title,
    message,
  };

  const buttons: DialogButton[] = [
    {
      label: "Cancel",
      onPress: onCancel,
      variant: "default",
    },
    {
      label: "OK",
      onPress: onConfirm,
      variant: "danger",
    },
  ];

  return <ConfirmDialog content={content} buttons={buttons} />;
};

