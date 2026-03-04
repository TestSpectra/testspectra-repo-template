import http from "http";
import httpProxy from "http-proxy";
import { remote } from "webdriverio";

const proxy = httpProxy.createProxyServer({});
const PORT = 8080;

// 1. BUAT SERVER HTTP (Lebih stabil untuk flag --proxy-server)
const server = http.createServer((req, res) => {
  // Ambil URL bersih
  let cleanUrl = req.url;
  if (req.url.startsWith("http")) {
    const urlObj = new URL(req.url);
    cleanUrl = urlObj.pathname + urlObj.search;
  }

  // HIJACKING: Jika path mengandung /__/inspector
  if (cleanUrl.includes("/__/inspector")) {
    console.log(`[INSPECTOR] Injecting UI...`);
    res.writeHead(200, {
      "Content-Type": "text/html",
      "Security-Policy": "none", // Matikan CSP agar iframe bebas load
    });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
          <title>WDIO Inspector</title>
          <style>
              body { margin: 0; display: flex; flex-direction: column; height: 100vh; font-family: system-ui; background: #111; color: white; }
              nav { height: 40px; background: #333; display: flex; align-items: center; padding: 0 15px; border-bottom: 1px solid #444; }
              .layout { display: flex; flex: 1; }
              aside { width: 250px; background: #222; padding: 20px; border-right: 1px solid #444; }
              main { flex: 1; padding: 30px; background: #000; display: flex; justify-content: center; }
              .app-frame { width: 100%; height: 100%; background: white; border: none; border-radius: 8px; overflow: hidden; }
              iframe { width: 100%; height: 100%; border: none; }
          </style>
      </head>
      <body>
          <nav>WDIO RUNNER | HOST: ${req.headers.host}</nav>
          <div class="layout">
              <aside><h3>SELECTOR</h3><code id="sel" style="color:#0f0">Hover app...</code></aside>
              <main><div class="app-frame"><iframe id="aut" src="/"></iframe></div></main>
          </div>
          <script>
              const frame = document.getElementById('aut');
              frame.onload = () => {
                try {
                  const doc = frame.contentWindow.document;
                  doc.addEventListener('mouseover', (e) => {
                    const s = e.target.tagName.toLowerCase() + (e.target.id ? '#' + e.target.id : '');
                    document.getElementById('sel').innerText = s;
                    e.target.style.outline = '2px solid #0078d4';
                  });
                  doc.addEventListener('mouseout', (e) => e.target.style.outline = '');
                } catch(e) { console.error("SOP/CORS Error", e); }
              };
          </script>
      </body>
      </html>
    `);
    return;
  }

  // TERUSKAN KE TARGET ASLI (HTTPS)
  const target = "https://" + req.headers.host;
  req.url = cleanUrl;

  proxy.web(req, res, {
    target: target,
    changeOrigin: true,
    secure: false, // Penting: Jangan verifikasi SSL target dari proxy
    toProxy: true,
  });
});

// 2. JALANKAN SERVER
server.listen(PORT, "127.0.0.1", async () => {
  console.log(`🚀 Proxy Server Ready on http://127.0.0.1:${PORT}`);

  const browser = await remote({
    capabilities: {
      browserName: "chrome",
      "goog:chromeOptions": {
        args: [
          `--proxy-server=127.0.0.1:${PORT}`, // Jangan pakai https:// di sini
          "--ignore-certificate-errors",
          "--disable-web-security",
          "--allow-running-insecure-content",
          "--test-type", // Bypass beberapa security warning
        ],
      },
    },
  });

  console.log("🌐 Opening Inspector...");
  // Gunakan HTTP untuk memicu proxy, target HTTPS akan ditangani di dalam proxy.web
  await browser.url("http://www.google.com/__/inspector");
});

proxy.on("error", (err) => console.log("Proxy Error:", err.message));
