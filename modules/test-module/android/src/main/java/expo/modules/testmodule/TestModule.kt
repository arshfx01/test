package expo.modules.testmodule

import android.util.Log
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class TestModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("TestModule")

    Function("hello") {
      Log.d("TestModule", "Native function called")
      return@Function "Hello from Android native module"
    }
  }
}
