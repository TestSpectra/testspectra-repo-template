import { config } from "../config/wdio.mobile.conf";
import { exec, spawn, ChildProcess } from "child_process";
import * as os from "os";
import * as net from "net";

const platform = os.platform();

// Extract capabilities
const capabilities = config.capabilities;
let caps = {};

if (Array.isArray(capabilities) && capabilities.length > 0) {
  caps = capabilities[0];
} else if (typeof capabilities === "object" && capabilities !== null) {
  caps = capabilities;
}

const jsonCaps = JSON.stringify(caps, null, 2);

// Function to check if port is in use
const isPortInUse = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    server.once("listening", () => {
      server.close();
      resolve(false);
    });
    server.listen(port);
  });
};

// Function to copy to clipboard and open Inspector
const openInspector = () => {
  console.log("\n🚀 Preparing Appium Inspector...");
  console.log("📋 Capabilities found:", jsonCaps);

  if (platform === "darwin") {
    // macOS
    const proc = exec("pbcopy");
    proc.stdin?.write(jsonCaps);
    proc.stdin?.end();

    console.log("✅ Capabilities copied to clipboard!");
    console.log("📱 Opening Appium Inspector...");

    exec('open -a "Appium Inspector"', (error) => {
      if (error) {
        console.error("❌ Failed to open Appium Inspector. Is it installed?");
        console.log(
          "👉 Download: https://github.com/appium/appium-inspector/releases"
        );
      }
    });
  } else if (platform === "win32") {
    // Windows
    const proc = exec("clip");
    proc.stdin?.write(jsonCaps);
    proc.stdin?.end();

    console.log("✅ Capabilities copied to clipboard!");
    console.log("📱 Please open Appium Inspector manually if not started.");

    exec('start "" "Appium Inspector"', (error) => {
      if (error) {
        // Ignore error
      }
    });
  } else {
    console.log("⚠️ Unsupported OS for auto-open.");
    console.log("📋 Please copy the JSON above manually.");
  }

  console.log("\n👉 INSTRUCTIONS:");
  console.log("1. Wait for Appium Inspector to open.");
  console.log(
    '2. Paste the JSON from your clipboard into the "JSON Representation" box.'
  );
  console.log('3. Click "Start Session".\n');
};

const startAppiumAndInspector = async () => {
  const port = 4723;
  const isRunning = await isPortInUse(port);
  let appiumProcess: ChildProcess | null = null;

  if (isRunning) {
    console.log(`✅ Appium server is already running on port ${port}.`);
    openInspector();
  } else {
    console.log(
      `⚠️ Appium server not found on port ${port}. Starting it now...`
    );
    console.log("⏳ Waiting for Appium to start...");

    // Start Appium with CORS allowed (useful for web inspectors too)
    appiumProcess = spawn("appium", ["--allow-cors"], {
      stdio: "inherit",
      shell: true,
    });

    // Give it a moment to initialize
    await new Promise((resolve) => setTimeout(resolve, 5000));

    openInspector();

    console.log("\n🛑 Press Ctrl+C to stop the Appium server and exit.");

    // Keep the process alive
    process.stdin.resume();

    const cleanup = () => {
      console.log("\nStopping Appium Inspector...");
      if (platform === "darwin") {
        exec("osascript -e 'quit app \"Appium Inspector\"'");
      } else if (platform === "win32") {
        exec('taskkill /IM "Appium Inspector.exe" /F');
      }

      if (appiumProcess) {
        console.log("\nStopping Appium server...");
        // On Windows, killing the shell might not kill the child, but for dev tool it's acceptable effort
        if (platform === "win32") {
          exec("taskkill /pid " + appiumProcess.pid + " /T /F");
        } else {
          appiumProcess.kill();
        }
        appiumProcess = null;
      }
      process.exit();
    };

    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
  }
};

startAppiumAndInspector();
