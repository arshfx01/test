import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as TestModule from "test-module";
import BLEPayment from "../../components/BLEPayment";
import BLETest from "../../components/BLETest";

export default function Home() {
  const [msg, setMsg] = useState("");
  const [showBLE, setShowBLE] = useState(false);
  const [showTest, setShowTest] = useState(false);

  useEffect(() => {
    async function fetchMsg() {
      const result = await TestModule.default.hello();
      setMsg(result);
    }
    fetchMsg();
  }, []);

  if (showTest) {
    return <BLETest onBack={() => setShowTest(false)} />;
  }

  if (showBLE) {
    return <BLEPayment onBack={() => setShowBLE(false)} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>BLE Payment Demo</Text>
        <Text style={styles.subtitle}>{msg || "Loading..."}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          This demo shows BLE Central functionality for payment processing. Tap
          the button below to start the BLE payment interface.
        </Text>

        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() => setShowBLE(true)}
        >
          <Text style={styles.button}>Start BLE Payment</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.buttonContainer,
            { backgroundColor: "#FF9500", marginTop: 15 },
          ]}
          onPress={() => setShowTest(true)}
        >
          <Text style={styles.button}>Test BLE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#007AFF",
    padding: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "white",
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  description: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
  buttonContainer: {
    backgroundColor: "#34C759",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
