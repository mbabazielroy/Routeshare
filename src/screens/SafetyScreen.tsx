import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Linking, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { RiderTabParamList, RootStackParamList } from "../navigation/types";
import { useToast } from "../components/Toast";
import { ConfirmationModal } from "../components/ConfirmationModal";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = CompositeScreenProps<
  BottomTabScreenProps<RiderTabParamList, "Safety">,
  NativeStackScreenProps<RootStackParamList>
>;

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export default function SafetyScreen({ navigation }: Props) {
  const showToast = useToast((s) => s.show);

  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);

  const [tripSharingEnabled, setTripSharingEnabled] = useState(true);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showEditContactModal, setShowEditContactModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");

  const relationships = ["Parent", "Sibling", "Spouse", "Partner", "Friend", "Other"];

  const resetForm = () => {
    setName("");
    setPhone("");
    setRelationship("");
  };

  const handleSOS = () => {
    // In production, this would also send location and trip details to emergency services
    showToast("Calling emergency services...", "error");
    Linking.openURL("tel:911");
  };

  const handleCallContact = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    Linking.openURL(`tel:${cleanPhone}`);
  };

  const handleAddContact = () => {
    if (!name.trim() || !phone.trim() || !relationship) {
      showToast("Please fill in all fields", "error");
      return;
    }

    const newContact: EmergencyContact = {
      id: Date.now().toString(),
      name: name.trim(),
      phone: phone.trim(),
      relationship,
    };

    setEmergencyContacts([...emergencyContacts, newContact]);
    showToast("Emergency contact added successfully", "success");
    setShowAddContactModal(false);
    resetForm();
  };

  const handleEditContact = () => {
    if (!name.trim() || !phone.trim() || !relationship || !editingContact) {
      showToast("Please fill in all fields", "error");
      return;
    }

    setEmergencyContacts(
      emergencyContacts.map((contact) =>
        contact.id === editingContact.id
          ? { ...contact, name: name.trim(), phone: phone.trim(), relationship }
          : contact
      )
    );

    showToast("Contact updated successfully", "success");
    setShowEditContactModal(false);
    setEditingContact(null);
    resetForm();
  };

  const openEditModal = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setName(contact.name);
    setPhone(contact.phone);
    setRelationship(contact.relationship);
    setShowEditContactModal(true);
  };

  const confirmDelete = (id: string) => {
    setContactToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteContact = () => {
    if (contactToDelete) {
      setEmergencyContacts(emergencyContacts.filter((c) => c.id !== contactToDelete));
      showToast("Contact removed", "success");
    }
    setShowDeleteModal(false);
    setContactToDelete(null);
  };

  const handleTripSharingToggle = () => {
    setTripSharingEnabled(!tripSharingEnabled);
    if (!tripSharingEnabled) {
      showToast("Trip sharing enabled", "success");
    } else {
      showToast("Trip sharing disabled", "info");
    }
  };

  const handleShareCurrentTrip = () => {
    if (emergencyContacts.length === 0) {
      showToast("Add emergency contacts first", "error");
      return;
    }
    // In production, this would send SMS with trip link to all contacts
    showToast("Trip details shared with emergency contacts", "success");
  };

  const ContactFormModal = ({
    visible,
    onClose,
    onSave,
    title,
  }: {
    visible: boolean;
    onClose: () => void;
    onSave: () => void;
    title: string;
  }) => (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/50 justify-end">
        <SafeAreaView className="bg-white dark:bg-gray-800 rounded-t-3xl" edges={["bottom"]}>
          <View className="p-6">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">{title}</Text>
              <Pressable onPress={() => {
                onClose();
                resetForm();
                setEditingContact(null);
              }}>
                <Ionicons name="close" size={28} color="#6b7280" />
              </Pressable>
            </View>

            {/* Name Input */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </Text>
              <View className="flex-row items-center bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-700">
                <Ionicons name="person-outline" size={20} color="#6b7280" />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter full name"
                  placeholderTextColor="#9ca3af"
                  className="flex-1 ml-3 text-base text-gray-900 dark:text-white"
                />
              </View>
            </View>

            {/* Phone Input */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </Text>
              <View className="flex-row items-center bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-700">
                <Ionicons name="call-outline" size={20} color="#6b7280" />
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+1 (555) 123-4567"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                  className="flex-1 ml-3 text-base text-gray-900 dark:text-white"
                />
              </View>
            </View>

            {/* Relationship Selection */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Relationship
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {relationships.map((rel) => (
                  <Pressable
                    key={rel}
                    onPress={() => setRelationship(rel)}
                    className={`px-4 py-2 rounded-xl border-2 ${
                      relationship === rel
                        ? "bg-blue-50 dark:bg-blue-900/30 border-blue-600 dark:border-blue-500"
                        : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <Text
                      className={`font-semibold ${
                        relationship === rel ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {rel}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => {
                  onClose();
                  resetForm();
                  setEditingContact(null);
                }}
                className="flex-1 bg-gray-100 dark:bg-gray-700 py-4 rounded-xl active:bg-gray-200 dark:active:bg-gray-600"
              >
                <Text className="text-center font-bold text-gray-700 dark:text-gray-300">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={onSave}
                className="flex-1 bg-blue-600 dark:bg-blue-500 py-4 rounded-xl active:bg-blue-700 dark:active:bg-blue-600"
              >
                <Text className="text-center font-bold text-white">Save Contact</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ConfirmationModal
        visible={showDeleteModal}
        title="Remove Contact"
        message="Are you sure you want to remove this emergency contact?"
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={handleDeleteContact}
        onCancel={() => setShowDeleteModal(false)}
        destructive
      />

      <ContactFormModal
        visible={showAddContactModal}
        onClose={() => setShowAddContactModal(false)}
        onSave={handleAddContact}
        title="Add Emergency Contact"
      />

      <ContactFormModal
        visible={showEditContactModal}
        onClose={() => setShowEditContactModal(false)}
        onSave={handleEditContact}
        title="Edit Emergency Contact"
      />

      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white dark:bg-gray-800 px-6 py-6 border-b border-gray-200 dark:border-gray-700">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Safety Center</Text>
          <Text className="text-base text-gray-600 dark:text-gray-300">
            Your safety is our top priority
          </Text>
        </View>

        {/* SOS Button */}
        <View className="mx-6 mt-4">
          <Pressable
            onPress={handleSOS}
            className="bg-red-600 dark:bg-red-500 rounded-2xl p-6 active:bg-red-700 dark:active:bg-red-600"
          >
            <View className="items-center">
              <View className="w-20 h-20 bg-white dark:bg-white rounded-full items-center justify-center mb-4">
                <Ionicons name="alert-circle" size={48} color="#dc2626" />
              </View>
              <Text className="text-2xl font-bold text-white mb-2">
                Emergency SOS
              </Text>
              <Text className="text-base text-red-100 dark:text-red-100 text-center">
                Tap to call emergency services immediately
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Trip Sharing */}
        <View className="mx-6 mt-4">
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-full items-center justify-center mr-3">
                  <Ionicons name="share-social" size={24} color="#2563eb" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900 dark:text-white">
                    Auto-Share Trips
                  </Text>
                  <Text className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                    Share with emergency contacts
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={handleTripSharingToggle}
                className={`w-14 h-8 rounded-full p-1 ${
                  tripSharingEnabled ? "bg-blue-600 dark:bg-blue-500" : "bg-gray-300 dark:bg-gray-700"
                }`}
              >
                <View
                  className={`w-6 h-6 bg-white dark:bg-white rounded-full transition-all ${
                    tripSharingEnabled ? "ml-auto" : ""
                  }`}
                />
              </Pressable>
            </View>
            <Text className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              When enabled, your emergency contacts will automatically receive your
              trip details and live location when you start a ride.
            </Text>

            {/* Manual Share Button */}
            <Pressable
              onPress={handleShareCurrentTrip}
              className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl py-3 px-4 active:bg-blue-100 dark:active:bg-blue-900/50"
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="send" size={18} color="#2563eb" />
                <Text className="text-blue-600 dark:text-blue-400 font-semibold ml-2">
                  Share Current Trip Now
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Emergency Contacts */}
        <View className="mx-6 mt-4">
          <View className="flex-row items-center justify-between mb-3 px-2">
            <Text className="text-lg font-bold text-gray-900 dark:text-white">
              Emergency Contacts
            </Text>
            <Pressable
              onPress={() => setShowAddContactModal(true)}
              className="px-3 py-1 bg-blue-600 dark:bg-blue-500 rounded-lg active:bg-blue-700 dark:active:bg-blue-600"
            >
              <Text className="text-white font-semibold text-sm">+ Add</Text>
            </Pressable>
          </View>

          {emergencyContacts.length === 0 ? (
            <View className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 items-center">
              <View className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full items-center justify-center mb-4">
                <Ionicons name="people-outline" size={32} color="#9ca3af" />
              </View>
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Emergency Contacts
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-300 text-center mb-4">
                Add trusted contacts who will be notified during emergencies
              </Text>
              <Pressable
                onPress={() => setShowAddContactModal(true)}
                className="bg-blue-600 dark:bg-blue-500 px-6 py-3 rounded-xl active:bg-blue-700 dark:active:bg-blue-600"
              >
                <Text className="text-white font-semibold">Add First Contact</Text>
              </Pressable>
            </View>
          ) : (
            <View className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {emergencyContacts.map((contact, index) => (
                <View
                  key={contact.id}
                  className={`p-4 ${
                    index < emergencyContacts.length - 1
                      ? "border-b border-gray-200 dark:border-gray-700"
                      : ""
                  }`}
                >
                  <View className="flex-row items-center">
                    <View className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full items-center justify-center mr-3">
                      <Ionicons name="person" size={24} color="#9333ea" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900 dark:text-white">
                        {contact.name}
                      </Text>
                      <Text className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                        {contact.relationship}
                      </Text>
                      <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {contact.phone}
                      </Text>
                    </View>
                    <View className="flex-row gap-2">
                      <Pressable
                        onPress={() => handleCallContact(contact.phone)}
                        className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-full items-center justify-center active:bg-green-100 dark:active:bg-green-900/50"
                      >
                        <Ionicons name="call" size={20} color="#16a34a" />
                      </Pressable>
                      <Pressable
                        onPress={() => openEditModal(contact)}
                        className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-full items-center justify-center active:bg-blue-100 dark:active:bg-blue-900/50"
                      >
                        <Ionicons name="create" size={20} color="#2563eb" />
                      </Pressable>
                      <Pressable
                        onPress={() => confirmDelete(contact.id)}
                        className="w-10 h-10 bg-red-50 dark:bg-red-900/30 rounded-full items-center justify-center active:bg-red-100 dark:active:bg-red-900/50"
                      >
                        <Ionicons name="trash" size={20} color="#dc2626" />
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Safety Features */}
        <View className="mx-6 mt-4">
          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3 px-2">
            Safety Features
          </Text>
          <View className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <Pressable
              onPress={() => navigation.navigate("HelpCenter")}
              className="flex-row items-center p-4 border-b border-gray-200 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700"
            >
              <View className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-full items-center justify-center mr-3">
                <Ionicons name="shield-checkmark" size={20} color="#2563eb" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900 dark:text-white">
                  Driver Verification
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  All drivers undergo background checks
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>

            <View className="flex-row items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <View className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-full items-center justify-center mr-3">
                <Ionicons name="location" size={20} color="#16a34a" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900 dark:text-white">
                  Real-Time GPS Tracking
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Always know where you are
                </Text>
              </View>
              <View className="bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full">
                <Text className="text-xs font-semibold text-green-700 dark:text-green-400">Active</Text>
              </View>
            </View>

            <Pressable
              onPress={() => Linking.openURL("tel:+18005551234")}
              className="flex-row items-center p-4 border-b border-gray-200 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700"
            >
              <View className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-full items-center justify-center mr-3">
                <Ionicons name="chatbubbles" size={20} color="#9333ea" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900 dark:text-white">
                  24/7 Support Line
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Get help anytime you need it
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>

            <View className="flex-row items-center p-4">
              <View className="w-10 h-10 bg-yellow-50 dark:bg-yellow-900/30 rounded-full items-center justify-center mr-3">
                <Ionicons name="star" size={20} color="#eab308" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900 dark:text-white">
                  Two-Way Ratings
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Build a trusted community
                </Text>
              </View>
              <View className="bg-yellow-50 dark:bg-yellow-900/30 px-3 py-1 rounded-full">
                <Text className="text-xs font-semibold text-yellow-700 dark:text-yellow-400">Active</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Safety Tips */}
        <View className="mx-6 mt-4 mb-6">
          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3 px-2">
            Safety Tips
          </Text>
          <View className="bg-blue-50 dark:bg-blue-900/30 rounded-2xl p-5 border border-blue-200 dark:border-blue-700">
            <View className="flex-row mb-3">
              <View className="w-6 h-6 bg-blue-600 dark:bg-blue-500 rounded-full items-center justify-center mr-3 mt-0.5">
                <Text className="text-white font-bold text-xs">1</Text>
              </View>
              <Text className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                Always verify the driver and vehicle match the app before entering
              </Text>
            </View>
            <View className="flex-row mb-3">
              <View className="w-6 h-6 bg-blue-600 dark:bg-blue-500 rounded-full items-center justify-center mr-3 mt-0.5">
                <Text className="text-white font-bold text-xs">2</Text>
              </View>
              <Text className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                Share your trip details with friends or family using the button above
              </Text>
            </View>
            <View className="flex-row mb-3">
              <View className="w-6 h-6 bg-blue-600 dark:bg-blue-500 rounded-full items-center justify-center mr-3 mt-0.5">
                <Text className="text-white font-bold text-xs">3</Text>
              </View>
              <Text className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                Sit in the back seat and always wear your seatbelt
              </Text>
            </View>
            <View className="flex-row">
              <View className="w-6 h-6 bg-blue-600 dark:bg-blue-500 rounded-full items-center justify-center mr-3 mt-0.5">
                <Text className="text-white font-bold text-xs">4</Text>
              </View>
              <Text className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                Trust your instincts - if something feels off, cancel the trip immediately
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
