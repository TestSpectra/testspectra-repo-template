import { remote } from "webdriverio";
import { config } from "../config/wdio.web.conf";
import { spawn } from "child_process";
import * as path from "path";
import * as net from "net";

(async () => {
  console.log("\n🚀 Launching Web Inspector...");

  const PROXY_PORT = 8888;

  // ──────────────────────────────────────────────────
  // 1. Check if proxy server is already running
  // ──────────────────────────────────────────────────
  const isPortInUse = (port: number): Promise<boolean> => {
    return new Promise((resolve) => {
      const server = net.createServer();
      server.once("error", (err: any) => {
        resolve(err.code === "EADDRINUSE");
      });
      server.once("listening", () => {
        server.close();
        resolve(false);
      });
      server.listen(port);
    });
  };

  let serverProcess: ReturnType<typeof spawn> | undefined;

  if (await isPortInUse(PROXY_PORT)) {
    console.log(`ℹ️  Inspector proxy already running on port ${PROXY_PORT}`);
  } else {
    const serverPath = path.join(__dirname, "inspector", "server.ts");
    serverProcess = spawn("ts-node", [serverPath], {
      stdio: "inherit",
      shell: true,
    });
    // Wait for server + cert generation to complete
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  // ──────────────────────────────────────────────────
  // 2. Launch Browser with MITM Proxy flags
  //    --proxy-server routes all traffic through our
  //    MITM proxy, including HTTPS (via CONNECT tunnel)
  // ──────────────────────────────────────────────────
  const baseUrl = config.baseUrl || "https://example.com";

  const capabilities = {
    ...config.capabilities[0],
    "goog:chromeOptions": {
      args: [
        // Route all traffic through our MITM proxy
        `--proxy-server=http://127.0.0.1:${PROXY_PORT}`,
        // Accept our self-signed certificate
        "--ignore-certificate-errors",
        // Disable web security so the inspector can access iframe content
        "--disable-web-security",
        "--allow-running-insecure-content",
        // Disable site isolation so inspector can inspect iframe
        "--disable-features=IsolateOrigins,site-per-process",
        "--disable-site-isolation-trials",
        "--test-type",
      ],
    },
  };

  // ──────────────────────────────────────────────────
  // 3. Open Browser
  // ──────────────────────────────────────────────────
  console.log("🌐 Opening Browser...");
  const browser = await remote({
    capabilities: capabilities,
    logLevel: "error",
  });

  // Extract base URL's origin (e.g. https://dev-app.example.com)
  const targetOrigin = new URL(baseUrl).origin;

  // Navigate to target/__/inspector — our proxy will intercept this
  // and serve the inspector UI; the iframe inside loads "/" (the real app)
  const inspectorUrl = `${targetOrigin}/__/inspector`;
  console.log(`👉 Opening Inspector at: ${inspectorUrl}`);

  await browser.url(inspectorUrl);

  console.log("\n✅ Inspector Ready!");
  console.log("👉 INSTRUCTIONS:");
  console.log("1. The browser window shows the Inspector UI.");
  console.log("2. The target site is loaded in the iframe on the right.");
  console.log('3. Toggle "Inspect Mode" to enable element highlighting.');
  console.log("4. Click elements to generate WDIO selectors.");
  console.log('5. Toggle "Record Mode" to record interactions as a script.');
  console.log("6. Press Ctrl+C to exit.\n");

  // Keep session alive
  await browser.debug();

  // ──────────────────────────────────────────────────
  // 4. Cleanup
  // ──────────────────────────────────────────────────
  await browser.deleteSession();
  if (serverProcess) {
    serverProcess.kill();
  }
  process.exit();
})();
