# BLE Payment System

This React Native Expo project implements a BLE (Bluetooth Low Energy) Central device that can scan for peripherals, connect to them, and send payment amounts via BLE characteristics.

## Features

- **Device Scanning**: Scan for nearby BLE devices
- **Device Connection**: Connect to selected BLE peripherals
- **Service Discovery**: Automatically discover services and characteristics
- **Data Writing**: Send payment amounts to specific characteristics
- **Balance Reading**: Read current balance from device
- **Modern UI**: Clean, intuitive interface with real-time status updates

## Prerequisites

- React Native development environment set up
- Expo CLI installed
- Physical device with Bluetooth capabilities (BLE doesn't work in simulators)
- BLE peripheral device for testing

## Installation

1. Install the required dependencies:

```bash
npm install react-native-ble-plx
```

2. For iOS, you'll need to add Bluetooth permissions to `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-ble-plx",
        {
          "isBackgroundEnabled": true,
          "modes": ["peripheral", "central"]
        }
      ]
    ]
  }
}
```

3. For Android, add the following permissions to `app.json`:

```json
{
  "expo": {
    "android": {
      "permissions": [
        "android.permission.BLUETOOTH",
        "android.permission.BLUETOOTH_ADMIN",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.BLUETOOTH_SCAN",
        "android.permission.BLUETOOTH_CONNECT"
      ]
    }
  }
}
```

## Usage

### 1. Starting the App

Run the app on a physical device:

```bash
npx expo start
```

### 2. BLE Payment Interface

1. Tap "Start BLE Payment" on the main screen
2. Configure the service and characteristic UUIDs for your BLE peripheral
3. Tap "Start Scan" to begin scanning for devices
4. Select a device from the list to connect
5. Once connected, you can:
   - Send payment amounts
   - Read current balance
   - View available services and characteristics

### 3. Service Configuration

You need to configure the correct UUIDs for your BLE peripheral:

- **Service UUID**: The UUID of the service that handles payment data
- **Characteristic UUID**: The UUID of the characteristic for writing payment amounts

Example UUIDs (replace with your device's actual UUIDs):

- Service UUID: `1800` (Generic Access Service)
- Characteristic UUID: `2A00` (Device Name)

### 4. Sending Payments

1. Enter the amount you want to send
2. Tap "Send Amount" to write the data to the characteristic
3. The app will automatically update the balance

### 5. Reading Balance

1. Tap "Read Balance" to read the current balance from the device
2. The balance will be displayed in the header

## Project Structure

```
├── services/
│   └── BLEService.ts          # Core BLE functionality
├── hooks/
│   └── useBLE.ts              # React hook for BLE state management
├── components/
│   └── BLEPayment.tsx         # Main UI component
└── app/(tabs)/
    └── index.tsx              # Entry point with navigation
```

## Key Components

### BLEService.ts

- Manages BLE connections and operations
- Handles device scanning, connection, and data transfer
- Provides methods for reading/writing characteristics

### useBLE.ts

- React hook that manages BLE state
- Provides easy-to-use functions for BLE operations
- Handles error states and loading states

### BLEPayment.tsx

- Complete UI for BLE payment operations
- Device scanning and selection interface
- Payment amount input and sending
- Service and characteristic configuration

## BLE Operations

### Scanning

```typescript
const { startScan, stopScan, devices } = useBLE();
await startScan(); // Start scanning for devices
stopScan(); // Stop scanning
```

### Connecting

```typescript
const { connectToDevice, isConnected } = useBLE();
await connectToDevice(deviceId); // Connect to specific device
```

### Writing Data

```typescript
const { sendAmount } = useBLE();
await sendAmount(serviceUUID, characteristicUUID, amount);
```

### Reading Data

```typescript
const { readBalance } = useBLE();
const balance = await readBalance(serviceUUID, characteristicUUID);
```

## Error Handling

The app includes comprehensive error handling:

- BLE initialization errors
- Connection failures
- Data transfer errors
- Permission issues

All errors are displayed to the user via alerts and the UI updates accordingly.

## Testing

To test the BLE functionality:

1. **Use a BLE peripheral device** (BLE doesn't work in simulators)
2. **Enable Bluetooth** on your device
3. **Grant location permissions** (required for BLE scanning on Android)
4. **Configure the correct UUIDs** for your peripheral device
5. **Test the connection** by scanning and connecting to your device

## Common Issues

### BLE Not Available

- Ensure Bluetooth is enabled on your device
- Check that you're running on a physical device (not simulator)
- Verify location permissions are granted

### No Devices Found

- Make sure your BLE peripheral is advertising
- Check that the peripheral is within range
- Verify the peripheral is not already connected to another device

### Connection Failed

- Ensure the peripheral is not connected to another device
- Check that the peripheral is still advertising
- Verify the device is within range

### Data Transfer Failed

- Check that the service and characteristic UUIDs are correct
- Ensure the characteristic supports writing
- Verify the peripheral is still connected

## Security Considerations

- BLE communications are not inherently secure
- Consider implementing encryption for sensitive payment data
- Validate all data received from peripherals
- Implement proper authentication mechanisms

## Future Enhancements

- Add support for multiple simultaneous connections
- Implement BLE security features
- Add support for BLE notifications
- Create a peripheral mode for testing
- Add data encryption
- Implement connection retry logic
- Add device pairing functionality

## License

This project is for educational and development purposes. Ensure compliance with local regulations when implementing payment systems.
