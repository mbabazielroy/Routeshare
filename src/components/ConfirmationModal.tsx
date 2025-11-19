import React from "react";
import { View, Text, Pressable, Modal } from "react-native";

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  destructive = false,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable
        className="flex-1 bg-black/50 justify-center items-center px-6"
        onPress={onCancel}
      >
        <Pressable
          className="bg-white rounded-2xl w-full max-w-sm p-6"
          onPress={(e) => e.stopPropagation()}
        >
          <Text className="text-xl font-bold text-gray-900 mb-2">{title}</Text>
          <Text className="text-base text-gray-600 mb-6">{message}</Text>

          <View className="flex-row gap-3">
            <Pressable
              className="flex-1 bg-gray-100 py-3 rounded-xl items-center active:opacity-70"
              onPress={onCancel}
            >
              <Text className="text-base font-semibold text-gray-700">
                {cancelText}
              </Text>
            </Pressable>

            <Pressable
              className={`flex-1 py-3 rounded-xl items-center active:opacity-70 ${
                destructive ? "bg-red-600" : "bg-blue-600"
              }`}
              onPress={onConfirm}
            >
              <Text className="text-base font-semibold text-white">
                {confirmText}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
