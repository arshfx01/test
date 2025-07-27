import { useCallback, useEffect, useState } from "react";
import { Device } from "react-native-ble-plx";
import BLEService from "../services/BLEService";

interface BLEDevice {
  id: string;
  name: string | null;
  rssi: number | null;
  device: Device;
}

interface ServiceInfo {
  serviceUUID: string;
  characteristicUUID: string;
}

export const useBLE = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<BLEDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<any[]>([]);
  const [currentBalance, setCurrentBalance] = useState<number>(0);

  // Initialize BLE
  const initializeBLE = useCallback(async () => {
    try {
      setError(null);
      const isInitialized = await BLEService.initialize();
      if (!isInitialized) {
        setError("BLE not available. Please enable Bluetooth.");
      }
      return isInitialized;
    } catch (err) {
      setError("Failed to initialize BLE. Please check Bluetooth permissions.");
      console.error("BLE initialization error:", err);
      return false;
    }
  }, []);

  // Scan for devices
  const startScan = useCallback(async () => {
    try {
      setError(null);
      setIsScanning(true);
      setDevices([]);

      await BLEService.scanForDevices(
        (device) => {
          setDevices((prev) => {
            // Check if device already exists
            const exists = prev.find((d) => d.id === device.id);
            if (!exists) {
              return [
                ...prev,
                {
                  id: device.id,
                  name: device.name,
                  rssi: device.rssi,
                  device,
                },
              ];
            }
            return prev;
          });
        },
        (error) => {
          setError(`Scan error: ${error.message}`);
          setIsScanning(false);
        }
      );
    } catch (err) {
      setError("Failed to start scanning");
      setIsScanning(false);
      console.error("Scan error:", err);
    }
  }, []);

  // Stop scanning
  const stopScan = useCallback(() => {
    BLEService.stopScan();
    setIsScanning(false);
  }, []);

  // Connect to device
  const connectToDevice = useCallback(async (deviceId: string) => {
    try {
      setError(null);
      setIsConnected(false);

      const device = await BLEService.connectToDevice(deviceId);
      setConnectedDevice(device);
      setIsConnected(true);

      // Discover services
      const discoveredServices = await BLEService.discoverServices(deviceId);
      setServices(discoveredServices);

      return device;
    } catch (err) {
      setError(
        `Failed to connect: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      setIsConnected(false);
      console.error("Connection error:", err);
      throw err;
    }
  }, []);

  // Disconnect from device
  const disconnect = useCallback(async () => {
    try {
      await BLEService.disconnect();
      setConnectedDevice(null);
      setIsConnected(false);
      setServices([]);
    } catch (err) {
      setError("Failed to disconnect");
      console.error("Disconnect error:", err);
    }
  }, []);

  // Write data to characteristic
  const writeData = useCallback(
    async (serviceUUID: string, characteristicUUID: string, data: string) => {
      try {
        setError(null);
        await BLEService.writeToCharacteristic(
          serviceUUID,
          characteristicUUID,
          data
        );
        return true;
      } catch (err) {
        setError(
          `Failed to write data: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
        console.error("Write error:", err);
        return false;
      }
    },
    []
  );

  // Read data from characteristic
  const readData = useCallback(
    async (serviceUUID: string, characteristicUUID: string) => {
      try {
        setError(null);
        const data = await BLEService.readFromCharacteristic(
          serviceUUID,
          characteristicUUID
        );
        return data;
      } catch (err) {
        setError(
          `Failed to read data: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
        console.error("Read error:", err);
        return null;
      }
    },
    []
  );

  // Send amount (specific function for your use case)
  const sendAmount = useCallback(
    async (serviceUUID: string, characteristicUUID: string, amount: number) => {
      try {
        setError(null);
        const amountString = amount.toString();
        const success = await writeData(
          serviceUUID,
          characteristicUUID,
          amountString
        );

        if (success) {
          // Update balance (assuming the amount is deducted)
          setCurrentBalance((prev) => Math.max(0, prev - amount));
        }

        return success;
      } catch (err) {
        setError(
          `Failed to send amount: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
        console.error("Send amount error:", err);
        return false;
      }
    },
    [writeData]
  );

  // Read balance from device
  const readBalance = useCallback(
    async (serviceUUID: string, characteristicUUID: string) => {
      try {
        setError(null);
        const balanceData = await readData(serviceUUID, characteristicUUID);
        if (balanceData) {
          const balance = parseFloat(balanceData);
          if (!isNaN(balance)) {
            setCurrentBalance(balance);
            return balance;
          }
        }
        return null;
      } catch (err) {
        setError(
          `Failed to read balance: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
        console.error("Read balance error:", err);
        return null;
      }
    },
    [readData]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      BLEService.destroy();
    };
  }, []);

  return {
    // State
    isScanning,
    devices,
    connectedDevice,
    isConnected,
    error,
    services,
    currentBalance,

    // Actions
    initializeBLE,
    startScan,
    stopScan,
    connectToDevice,
    disconnect,
    writeData,
    readData,
    sendAmount,
    readBalance,

    // Utility
    clearError: () => setError(null),
  };
};
