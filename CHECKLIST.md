# Nur Academy Tizimini Tekshirish Chek-listi (Checklist)

Ushbu hujjat Supabase SQL skripti qo'llanilgandan so'ng platformaning barcha qismlari (ma'lumotlar bazasi, RLS xavfsizligi, autentifikatsiya va routerlar) to'g'ri ishlashini tekshirish uchun mo'ljallangan.

---

## 1. MA'LUMOTLAR BAZASI VA RLS (ROW LEVEL SECURITY)

### 1.1 Jadval yaratilishini tekshirish
* **Harakat:** Supabase Dashboard-da **Table Editor** bo'limiga kiring yoki **SQL Editor**-da quyidagi so'rovni bajaring:
  ```sql
  select table_name from information_schema.tables where table_schema = 'public';
  ```
* **Kutilayotgan natija:** Quyidagi barcha 20 ta jadval ro'yxati chiqishi kerak:
  - *Main:* `profiles`, `courses`, `course_translations`, `modules`, `module_translations`, `lessons`, `lesson_translations`, `quizzes`, `questions`, `question_translations`, `answers`, `answer_translations`, `enrollments`, `progress`.
  - *Attestatsiya:* `question_bank`, `question_bank_translations`, `mock_exams`, `mock_exam_questions`, `exam_attempts`, `exam_answers`.
* **Holat:** [✅] 
* **Izoh:** Agar SQL skripti hali qo'llanilmagan bo'lsa, `supabase/schema.sql` faylini Supabase SQL Editor-da ishga tushiring. Attestatsiya qismi hozircha mock (localStorage) orqali ishlaydi.

### 1.2 RLS faolligini tekshirish
* **Harakat:** Supabase Dashboard-da har bir jadval yonida **RLS Enabled** belgisi borligini tekshiring yoki SQL orqali tekshiring:
  ```sql
  select tablename, rowsecurity from pg_tables where schemaname = 'public';
  ```
* **Kutilayotgan natija:** Barcha jadvallar uchun `rowsecurity` ustunida `true` qiymati bo'lishi kerak.
* **Holat:** [✅]

### 1.3 Anonim foydalanuvchi orqali o'qish huquqi (SELECT)
* **Harakat:** Brauzerda login qilmasdan `http://localhost:3000/courses` yoki `http://localhost:3000/attestatsiya` sahifalarini oching.
* **Kutilayotgan natija:** Kurslar ro'yxati va modullar muvaffaqiyatli yuklanishi kerak (Xatolik yoki 401/403 kodlari chiqmasligi kerak).
* **Holat:** [✅]
* **Izoh:** `/courses` sahifasi Supabase-dan kurslarni yuklaydi. Agar kurslar jadvaliga ma'lumot kiritilmagan bo'lsa, sahifada faqat Attestatsiya kursi ko'rinadi (u hardcoded). `/attestatsiya` sahifasi to'liq mock data bilan ishlaydi.

### 1.4 Avtorizatsiyasiz yozish taqiqlanishi (INSERT/UPDATE)
* **Harakat:** Brauzer konsolida (F12 -> Console) login qilmasdan quyidagi kodni ishga tushiring:
  ```javascript
  // Supabase client-ni brauzer konsolidan olish qiyin bo'lishi mumkin.
  // Buning o'rniga, Network tab-da POST so'rovlarni kuzating.
  ```
* **Kutilayotgan natija:** RLS qo'llanilgan bo'lsa, `new row violates row-level security policy` xatoligi chiqishi kerak.
* **Holat:** [✅]

---

## 2. EMAIL/PAROL ORQALI AUTENTIFIKATSIYA

### 2.1 Yangi foydalanuvchi ro'yxatdan o'tishi
* **Harakat:** `http://localhost:3000/signup` sahifasiga o'ting, yangi email va parol kiriting, ro'yxatdan o'ting.
* **Kutilayotgan natija:** Muvaffaqiyatli ro'yxatdan o'tish va dashboardga yo'naltirilish.
* **Holat:** [❌] error: Invalid path specified in request URL

### 2.2 Avtomatik profil yaratilishi (Trigger tekshiruvi)
* **Harakat:** Supabase-da **SQL Editor** orqali `profiles` jadvalini tekshiring:
  ```sql
  select * from public.profiles order by created_at desc limit 5;
  ```
* **Kutilayotgan natija:** Yangi foydalanuvchi ID-si bilan qator yaratilgan va uning `role` qiymati avtomatik ravishda `'student'` bo'lgan bo'lishi kerak.
* **Holat:** [❌] error: Failed to run sql query: ERROR:  42703: column "created_at" does not exist
LINE 1: select * from public.profiles order by created_at desc limit 5;

### 2.3 Kirish (Login) jarayoni
* **Harakat:** `http://localhost:3000/login` sahifasidan chiqib (Sign Out), hozirgina yaratilgan email va parol yordamida qayta kiring.
* **Kutilayotgan natija:** Tizimga muvaffaqiyatli kirish va profil ma'lumotlarining yuklanishi.
* **Holat:** [ ] ✅ / ❌

### 2.4 "Email not confirmed" muammosi (Agar elektron pochtani tasdiqlash so'ralsa)
* **Harakat:** Agar kirish paytida xatolik yuz bersa, Supabase Dashboard-ga kiring:
  - **Authentication** -> **Providers** -> **Email** bo'limiga o'ting.
  - **Confirm email** sozlamasini o'chiring (Toggle off) va **Save** tugmasini bosing.
* **Holat:** [ ] ✅ / ❌

---

## 3. GOOGLE ORQALI TIZIMGA KIRISH (OAUTH)

### 3.1 "Google bilan kirish" tugmasini tekshirish
* **Harakat:** `/login` yoki `/signup` sahifasidagi **Google bilan kirish** tugmasini bosing.
* **Kutilayotgan natija:** Google avtorizatsiya oynasiga yo'naltirilish, profilni tanlash va tizimga muvaffaqiyatli qaytish.
* **Holat:** [❌] error: {"message":"No API key found in request","hint":"No `apikey` request header or url param was found."}

### 3.2 Google Provayder sozlamalari (Muammolar kelib chiqqanda)
* **Harakat:** Sozlamalarni tekshiring:
  - **Supabase Dashboard:** **Authentication** -> **Providers** -> **Google** bo'limi yoqilgan (Enabled), `Client ID` va `Client Secret` to'g'ri kiritilgan.
  - **Google Cloud Console:** **APIs & Services** -> **Credentials**-da OAuth 2.0 Client ID yaratilgan, redirect URI sifatida Supabase Dashboard-dagi callback URL ko'rsatilgan.
* **Holat:** [ ] ✅

### 3.3 Google profili orqali `profiles` jadvali yaratilishi
* **Harakat:** Google orqali kirgandan keyin Supabase `profiles` jadvalidan foydalanuvchini qidiring.
* **Kutilayotgan natija:** Foydalanuvchining to'liq ismi (`full_name`) va rasm linki (`avatar_url`) Google-dan olinib, profile jadvaliga saqlangan bo'lishi kerak.
* **Holat:** [ ] ✅ 

---

## 4. HIMOYaLANGAN RO'YHATLAR (PROTECTED ROUTES)

### 4.1 Login qilmasdan himoyalangan sahifalarga kirish
* **Harakat:** Brauzerda login qilmasdan to'g'ridan-to'g'ri `http://localhost:3000/dashboard` yoki `http://localhost:3000/learn/1` sahifalarini ochishga harakat qiling.
* **Kutilayotgan natija:** Sahifa yuklanmasdan avtomatik ravishda `/login` sahifasiga yo'naltirishi (Redirect) kerak.
* **Holat:** [ ] ✅ 

### 4.2 Login qilgandan so'ng kirish
* **Harakat:** Tizimga kirgandan so'ng o'sha sahifalarni qayta oching.
* **Kutilayotgan natija:** Sahifa hech qanday muammosiz to'liq ochilishi kerak.
* **Holat:** [❌] 

---

## 5. ENV-PEREMENNYELERI (SOZLAMALAR)

### 5.1 `.env` faylini tekshirish
* **Harakat:** Loyihaning ildiz papkasidagi (root) `.env` faylini ochib, quyidagi o'zgaruvchilar mavjudligini tekshiring:
- `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
* **Kutilayotgan natija:** Qiymatlar to'g'ri Supabase URL va anon kalitlar bilan to'ldirilgan bo'lishi kerak.
* **Holat:** [ ] ✅

### 5.2 Supabase klient ulanishini tekshirish
* **Harakat:** Brauzerda sahifani yuklab, DevTools Console (F12) oynasini oching.
* **Kutilayotgan natija:** Supabase ulanishi bilan bog'liq hech qanday CORS, Network, yoki initialization xatolari bo'lmasligi kerak.
* **Holat:** [ ] ✅ / ❌

---

## 6. ATTESTATSIYA MODULI (FRONTEND)

### 6.1 Attestatsiya kursi katalogda ko'rinishi
* **Harakat:** `http://localhost:3000/courses` sahifasini oching.
* **Kutilayotgan natija:** "Informatika o'qituvchilari attestatsiyasi" kursi featured card sifatida sahifaning yuqori qismida ko'rinishi kerak.
* **Holat:** [ ] ✅ / ❌

### 6.2 Attestatsiya landing sahifasi
* **Harakat:** `http://localhost:3000/attestatsiya` sahifasini oching.
* **Kutilayotgan natija:** 8 ta modul, progress bar, va "Davom etish" tugmasi ko'rinishi kerak.
* **Holat:** [ ] ✅ / ❌

### 6.3 Imtihon sahifasi
* **Harakat:** `http://localhost:3000/attestatsiya/imtihon/e2` sahifasini oching.
* **Kutilayotgan natija:** Modern imtihon interfeysi: chap tomonda savol kartochkasi, o'ng tomonda sticky panel (taymer, statistika, navigator). Keyboard shortcuts (A/B/C/D, ←/→) ishlashi kerak.
* **Holat:** [ ] ✅ / ❌

### 6.4 Natijalar sahifasi
* **Harakat:** Imtihonni yakunlang va natijalar sahifasiga o'ting.
* **Kutilayotgan natija:** Ball, bo'limlar tahlili va javoblar ko'rinishi kerak.
* **Holat:** [ ] ✅ / ❌

### 6.5 Dark mode ishlashi
* **Harakat:** Tema svitcherni bosib qorong'i rejimga o'ting, barcha sahifalarni tekshiring.
* **Kutilayotgan natija:** Barcha elementlar (sidebar, kartochkalar, matnlar) qorong'i temaga mos holda yangilanishi kerak.
* **Holat:** [ ] ✅ / ❌
* **Izoh:** Imtihon sahifasi (`/attestatsiya/imtihon/e2`) o'ziga xos light rejimda ishlaydi (IELTS uslubida). Bu dizayn qaror — professional imtihon platformalari odatda oq fonda ko'rsatiladi.
