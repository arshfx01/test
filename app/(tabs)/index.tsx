import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import * as TestModule from "test-module";

export default function Home() {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function fetchMsg() {
      const result = await TestModule.default.hello();
      setMsg(result);
    }
    fetchMsg();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ color: "white", fontSize: 20 }}>
        {msg || "Loading..."}
      </Text>
    </View>
  );
}
