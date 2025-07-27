import { BleManager, Device, State, Subscription } from "react-native-ble-plx";

class BLEService {
  private manager: BleManager | null = null;
  private device: Device | null = null;
  private stateSubscription: Subscription | null = null;

  constructor() {
    // Initialize manager lazily to avoid issues during app startup
  }

  private getManager(): BleManager {
    if (!this.manager) {
      this.manager = new BleManager();
    }
    return this.manager;
  }

  // Initialize BLE and check permissions
  async initialize(): Promise<boolean> {
    try {
      const manager = this.getManager();
      const state = await manager.state();
      console.log("BLE State:", state);

      if (state === State.PoweredOn) {
        return true;
      } else {
        console.log("BLE not powered on, current state:", state);
        return false;
      }
    } catch (error) {
      console.error("Error initializing BLE:", error);
      return false;
    }
  }

  // Scan for BLE devices
  async scanForDevices(
    onDeviceFound: (device: Device) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    try {
      const isInitialized = await this.initialize();
      if (!isInitialized) {
        throw new Error("BLE not initialized");
      }

      const manager = this.getManager();

      // Stop any existing scan
      await manager.stopDeviceScan();

      // Start scanning for devices
      manager.startDeviceScan(
        null, // null means scan for all devices
        { allowDuplicates: false },
        (error, device) => {
          if (error) {
            console.error("Scan error:", error);
            onError?.(error);
            return;
          }

          if (device) {
            console.log("Found device:", device.name, device.id);
            onDeviceFound(device);
          }
        }
      );
    } catch (error) {
      console.error("Error starting scan:", error);
      onError?.(error as Error);
    }
  }

  // Stop scanning
  stopScan(): void {
    if (this.manager) {
      this.manager.stopDeviceScan();
    }
  }

  // Connect to a device
  async connectToDevice(deviceId: string): Promise<Device> {
    try {
      console.log("Connecting to device:", deviceId);

      const manager = this.getManager();
      const device = await manager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();

      this.device = device;
      console.log("Connected to device:", device.name);

      return device;
    } catch (error) {
      console.error("Error connecting to device:", error);
      throw error;
    }
  }

  // Discover services and characteristics
  async discoverServices(deviceId: string): Promise<any[]> {
    try {
      const manager = this.getManager();
      const device = await manager.devices([deviceId]);
      if (device.length === 0) {
        throw new Error("Device not found");
      }

      const connectedDevice = await this.connectToDevice(deviceId);
      const services = await connectedDevice.services();

      const servicesWithCharacteristics = await Promise.all(
        services.map(async (service) => {
          const characteristics = await service.characteristics();
          return {
            service,
            characteristics,
          };
        })
      );

      return servicesWithCharacteristics;
    } catch (error) {
      console.error("Error discovering services:", error);
      throw error;
    }
  }

  // Write data to a characteristic
  async writeToCharacteristic(
    serviceUUID: string,
    characteristicUUID: string,
    data: string
  ): Promise<void> {
    try {
      if (!this.device) {
        throw new Error("No device connected");
      }

      const service = await this.device.services();
      const targetService = service.find((s) => s.uuid === serviceUUID);

      if (!targetService) {
        throw new Error(`Service ${serviceUUID} not found`);
      }

      const characteristics = await targetService.characteristics();
      const targetCharacteristic = characteristics.find(
        (c) => c.uuid === characteristicUUID
      );

      if (!targetCharacteristic) {
        throw new Error(`Characteristic ${characteristicUUID} not found`);
      }

      // Convert string to base64 for writing
      const base64Data = btoa(data);

      await targetCharacteristic.writeWithResponse(base64Data);
      console.log("Data written successfully:", data);
    } catch (error) {
      console.error("Error writing to characteristic:", error);
      throw error;
    }
  }

  // Read data from a characteristic
  async readFromCharacteristic(
    serviceUUID: string,
    characteristicUUID: string
  ): Promise<string> {
    try {
      if (!this.device) {
        throw new Error("No device connected");
      }

      const service = await this.device.services();
      const targetService = service.find((s) => s.uuid === serviceUUID);

      if (!targetService) {
        throw new Error(`Service ${serviceUUID} not found`);
      }

      const characteristics = await targetService.characteristics();
      const targetCharacteristic = characteristics.find(
        (c) => c.uuid === characteristicUUID
      );

      if (!targetCharacteristic) {
        throw new Error(`Characteristic ${characteristicUUID} not found`);
      }

      const result = await targetCharacteristic.read();
      const data = atob(result.value || "");
      console.log("Data read successfully:", data);

      return data;
    } catch (error) {
      console.error("Error reading from characteristic:", error);
      throw error;
    }
  }

  // Disconnect from device
  async disconnect(): Promise<void> {
    try {
      if (this.device) {
        await this.device.cancelConnection();
        this.device = null;
        console.log("Disconnected from device");
      }
    } catch (error) {
      console.error("Error disconnecting:", error);
      throw error;
    }
  }

  // Get connected device
  getConnectedDevice(): Device | null {
    return this.device;
  }

  // Cleanup
  destroy(): void {
    this.stopScan();
    this.disconnect();
    if (this.manager) {
      this.manager.destroy();
      this.manager = null;
    }
  }
}

export default new BLEService();
