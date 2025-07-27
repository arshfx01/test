import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BleManager, State } from "react-native-ble-plx";

interface BLETestProps {
  onBack?: () => void;
}

const BLETest: React.FC<BLETestProps> = ({ onBack }) => {
  const [bleState, setBleState] = useState<string>("Unknown");
  const [isInitialized, setIsInitialized] = useState(false);

  const testBLE = async () => {
    try {
      console.log("Testing BLE initialization...");
      const manager = new BleManager();

      const state = await manager.state();
      console.log("BLE State:", state);
      setBleState(state);

      if (state === State.PoweredOn) {
        setIsInitialized(true);
        Alert.alert("Success", "BLE is working correctly!");
      } else {
        Alert.alert("BLE Status", `BLE is not ready. Current state: ${state}`);
      }

      manager.destroy();
    } catch (error) {
      console.error("BLE Test Error:", error);
      Alert.alert("Error", `BLE test failed: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      {onBack && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.title}>BLE Test</Text>
      <Text style={styles.status}>BLE State: {bleState}</Text>
      <Text style={styles.status}>
        Initialized: {isInitialized ? "Yes" : "No"}
      </Text>

      <TouchableOpacity style={styles.button} onPress={testBLE}>
        <Text style={styles.buttonText}>Test BLE</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default BLETest;
