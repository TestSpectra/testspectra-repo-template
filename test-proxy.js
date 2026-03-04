import http from "http";
import https from "https";
import tls from "tls";
import crypto from "crypto";
import { execSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { remote } from "webdriverio";

const PORT = 8080;

// ============================================================
// 1. GENERATE SELF-SIGNED CERTIFICATE via openssl
//    RSA 2048 + SHA-256, compatible dengan Chrome modern
// ============================================================
console.log("🔐 Generating self-signed certificate...");

function generateCert() {
  const { privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "wdio-proxy-"));
  const keyFile = path.join(tmpDir, "key.pem");
  const certFile = path.join(tmpDir, "cert.pem");

  fs.writeFileSync(keyFile, privateKey);

  execSync(
    `openssl req -new -x509 -key "${keyFile}" -out "${certFile}" ` +
      `-days 365 -subj "/CN=WDIO Inspector Proxy" ` +
      `-addext "subjectAltName=DNS:*,DNS:localhost,IP:127.0.0.1"`,
    { stdio: "pipe" },
  );

  const cert = fs.readFileSync(certFile, "utf8");

  // Cleanup
  fs.rmSync(tmpDir, { recursive: true, force: true });

  return { key: privateKey, cert };
}

const { key, cert } = generateCert();
console.log("✅ Certificate generated");

// ============================================================
// 2. HELPER: Generate Inspector HTML
// ============================================================
function getInspectorHtml(host, protocol = "https") {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>WDIO Inspector</title>
        <style>
            * { box-sizing: border-box; }
            body { margin: 0; display: flex; flex-direction: column; height: 100vh; font-family: system-ui; background: #111; color: white; }
            nav { height: 40px; background: #333; display: flex; align-items: center; padding: 0 15px; border-bottom: 1px solid #444; font-size: 14px; gap: 10px; }
            nav .badge { background: #0078d4; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
            .layout { display: flex; flex: 1; overflow: hidden; }
            aside { width: 280px; background: #222; padding: 20px; border-right: 1px solid #444; overflow-y: auto; }
            aside h3 { margin-top: 0; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
            main { flex: 1; padding: 0; background: #000; display: flex; }
            .app-frame { width: 100%; height: 100%; background: white; overflow: hidden; }
            iframe { width: 100%; height: 100%; border: none; }
            #sel { color: #0f0; word-break: break-all; font-size: 13px; }
            #url-bar { color: #aaa; font-size: 12px; margin-top: 10px; word-break: break-all; }
        </style>
    </head>
    <body>
        <nav>
          <span class="badge">WDIO</span>
          INSPECTOR
          <span style="color:#666">|</span>
          <span style="color:#aaa">${host}</span>
        </nav>
        <div class="layout">
            <aside>
              <h3>Element Selector</h3>
              <code id="sel">Hover over app to inspect...</code>
              <div id="url-bar">Target: ${protocol}://${host}</div>
            </aside>
            <main>
              <div class="app-frame">
                <iframe id="aut" src="/"></iframe>
              </div>
            </main>
        </div>
        <script>
            const frame = document.getElementById('aut');
            frame.onload = () => {
              try {
                const doc = frame.contentWindow.document;
                doc.addEventListener('mouseover', (e) => {
                  let s = e.target.tagName.toLowerCase();
                  if (e.target.id) s += '#' + e.target.id;
                  if (e.target.className && typeof e.target.className === 'string') {
                    s += '.' + e.target.className.trim().split(/\\s+/).join('.');
                  }
                  document.getElementById('sel').innerText = s;
                  e.target.style.outline = '2px solid #0078d4';
                  e.target.style.outlineOffset = '-1px';
                });
                doc.addEventListener('mouseout', (e) => {
                  e.target.style.outline = '';
                  e.target.style.outlineOffset = '';
                });
              } catch(e) {
                document.getElementById('sel').innerText = 'Cross-origin: Cannot inspect (SOP)';
                document.getElementById('sel').style.color = '#f44';
                console.error("SOP/CORS Error", e);
              }
            };
        </script>
    </body>
    </html>
  `;
}

// ============================================================
// 3. HELPER: Handle HTTP request (shared by HTTP & HTTPS)
// ============================================================
function handleRequest(req, res, { host, protocol }) {
  let cleanUrl = req.url;
  if (req.url.startsWith("http")) {
    const urlObj = new URL(req.url);
    cleanUrl = urlObj.pathname + urlObj.search;
  }

  // HIJACKING: Jika path mengandung /__/inspector
  if (cleanUrl.includes("/__/inspector")) {
    console.log(`[INSPECTOR] Serving inspector UI for ${protocol}://${host}`);
    res.writeHead(200, {
      "Content-Type": "text/html",
      "Content-Security-Policy":
        "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;",
    });
    res.end(getInspectorHtml(host, protocol));
    return;
  }

  // PROXY: Teruskan ke target asli
  const targetUrl = `${protocol}://${host}${cleanUrl}`;
  console.log(`[PROXY] ${req.method} ${targetUrl}`);

  const mod = protocol === "https" ? https : http;
  const proxyReq = mod.request(
    targetUrl,
    {
      method: req.method,
      headers: {
        ...req.headers,
        host: host,
      },
      rejectUnauthorized: false,
    },
    (proxyRes) => {
      // Hapus header yang bisa memblokir iframe
      const headers = { ...proxyRes.headers };
      delete headers["x-frame-options"];
      delete headers["content-security-policy"];
      delete headers["content-security-policy-report-only"];

      res.writeHead(proxyRes.statusCode, headers);
      proxyRes.pipe(res);
    },
  );

  proxyReq.on("error", (err) => {
    console.error(`[PROXY ERROR] ${err.message}`);
    if (!res.headersSent) {
      res.writeHead(502, { "Content-Type": "text/plain" });
      res.end(`Proxy Error: ${err.message}`);
    }
  });

  req.pipe(proxyReq);
}

// ============================================================
// 4. BUAT HTTP PROXY SERVER
// ============================================================
const server = http.createServer((req, res) => {
  const host = req.headers.host || "localhost";
  handleRequest(req, res, { host, protocol: "http" });
});

// ============================================================
// 5. HANDLE CONNECT (HTTPS MITM)
//    Ketika Chrome visit HTTPS URL, ia mengirim CONNECT request.
//    Kita intercept, buat TLS socket dengan cert kita sendiri,
//    lalu handle HTTP di dalamnya — mirip cara Cypress.
// ============================================================
server.on("connect", (req, clientSocket, head) => {
  const [hostname, port] = req.url.split(":");
  console.log(`[CONNECT] ${hostname}:${port} - Creating MITM TLS connection`);

  // Beritahu client bahwa tunnel sudah siap
  clientSocket.write(
    "HTTP/1.1 200 Connection Established\r\n" +
      "Proxy-Agent: WDIO-Inspector-Proxy\r\n" +
      "\r\n",
  );

  // Buat TLS server di atas socket client (MITM)
  const tlsSocket = new tls.TLSSocket(clientSocket, {
    isServer: true,
    key: key,
    cert: cert,
  });

  tlsSocket.on("error", (err) => {
    console.error(`[TLS ERROR] ${hostname}: ${err.message}`);
  });

  // Buat mini HTTP server untuk parse request dari TLS socket
  const internalServer = http.createServer((req, res) => {
    handleRequest(req, res, { host: hostname, protocol: "https" });
  });

  internalServer.emit("connection", tlsSocket);

  if (head && head.length > 0) {
    tlsSocket.unshift(head);
  }
});

// ============================================================
// 6. ERROR HANDLING
// ============================================================
server.on("error", (err) => {
  console.error(`[SERVER ERROR] ${err.message}`);
});

// ============================================================
// 7. JALANKAN SERVER & BUKA BROWSER
// ============================================================
server.listen(PORT, "127.0.0.1", async () => {
  console.log(`🚀 Proxy Server Ready on http://127.0.0.1:${PORT}`);
  console.log(`   Supports: HTTP & HTTPS (MITM)`);
  console.log(`   Inspector path: /__/inspector`);
  console.log("");

  try {
    const browser = await remote({
      capabilities: {
        browserName: "chrome",
        "goog:chromeOptions": {
          args: [
            `--proxy-server=http://127.0.0.1:${PORT}`,
            "--ignore-certificate-errors",
            "--disable-web-security",
            "--allow-running-insecure-content",
            "--test-type",
            "--disable-features=IsolateOrigins,site-per-process",
          ],
        },
      },
    });

    console.log("🌐 Opening Inspector...");
    // Sekarang bisa langsung pakai HTTPS!
    await browser.url("https://dev-app.tagsamurai.com/__/inspector");
    console.log("✅ Inspector loaded successfully!");
  } catch (err) {
    console.error("❌ Browser error:", err.message);
  }
});
