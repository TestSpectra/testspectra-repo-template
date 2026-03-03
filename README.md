# Automation Test Framework

Framework otomasi testing lengkap menggunakan **WebdriverIO** untuk functional testing (Web & Mobile) dan **Grafana k6** untuk API testing (functional & load testing).

## 🚀 Memulai (Getting Started)

Script setup akan secara otomatis memeriksa dan menginstall semua tools yang dibutuhkan, termasuk:

- **Node.js** & **pnpm**
- **Java JDK** (untuk Mobile)
- **Android Studio/SDK** (untuk Mobile)
- **Appium** & Drivers
- **k6** (untuk API)
- **Go (Golang)** (untuk dependensi k6)

### 🛠️ Setup Cepat (Rekomendasi)

Jalankan script berikut langsung dari terminal Anda (tidak perlu install Node.js/pnpm terlebih dahulu):

**Mac/Linux:**

```bash
bash scripts/setup.sh
```

**Windows:**

```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup.ps1
```

Perintah ini akan:

1.  Memeriksa/Install **Node.js** & **pnpm**.
2.  Memeriksa/Install **Java JDK** & **Android SDK**.
3.  Memeriksa/Install **Appium** secara global.
4.  Memeriksa/Install **UiAutomator2** driver untuk Android.
5.  Memeriksa/Install **k6** & **Go**.
6.  Memeriksa/Install **Appium Inspector** (Mac only).
7.  Menginstall dependensi project (`pnpm install`).

### 🏃‍♂️ Menjalankan Test

Setelah setup selesai, Anda dapat menjalankan test menggunakan perintah berikut:

```bash
# Web Functional Tests (Chrome)
pnpm test:web

# Mobile App Tests (Android)
pnpm test:mobile

# API Functional Tests
pnpm test:api:func

# API Load Tests
pnpm test:api:load

# Generate & Open Allure Report
pnpm report
```

### ⚙️ Setup Manual

Jika Anda memilih untuk setup secara manual, pastikan Anda menginstall tools berikut:

1.  **Node.js** (v18+) & **pnpm**.
2.  **Java JDK** & **Android Studio** (pastikan `ANDROID_HOME` terkonfigurasi).
3.  **Appium** (`npm i -g appium`) & **UiAutomator2** (`appium driver install uiautomator2`).
4.  **k6** & **Go**.
5.  **Appium Inspector**.
6.  Install dependensi project: `pnpm install`.

## 📁 Project Structure

```
automation-template/
├── config/
│   ├── wdio.web.conf.ts      # WebdriverIO config untuk Web testing
│   └── wdio.mobile.conf.ts   # WebdriverIO config untuk Mobile testing
├── tests/
│   ├── web/                  # Test cases untuk Web
│   │   ├── login.test.ts
│   │   └── checkboxes.test.ts
│   └── mobile/               # Test cases untuk Mobile
│       └── app.test.ts
├── k6-scripts/               # k6 scripts untuk API testing
│   ├── functional_api.ts     # API functional tests
│   └── load_test.ts          # API load tests
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies dan scripts
```

## 🧪 Test Examples

### Web Testing (WebdriverIO)

Test menggunakan dev-app.tagsamurai.com:

- **Login Test**: Validasi login dengan kredensial valid dan invalid

### API Testing (k6)

Test menggunakan [JSONPlaceholder](https://jsonplaceholder.typicode.com) API:

- **Functional Tests**: CRUD operations (GET, POST, PUT, DELETE)
- **Load Tests**: Performance testing dengan ramping VUs

### Mobile Testing (Appium + WebdriverIO)

Template test untuk mobile app testing. Update file `tests/mobile/app.test.ts` dengan:

- Path ke APK/IPA file Anda
- Element selectors sesuai aplikasi Anda
- Test scenarios sesuai kebutuhan

## ⚙️ Configuration

### Web Testing

Edit `config/wdio.web.conf.ts` untuk:

- Browser capabilities (Chrome, Firefox, Safari, dll)
- Base URL
- Timeouts
- Reporter settings

### Mobile Testing

Edit `config/wdio.mobile.conf.ts` untuk:

- Platform (Android/iOS)
- Device name
- Platform version
- App path
- Appium capabilities

### API Testing

Edit k6 scripts untuk:

- Test scenarios
- Virtual users (VUs)
- Duration
- Thresholds

## 📊 Reporting

### WebdriverIO (Allure)

```bash
# Generate Allure HTML report (tanpa membuka browser)
pnpm run report:generate

# Open existing report
pnpm run report:open

# Generate dan buka report sekaligus
pnpm run report
```

Report HTML akan digenerate di folder `reports/allure-report/`. Buka `reports/allure-report/index.html` untuk melihat hasil test.

**Note:**

- `reports/allure-results/`: Berisi raw data (JSON/XML) hasil test execution.
- `reports/allure-report/`: Berisi generated HTML report yang human-readable.
- Folder `reports/` sudah di-exclude di `.gitignore`.

### k6

k6 menampilkan hasil langsung di terminal dengan metrics:

- HTTP request duration
- Success/failure rates
- Throughput
- Custom metrics

## 🔧 Customization

### Menambah Test Baru

#### Web Test

```typescript
// tests/web/mytest.test.ts
describe("My Test Suite", () => {
  it("should do something", async () => {
    await browser.url("/my-page");
    const element = await $("#my-element");
    await expect(element).toBeDisplayed();
  });
});
```

#### API Test (k6)

k6 tests dapat menggunakan helper functions dari `k6-scripts/helpers.ts`:

```typescript
// k6-scripts/my_api_test.ts
import http from "k6/http";
import { check } from "k6";
import { expectStatus, expectJsonBody, expectHeader } from "./helpers.ts";

export default function () {
  const res = http.get("https://api.example.com/endpoint");

  check(res, {
    // Check status code
    "status is 200": (r) => expectStatus(r, 200),

    // Check JSON body
    "has data": (r) => expectJsonBody(r, (data) => data.id !== undefined),

    // Check headers
    "has content-type": (r) =>
      expectHeader(r, "Content-Type", "application/json"),
  });
}
```

**Available Helper Functions:**

- `expectStatus(response, statusCode)` - Check HTTP status
- `expectJsonBody(response, matcher)` - Validate JSON response body
- `expectHeader(response, headerName, expectedValue?)` - Check response headers
- `expectSuccess(response)` - Check if status is 2xx
- `expectResponseTime(response, maxMs)` - Check response time
- `json(response)` - Parse JSON body

## 🐛 Troubleshooting

### Web Tests

- **Chrome driver issues**: WDIO akan otomatis download driver yang sesuai
- **Element not found**: Tambahkan wait/pause sebelum interaksi

### Mobile Tests

- **Appium connection failed**: Pastikan Appium server running
- **Device not found**: Cek device name dan platform version di config
- **App not found**: Update path ke APK/IPA file

### k6 Tests

- **Module not found**: k6 TypeScript support built-in, tidak perlu install types
- **Threshold exceeded**: Adjust threshold di options atau tingkatkan performa API

### Browser Use (AI Agent)

- **Model not found**: Pastikan model Ollama sudah di-pull (`ollama pull qwen3-vl`)
- **Browser not opening**: Pastikan dependencies terinstall (`pip install -r browser-use/requirements.txt`) dan Playwright browsers terinstall (`playwright install`)

## 🤖 Browser Use (AI Agent)

Project ini juga mencakup setup untuk **Browser Use**, sebuah AI agent yang dapat mengontrol browser untuk melakukan task otomatis.

### Setup

1. Masuk ke folder `browser-use`:

   ```bash
   cd browser-use
   ```

2. Buat virtual environment dan install dependencies:

   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   playwright install
   ```

3. Pastikan Ollama running dengan model yang dibutuhkan:
   ```bash
   ollama pull gpt-oss:120b-cloud
   ```

### Running

```bash
python main.py
```

Script akan membuka browser dan otomatis melakukan login ke `dev-app.tagsamurai.com`.

**Note:** Jika menggunakan cloud models, perhatikan rate limits (error 429).

## 📝 Notes

- **TypeScript**: Semua test files dan configs menggunakan TypeScript
- **k6 TypeScript**: k6 mendukung TypeScript secara native tanpa perlu transpile manual
- **WDIO Globals**: `browser`, `$`, `$$`, `expect` tersedia secara global, tidak perlu import
- **Lint Errors**: Lint errors untuk k6 types bisa diabaikan, k6 runtime akan handle dengan benar

## 🔗 Resources

- [WebdriverIO Documentation](https://webdriver.io/)
- [Grafana k6 Documentation](https://k6.io/docs/)
- [Appium Documentation](https://appium.io/docs/)
- [The Internet - Demo Website](https://the-internet.herokuapp.com)
- [JSONPlaceholder - Fake API](https://jsonplaceholder.typicode.com)

## 📄 License

ISC
