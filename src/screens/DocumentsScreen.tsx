import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useToast } from "../components/Toast";

type Props = NativeStackScreenProps<RootStackParamList, "Documents">;

interface Document {
  id: string;
  type: string;
  name: string;
  status: "verified" | "pending" | "missing" | "rejected";
  uploadedAt?: string;
  expiresAt?: string;
}

export default function DocumentsScreen({ navigation }: Props) {
  const showToast = useToast((s) => s.show);

  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      type: "license",
      name: "Driver's License",
      status: "verified",
      uploadedAt: "2024-01-15",
      expiresAt: "2028-01-15",
    },
    {
      id: "2",
      type: "insurance",
      name: "Vehicle Insurance",
      status: "verified",
      uploadedAt: "2024-02-01",
      expiresAt: "2025-02-01",
    },
    {
      id: "3",
      type: "registration",
      name: "Vehicle Registration",
      status: "pending",
      uploadedAt: "2024-11-10",
    },
    {
      id: "4",
      type: "background",
      name: "Background Check",
      status: "missing",
    },
  ]);

  const getStatusStyle = (status: Document["status"]) => {
    switch (status) {
      case "verified":
        return {
          bg: "bg-green-50",
          text: "text-green-700",
          icon: "checkmark-circle" as const,
          iconColor: "#16a34a",
        };
      case "pending":
        return {
          bg: "bg-yellow-50",
          text: "text-yellow-700",
          icon: "time" as const,
          iconColor: "#eab308",
        };
      case "rejected":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          icon: "close-circle" as const,
          iconColor: "#dc2626",
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-700",
          icon: "document-outline" as const,
          iconColor: "#6b7280",
        };
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "license":
        return "card";
      case "insurance":
        return "shield-checkmark";
      case "registration":
        return "document-text";
      case "background":
        return "person-circle";
      default:
        return "document";
    }
  };

  const handleUpload = (docId: string) => {
    showToast("Document upload will be available soon", "info");
  };

  const handleView = (docId: string) => {
    showToast("Opening document...", "info");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <Pressable onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </Pressable>
          <Text className="text-2xl font-bold text-gray-900 flex-1">Documents</Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        <View className="px-6 py-6">
          {/* Status Summary */}
          <View className="bg-white rounded-2xl p-4 mb-6 border border-gray-200">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Verification Status
            </Text>
            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <View className="w-12 h-12 bg-green-50 rounded-full items-center justify-center mb-2">
                  <Text className="text-xl font-bold text-green-600">2</Text>
                </View>
                <Text className="text-xs text-gray-600 text-center">Verified</Text>
              </View>
              <View className="items-center flex-1">
                <View className="w-12 h-12 bg-yellow-50 rounded-full items-center justify-center mb-2">
                  <Text className="text-xl font-bold text-yellow-600">1</Text>
                </View>
                <Text className="text-xs text-gray-600 text-center">Pending</Text>
              </View>
              <View className="items-center flex-1">
                <View className="w-12 h-12 bg-gray-50 rounded-full items-center justify-center mb-2">
                  <Text className="text-xl font-bold text-gray-600">1</Text>
                </View>
                <Text className="text-xs text-gray-600 text-center">Missing</Text>
              </View>
            </View>
          </View>

          {/* Documents List */}
          <Text className="text-sm font-semibold text-gray-500 mb-3 px-2">
            REQUIRED DOCUMENTS
          </Text>
          <View className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {documents.map((doc, index) => {
              const statusStyle = getStatusStyle(doc.status);
              const isLast = index === documents.length - 1;

              return (
                <View
                  key={doc.id}
                  className={`p-4 ${!isLast ? "border-b border-gray-200" : ""}`}
                >
                  <View className="flex-row items-start">
                    <View className="w-12 h-12 bg-blue-50 rounded-xl items-center justify-center mr-3">
                      <Ionicons
                        name={getDocumentIcon(doc.type) as any}
                        size={24}
                        color="#2563eb"
                      />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className="text-base font-semibold text-gray-900">
                          {doc.name}
                        </Text>
                        <View
                          className={`${statusStyle.bg} px-3 py-1 rounded-full flex-row items-center`}
                        >
                          <Ionicons
                            name={statusStyle.icon}
                            size={14}
                            color={statusStyle.iconColor}
                          />
                          <Text className={`${statusStyle.text} text-xs font-semibold ml-1`}>
                            {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                          </Text>
                        </View>
                      </View>

                      {doc.uploadedAt && (
                        <Text className="text-sm text-gray-600 mb-1">
                          Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                        </Text>
                      )}

                      {doc.expiresAt && (
                        <Text className="text-sm text-gray-600 mb-1">
                          Expires: {new Date(doc.expiresAt).toLocaleDateString()}
                        </Text>
                      )}

                      {/* Actions */}
                      <View className="flex-row gap-2 mt-2">
                        {doc.status === "missing" ? (
                          <Pressable
                            onPress={() => handleUpload(doc.id)}
                            className="bg-blue-600 px-4 py-2 rounded-lg active:bg-blue-700"
                          >
                            <Text className="text-white font-semibold text-sm">Upload</Text>
                          </Pressable>
                        ) : (
                          <>
                            <Pressable
                              onPress={() => handleView(doc.id)}
                              className="bg-gray-100 px-4 py-2 rounded-lg active:bg-gray-200"
                            >
                              <Text className="text-gray-700 font-semibold text-sm">
                                View
                              </Text>
                            </Pressable>
                            <Pressable
                              onPress={() => handleUpload(doc.id)}
                              className="bg-gray-100 px-4 py-2 rounded-lg active:bg-gray-200"
                            >
                              <Text className="text-gray-700 font-semibold text-sm">
                                Replace
                              </Text>
                            </Pressable>
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Info Box */}
          <View className="bg-blue-50 rounded-xl p-4 mt-6 flex-row">
            <Ionicons name="information-circle" size={20} color="#2563eb" />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-semibold text-gray-900 mb-1">
                Document Requirements
              </Text>
              <Text className="text-sm text-gray-700">
                All documents must be current and valid. We verify your documents within
                24-48 hours. You will receive a notification once verification is complete.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
