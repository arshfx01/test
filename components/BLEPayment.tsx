import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useBLE } from "../hooks/useBLE";

interface BLEPaymentProps {
  onBack?: () => void;
}

interface ServiceConfig {
  serviceUUID: string;
  characteristicUUID: string;
}

const BLEPayment: React.FC<BLEPaymentProps> = ({ onBack }) => {
  const {
    isScanning,
    devices,
    connectedDevice,
    isConnected,
    error,
    services,
    currentBalance,
    initializeBLE,
    startScan,
    stopScan,
    connectToDevice,
    disconnect,
    sendAmount,
    readBalance,
    clearError,
  } = useBLE();

  const [amount, setAmount] = useState("");
  const [serviceConfig, setServiceConfig] = useState<ServiceConfig>({
    serviceUUID: "",
    characteristicUUID: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Initialize BLE on component mount
  useEffect(() => {
    const initBLE = async () => {
      try {
        await initializeBLE();
      } catch (err) {
        console.error("Failed to initialize BLE:", err);
      }
    };
    initBLE();
  }, [initializeBLE]);

  // Handle errors
  useEffect(() => {
    if (error) {
      Alert.alert("BLE Error", error);
      clearError();
    }
  }, [error, clearError]);

  const handleStartScan = async () => {
    await startScan();
  };

  const handleStopScan = () => {
    stopScan();
  };

  const handleConnect = async (deviceId: string) => {
    try {
      setIsLoading(true);
      await connectToDevice(deviceId);
      Alert.alert("Success", "Connected to device successfully!");
    } catch (err) {
      Alert.alert("Connection Error", "Failed to connect to device");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      Alert.alert("Success", "Disconnected from device");
    } catch (err) {
      Alert.alert("Disconnect Error", "Failed to disconnect from device");
    }
  };

  const handleSendAmount = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount");
      return;
    }

    if (!serviceConfig.serviceUUID || !serviceConfig.characteristicUUID) {
      Alert.alert(
        "Service Configuration",
        "Please configure service and characteristic UUIDs"
      );
      return;
    }

    try {
      setIsLoading(true);
      const success = await sendAmount(
        serviceConfig.serviceUUID,
        serviceConfig.characteristicUUID,
        parseFloat(amount)
      );

      if (success) {
        Alert.alert("Success", `Amount ${amount} sent successfully!`);
        setAmount("");
      } else {
        Alert.alert("Error", "Failed to send amount");
      }
    } catch (err) {
      Alert.alert("Error", "Failed to send amount");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReadBalance = async () => {
    if (!serviceConfig.serviceUUID || !serviceConfig.characteristicUUID) {
      Alert.alert(
        "Service Configuration",
        "Please configure service and characteristic UUIDs"
      );
      return;
    }

    try {
      setIsLoading(true);
      const balance = await readBalance(
        serviceConfig.serviceUUID,
        serviceConfig.characteristicUUID
      );

      if (balance !== null) {
        Alert.alert("Balance", `Current balance: $${balance.toFixed(2)}`);
      } else {
        Alert.alert("Error", "Failed to read balance");
      }
    } catch (err) {
      Alert.alert("Error", "Failed to read balance");
    } finally {
      setIsLoading(false);
    }
  };

  const renderDevice = ({ item }: { item: any }) => (
    <View style={styles.deviceItem}>
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{item.name || "Unknown Device"}</Text>
        <Text style={styles.deviceId}>ID: {item.id}</Text>
        {item.rssi && (
          <Text style={styles.deviceRssi}>RSSI: {item.rssi} dBm</Text>
        )}
      </View>
      <TouchableOpacity
        style={[
          styles.connectButton,
          isConnected &&
            connectedDevice?.id === item.id &&
            styles.connectedButton,
        ]}
        onPress={() => handleConnect(item.id)}
        disabled={isLoading || (isConnected && connectedDevice?.id === item.id)}
      >
        <Text style={styles.connectButtonText}>
          {isConnected && connectedDevice?.id === item.id
            ? "Connected"
            : "Connect"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderService = ({ item }: { item: any }) => (
    <View style={styles.serviceItem}>
      <Text style={styles.serviceUUID}>Service: {item.service.uuid}</Text>
      {item.characteristics.map((char: any, index: number) => (
        <Text key={index} style={styles.characteristicUUID}>
          Characteristic {index + 1}: {char.uuid}
        </Text>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          {onBack && (
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.title}>BLE Payment System</Text>
        </View>
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Current Balance:</Text>
          <Text style={styles.balanceAmount}>${currentBalance.toFixed(2)}</Text>
        </View>
      </View>

      {/* Service Configuration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service Configuration</Text>
        <TextInput
          style={styles.input}
          placeholder="Service UUID"
          value={serviceConfig.serviceUUID}
          onChangeText={(text) =>
            setServiceConfig((prev) => ({ ...prev, serviceUUID: text }))
          }
        />
        <TextInput
          style={styles.input}
          placeholder="Characteristic UUID"
          value={serviceConfig.characteristicUUID}
          onChangeText={(text) =>
            setServiceConfig((prev) => ({ ...prev, characteristicUUID: text }))
          }
        />
      </View>

      {/* Device Scanning */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device Scanning</Text>
        <View style={styles.scanButtons}>
          <TouchableOpacity
            style={[styles.scanButton, isScanning && styles.scanningButton]}
            onPress={handleStartScan}
            disabled={isScanning}
          >
            <Text style={styles.scanButtonText}>
              {isScanning ? "Scanning..." : "Start Scan"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={handleStopScan}
            disabled={!isScanning}
          >
            <Text style={styles.scanButtonText}>Stop Scan</Text>
          </TouchableOpacity>
        </View>

        {isScanning && (
          <View style={styles.scanningIndicator}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.scanningText}>Scanning for devices...</Text>
          </View>
        )}

        <FlatList
          data={devices}
          renderItem={renderDevice}
          keyExtractor={(item) => item.id}
          style={styles.deviceList}
          scrollEnabled={false}
        />
      </View>

      {/* Connected Device Info */}
      {isConnected && connectedDevice && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connected Device</Text>
          <View style={styles.connectedDeviceInfo}>
            <Text style={styles.connectedDeviceName}>
              {connectedDevice.name || "Unknown Device"}
            </Text>
            <Text style={styles.connectedDeviceId}>
              ID: {connectedDevice.id}
            </Text>
            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={handleDisconnect}
            >
              <Text style={styles.disconnectButtonText}>Disconnect</Text>
            </TouchableOpacity>
          </View>

          {/* Services */}
          {services.length > 0 && (
            <View style={styles.servicesContainer}>
              <Text style={styles.servicesTitle}>Available Services:</Text>
              <FlatList
                data={services}
                renderItem={renderService}
                keyExtractor={(item, index) => index.toString()}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>
      )}

      {/* Payment Section */}
      {isConnected && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Send Payment</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="Enter amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <View style={styles.paymentButtons}>
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendAmount}
              disabled={isLoading || !amount}
            >
              <Text style={styles.sendButtonText}>Send Amount</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.readBalanceButton}
              onPress={handleReadBalance}
              disabled={isLoading}
            >
              <Text style={styles.readBalanceButtonText}>Read Balance</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#007AFF",
    padding: 20,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  backButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    flex: 1,
    textAlign: "center",
  },
  balanceContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  balanceLabel: {
    fontSize: 16,
    color: "white",
    opacity: 0.9,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  section: {
    backgroundColor: "white",
    margin: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  scanButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  scanButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
  },
  scanningButton: {
    backgroundColor: "#FF9500",
  },
  scanButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  scanningIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  scanningText: {
    marginLeft: 10,
    color: "#666",
  },
  deviceList: {
    maxHeight: 200,
  },
  deviceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  deviceId: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  deviceRssi: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  connectButton: {
    backgroundColor: "#34C759",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  connectedButton: {
    backgroundColor: "#8E8E93",
  },
  connectButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  connectedDeviceInfo: {
    alignItems: "center",
    marginBottom: 15,
  },
  connectedDeviceName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  connectedDeviceId: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  disconnectButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  disconnectButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  servicesContainer: {
    marginTop: 15,
  },
  servicesTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  serviceItem: {
    backgroundColor: "#f8f8f8",
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  serviceUUID: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  characteristicUUID: {
    fontSize: 12,
    color: "#666",
    marginLeft: 10,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    fontSize: 18,
    marginBottom: 15,
    textAlign: "center",
  },
  paymentButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sendButton: {
    flex: 1,
    backgroundColor: "#34C759",
    padding: 15,
    borderRadius: 8,
    marginRight: 5,
    alignItems: "center",
  },
  sendButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  readBalanceButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    marginLeft: 5,
    alignItems: "center",
  },
  readBalanceButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    fontSize: 16,
    marginTop: 10,
  },
});

export default BLEPayment;
