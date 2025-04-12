import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';

/**
 * A reusable modal component to confirm quest abandonment
 * 
 * Props:
 * - visible: Boolean to control modal visibility
 * - questTitle: Name of the quest (displayed in modal message)
 * - onCancel: Callback when cancel button is pressed
 * - onConfirm: Callback when confirm button is pressed
 */
const AbandonQuestModal = ({ visible, questTitle, onCancel, onConfirm }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {/* Message to user */}
          <Text style={styles.modalText}>
            Are you sure you want to abandon "{questTitle}"?
          </Text>

          {/* Cancel and Confirm buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
              <Text style={styles.buttonText}>Yes, Abandon</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AbandonQuestModal;

// Styles for the modal and its components
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)", // Dark transparent background
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#1E1E1E", // Dark modal background
    borderRadius: 12,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  modalText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  cancelButton: {
    backgroundColor: "#757575", // Gray button
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 6,
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: "#FF5722", // Orange button
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});
