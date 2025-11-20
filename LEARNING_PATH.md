Mentransisikan QA _Manual_ menjadi _Automation Engineer_ membutuhkan perubahan pola pikir dari "klik dan lihat" menjadi "kode dan verifikasi".

Karena _stack_ yang Anda pilih (WDIO, TS, k6) adalah _stack_ yang sangat profesional dan modern, urutan pembelajarannya harus bertahap agar tidak membuat QA kewalahan di awal.

Berikut adalah urutan pembelajaran 6 Tahap yang direkomendasikan untuk QA _Manual_ Anda:

---

## 🧠 Tahap 1: Landasan Dasar Pemrograman (JavaScript & Logika)

Tujuan: Membangun pemahaman dasar tentang _bagaimana_ komputer berpikir.

| Materi                    | Fokus Utama                                                          | Output                                                                                                     |
| :------------------------ | :------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------- |
| **Dasar JavaScript (JS)** | **Variabel**, **Fungsi**, Tipe Data (`string`, `number`, `boolean`). | QA bisa menulis fungsi sederhana yang menghitung atau membandingkan data.                                  |
| **Kontrol Alur**          | `if/else`, _Loop_ (`for`, `while`).                                  | QA bisa menulis logika "Jika login sukses, maka lakukan A, jika gagal, lakukan B."                         |
| **Asynchronous**          | Konsep **Promise** dan **`async/await`**.                            | Ini krusial karena _browser_ itu lambat. QA harus mengerti kenapa perlu `await` sebelum `browser.click()`. |

---

## 💻 Tahap 2: Konsep Dasar Otomasi UI & WDIO

Tujuan: Menghubungkan logika _testing_ manual ke _script_ kode (mulai dari Web).

1.  **Arsitektur Otomasi:** Pahami bahwa WDIO adalah **Runner** (mesin yang menjalankan tes), dan **Browser Driver** (yang mengendalikan Chrome).
2.  **Identifikasi Element (Selector):** Belajar cara mengambil elemen di halaman. Ini adalah kemampuan paling penting bagi QA. Fokus pada **CSS Selector** dan **XPath** (jika perlu).
3.  **Perintah Dasar WDIO:** Memahami apa itu `browser.url()`, `$('#id').setValue()`, dan `$('#id').click()`.
4.  **Assertion:** Mengubah _step_ manual ("Pastikan teks muncul") menjadi kode: `await expect(element).toBeDisplayed()`.
5.  **Membuat Web Test Pertama:** QA membuat _script_ login/logout sederhana di _browser_ (Web Testing), menggunakan _config_ **`wdio.web.conf.ts`** yang sudah disiapkan.

---

## 🛡️ Tahap 3: Memperkenalkan TypeScript dan Struktur

Tujuan: Menambahkan _safety net_ dan membangun fondasi _monorepo_.

1.  **Transisi ke TypeScript:** Pahami bahwa TS adalah JS + **Type Safety**. Fokus pada penggunaan `string`, `number`, `boolean` di kode.
2.  **Interface untuk Kontrak:** Pahami cara membuat _Interface_ untuk mendefinisikan _payload_ yang diterima fungsi _helper_ atau data yang dikembalikan API (misalnya: `interface User { id: number; name: string; }`).
3.  **Page Object Model (POM):** Belajar mengatur kode UI menjadi _object_ terpisah (_Page Objects_) agar tes menjadi bersih dan mudah di-maintain.
4.  **Helper Functions:** Pindahkan _logic_ berulang (misal: menghitung tanggal, format data) ke _file_ `utils/` yang bisa dibagi.

---

## 🔑 Tahap 4: Menggunakan Kekuatan API & Data (k6)

Tujuan: Mengambil alih kontrol data dan _setup_. Ini adalah momen "AHA!" bagi QA.

1.  **Filosofi API Testing:** Pahami bahwa API _testing_ adalah tes _Logic_ (fungsionalitas), bukan _tampilan_.
2.  **k6 Fungsional Testing:** Belajar menulis _script_ **k6** (`k6-scripts/functional_api.ts`) untuk:
    - `http.post()` (Login / Buat Data).
    - Menggunakan _cookie_ (otomatis oleh k6).
    - Menggunakan `check()` (assertion di k6).
3.  **API Seeding (God Mode):** Gunakan _script_ k6 atau _helper_ WDIO untuk **membuat data tes** (misal: 10 user baru) dalam 5 detik, daripada membuat data secara manual lewat UI dalam 5 menit.

---

## 📱 Tahap 5: Mobile Testing dan Pelaporan

Tujuan: Menyelesaikan _full coverage_ (Web, Mobile, API) dan _reporting_.

1.  **Konsep Mobile Appium:** Pahami bahwa Appium hanya mengubah _selector_. Ganti **CSS Selector** menjadi **Accessibility ID** (atau Mobile Locator lain).
2.  **Mobile Automation:** Tulis _script_ _end-to-end_ pertama di _emulator_ menggunakan _config_ **`wdio.mobile.conf.ts`**.
3.  **Allure Reporting:** Belajar cara menjalankan `pnpm run report` dan cara menganalisis laporan. Ajarkan bagaimana _screenshot_ pada saat _failure_ bisa sangat membantu _debugging_.

---

## 📈 Tahap 6: Penguasaan & Performance

Tujuan: Membuat _script_ berjalan otomatis dan menguji _scale_.

1.  **CI/CD Basics:** Pahami cara _script_ ini bisa berjalan otomatis di GitLab/GitHub/Jenkins (integrasi dengan **pnpm run**).
2.  **Load Testing (k6):** Belajar mengubah _script_ fungsional k6 menjadi _load test_ dengan mengatur opsi `vus` (Virtual Users) dan `duration`.
3.  **Maintenance:** Fokus pada bagaimana membuat _test case_ tahan banting (_robust_) dan tidak mudah _flaky_.
