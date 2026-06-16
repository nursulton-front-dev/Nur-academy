export interface Lesson {
  id: string;
  title: string;
  content: string; // Markdown text
  status: 'completed' | 'current' | 'locked';
  moduleId: string;
  videoUrl?: string;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  status: 'completed' | 'current' | 'locked';
  description: string;
}

export interface MockExam {
  id: string;
  title: string;
  status: 'not_started' | 'completed' | 'locked';
  score: number | null; // out of 100
  questionsCount: number;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  moduleId: string; // references Module.id or category
  explanation?: string;
}

export interface TopicTest {
  id: string;
  title: string;
  moduleId: string;
  questionsCount: number;
  status: 'not_started' | 'completed' | 'locked';
  score: number | null;
}

export interface ExamResult {
  examId: string;
  score: number; // e.g., 78
  totalQuestions: number;
  moduleScores: {
    [moduleId: string]: {
      correct: number;
      total: number;
      title: string;
    };
  };
  userAnswers: {
    [questionId: string]: number; // selectedOptionIndex
  };
}

// 8 Modules Mock Data
export const mockModules: Module[] = [
  {
    id: "m1",
    title: "1. Axborot va raqamli savodxonlik",
    status: "completed",
    description: "Axborot tushunchasi, uning turlari, xossalari, axborot jarayonlari va kompyuter savodxonligi asoslari.",
    lessons: [
      {
        id: "l1_1",
        moduleId: "m1",
        title: "Axborot, ma'lumot va bilim",
        status: "completed",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        content: `# 📖 1.1-Dars: Axborot, ma'lumot va bilim tushunchalari

---

## 🌟 Kirish

Raqamli texnologiyalar asrida biz har soniyada ulkan hajmdagi ma'lumotlar bilan to'qnash kelamiz. Biroq, ularning barchasi ham foydali bilimga aylanaveradimi? Keling, ushbu darsda **Ma'lumot (Data)**, **Axborot (Information)** va **Bilim (Knowledge)** tushunchalari hamda ularning o'zaro bog'liqligini ko'rib chiqamiz.

---

## 🔍 1. Ma'lumot, Axborot va Bilim: Farqi nimada?

Ushbu uchta tushuncha ta'lim va texnologiyaning asosi hisoblanadi. Ular ma'lum bir zanjir orqali rivojlanib boradi:

### 📥 1. Ma'lumot (Data)
Bu qayta ishlanmagan, kontekstga ega bo'lmagan, xom faktlar, raqamlar yoki belgilar yig'indisidir. Ma'lumot o'z-o'zidan inson uchun hech qanday ma'no kasb etmaydi.
> **Misollar:**
> - \`25\` (shunchaki raqam)
> - \`"Tashkent"\` (shunchaki matn)
> - \`14:30\` (shunchaki vaqt ko'rsatkichi)

### 📊 2. Axborot (Information)
Bu muayyan shaklga keltirilgan, ma'noga ega bo'lgan va ma'lum bir kontekstda taqdim etilgan ma'lumotlardir. U inson savollariga javob beradi.
> **Misollar:**
> - *"Bugun havo harorati 25°C."* (Endi raqam kontekstga ega)
> - *"Toshkentdan poyezd soat 14:30 da jo'naydi."* (Endi vaqt va shahar ma'noga ega)

### 🧠 3. Bilim (Knowledge)
Bu axborotni tushunish, tahlil qilish va undan amaliyotda, hayotiy vaziyatlarda foydalanish qobiliyatidir. Bilim insonga qaror qabul qilish va harakat qilish imkonini beradi.
> **Misollar:**
> - *"Bugun havo 25°C ekan, demak, yengil kiyim kiyishim kerak, aks holda issiqlab ketaman."*
> - *"Poyezd jo'nashiga 30 daqiqa qoldi, kechikmaslik uchun hoziroq yo'lga chiqishim kerak."*

---

### ⛓️ Axborot zanjiri ko'rinishi:
\`\`\`
[ 📥 Ma'lumot ] ━━(Qayta ishlash & Kontekst)━━> [ 📊 Axborot ] ━━(Tushunish & Amaliyot)━━> [ 🧠 Bilim ]
\`\`\`

---

## ⚡ 2. Axborotning Asosiy Xossalari

Har qanday axborot qabul qiluvchi uchun qimmatli bo'lishi uchun quyidagi sifat ko'rsatkichlariga ega bo'lishi shart:

| Xossa | Tavsif | Hayotiy Misol |
| :--- | :--- | :--- |
| **1. To'liqlik** | Qaror qabul qilish uchun barcha kerakli ma'lumotlarning mavjudligi. | *"Dars soat 9:00 da boshlanadi"* (Agar xona aytilmasa, to'liq bo'lmaydi). |
| **2. Ishonchlilik** | Axborotning haqiqatga mos kelishi va xatolardan xoli bo'lishi. | Rasmiy manbalardan olingan ob-havo ma'lumoti. |
| **3. Dolzarblik** | Axborotning ayni vaqtdagi ahamiyati va eskirib qolmaganligi. | *"Bugungi poyezdlar jadvali"* (O'tgan yilgi jadval dolzarb emas). |
| **4. Tushunarlilik** | Axborotning qabul qiluvchi uchun qulay shaklda va tilda berilishi. | O'quvchiga uning ona tilida yozilgan darslik. |
| **5. Aniqlik** | Axborotning noaniqliklarsiz, aniq faktlarga tayanib taqdim etilishi. | Matematik formulalar va hisob-kitoblar. |

---

## 💻 3. Kompyuterda Axborotni Kodlashtirish

Kompyuter faqat raqamli elektron signallar bilan ishlaydi. Shuning uchun har qanday axborot (matn, tasvir, tovush) **ikkilik (binary)** ko'rinishga — \`0\` va \`1\` raqamlariga o'tkaziladi.

* **Bit (binary digit)** — axborotning eng kichik o'lchov birligi bo'lib, \`0\` yoki \`1\` qiymatni oladi.
* **Bayt (Byte)** — kompyuterda bitta belgini (harf, raqam yoki belgi) saqlash uchun ishlatiladigan asosiy xotira birligi. **1 Bayt = 8 bit.**

### 📈 Axborot Hajmi Birliklari:
* **1 Bayt** = 8 bit
* **1 Kilobayt (KB)** = 1024 Bayt
* **1 Megabayt (MB)** = 1024 KB
* **1 Gigabayt (GB)** = 1024 MB
* **1 Terabayt (TB)** = 1024 GB

---

## 🧮 4. Amaliy Hisoblash Masalalari

### 📝 Masala 1: Matn hajmini hisoblash (ASCII va Unicode)
* **ASCII kodlash** tizimida 1 ta belgi = **1 bayt** (8 bit).
* **Unicode (UTF-16) kodlash** tizimida 1 ta belgi = **2 bayt** (16 bit).

> **Savol:** \`"Nur Academy"\` matni xotirada qancha joy egallaydi?
> **Yechish:**
> 1. Belgilar sonini sanaymiz: \`N-u-r-[bo'shliq]-A-c-a-d-e-m-y\` = **11 ta belgi** (bo'shliq ham belgi hisoblanadi!).
> 2. **ASCII tizimida:** 11 belgi × 1 bayt = **11 bayt** (yoki 88 bit).
> 3. **Unicode tizimida:** 11 belgi × 2 bayt = **22 bayt** (yoki 176 bit).

### 🌐 Masala 2: Internet tezligi va yuklash vaqti
Internet tezligi odatda **bit/sekund (bps)** yoki **Megabit/sekund (Mbit/s)** larda o'lchanadi. Fayllar hajmi esa **Megabayt (MB)** larda bo'ladi.

> **Qoida:** \`Mbit/s\` ni \`MB/s\` ga o'tkazish uchun tezlikni **8** ga bo'lamiz (chunki 1 bayt = 8 bit).
> 
> **Savol:** Internet tezligi \`8 Mbit/s\` bo'lsa, \`20 MB\` hajmli fayl necha sekundda yuklanadi?
> **Yechish:**
> 1. Tezlikni baytga o'tkazamiz: 8 Mbit/s ÷ 8 = **1 MB/s**.
> 2. Vaqtni hisoblaymiz: 20 MB ÷ 1 MB/s = **20 sekund**.`
      },
      {
        id: "l1_2",
        moduleId: "m1",
        title: "Raqamli etika va mualliflik huquqi",
        status: "completed",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        content: `# ⚖️ 1.2-Dars: Raqamli etika va mualliflik huquqi

---

## 🌟 Kirish

Internet faqat axborot almashish maydoni emas, balki o'z qonun-qoidalari va madaniyatiga ega bo'lgan ulkan ijtimoiy muhitdir. Raqamli dunyoda xavfsiz va samarali ishlash uchun har bir foydalanuvchi **raqamli etika** va **mualliflik huquqi** qoidalarini yaxshi bilishi lozim.

---

## 🤝 1. Raqamli Etika (Netiquette) Nima?

**Raqamli etika** — bu internet tarmog'ida muloqot qilish, hamkorlik qilish va ma'lumot tarqatishda insoniy va axloqiy me'yorlarga rioya qilishdir.

### 📜 Netiketning Asosiy Oltin Qoidalari:
1. **Insoniylikni unutmang:** Ekran ortida ham siz kabi his-tuyg'ularga ega inson borligini yodda tuting. Haqoratli so'zlar yoki "kiberbulling" (tarmoqdagi zo'ravonlik) dan saqlaning.
2. **Shaxsiy chegaralarni hurmat qiling:** Boshqa foydalanuvchilarning ruxsatisiz ularning shaxsiy ma'lumotlari yoki fotosuratlarini tarqatmang.
3. **Muloqot madaniyati:** Katta harflar bilan yozmang (internetda bu BAQIRISH deb qabul qilinadi), imlo qoidalariga rioya qiling.
4. **Feyk ma'lumotlar tarqatmang:** Ishonchsiz va tasdiqlanmagan xabarlarni tarqatishdan saqlaning.

---

## 🔒 2. Mualliflik Huquqi (Copyright)

**Mualliflik huquqi** — bu intellektual mulk egasining (matn, rasm, video, dasturiy kod, musiqa yaratuvchisining) o'z asaridan foydalanish ustidan qonuniy nazorat huquqidir.
* Mualliflik huquqi asar yaratilgan paytdan boshlab avtomatik ravishda kuchga kiradi va maxsus ro'yxatdan o'tkazishni talab qilmydi.
* Belgisi: **© (Copyright)**.

### 🚫 Mualliflik huquqi buzilishi turlari:
* **Piratchilik (Piracy):** Dasturlar, filmlar yoki kitoblarni noqonuniy nusxalash va tarqatish.
* **Ruxsatsiz tijoriy foydalanish:** Birovning rasmi yoki dizaynini o'z mahsulotida sotish maqsadida ishlatish.

---

## 📝 3. Plagiat va Sitatsiya (Iqtibos keltirish)

### 📌 Plagiat nima?
**Plagiat** — boshqa muallifning matnini, g'oyasini yoki tadqiqot natijalarini o'zlashtirib, go'yoki o'zining shaxsiy ishi sifatida taqdim etishdir.

### 💡 Plagiatning oldini olish usuli — Sitatsiya (Citation):
Internetdagi manbalardan foydalanganingizda, har doim haqiqiy muallif va manbani (havolani) ko'rsating.
Masalan: *"Tadqiqotchi A. Karimovning fikriga ko'ra, ..." [Manba: www.nuracademy.uz]*.

---

## 🏷️ 4. Litsenziya Turlari va Ochiq Manbalar

Mualliflik huquqi bilan himoyalangan asarlardan foydalanish shartlari **litsenziya** shartnomasi orqali tartibga solinadi.

| Litsenziya turi | Tavsif | Foydalanish shartlari | Misollar |
| :--- | :--- | :--- | :--- |
| **All Rights Reserved** | To'liq mualliflik huquqi. | Foydalanish uchun muallifning shaxsiy yoki yozma ruxsati shart. | Microsoft Windows, Adobe Photoshop. |
| **Creative Commons (CC)** | Moslashuvchan litsenziya. | Muallif ma'lum shartlar asosida (tijoriy maqsadda bo'lmagan, muallifni ko'rsatish) foydalanishga ruxsat beradi. | Wikipedia matnlari, ko'plab ilmiy maqolalar. |
| **Open Source (Ochiq kodli)** | Dasturiy ta'minot litsenziyasi. | Dasturning manba kodini erkin ko'rish, o'zgartirish va o'zgartirilgan holda tarqatish mumkin. | Linux operatsion tizimi, Python tili. |

---

## 🛡️ 5. Shaxsiy Ma'lumotlar Xavfsizligi va Fishing

Raqamli etikaning muhim qismi bu shaxsiy xavfsizlik va boshqalarning ma'lumotlarini himoya qilishdir:

* **Parollar xavfsizligi:** Hech qachon parollaringizni uchinchi shaxslarga bermang. Kamida 8-12 belgili, belgilar va raqamlardan iborat murakkab parollar ishlating.
* **Fishing (Phishing) xavfi:** Fishing — bu firgarlarning sizning parolingiz yoki plastik karta ma'lumotlaringizni o'g'irlash uchun yaratgan soxta havolalari (masalan, Telegram yutuqlari, soxta bank saytlari). Noma'lum havolalarni aslo bosmang!
* **Ikki bosqichli tasdiqlash (2FA):** Barcha akkauntlaringizda (Telegram, Gmail, Supabase) qo'shimcha tasdiqlash kodini yoqing.`
      }
    ]
  },
  {
    id: "m2",
    title: "2. Kompyuter tizimlari va Office",
    status: "completed",
    description: "Kompyuter qurilmalari, operatsion tizimlar va Word, Excel, PowerPoint dasturlarida ishlash.",
    lessons: [
      {
        id: "l2_1",
        moduleId: "m2",
        title: "Kompyuterning arxitekturasi va apparat ta'minoti",
        status: "completed",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        content: `### Kompyuterning apparat ta'minoti (Hardware)

Kompyuter ikkita asosiy qismdan iborat: **Apparat ta'minoti (Hardware)** va **Dasturiy ta'minot (Software)**.

#### Ichki qurilmalar:
* **Markaziy protsessor (CPU)** — kompyuterning 'miya'si, barcha hisoblashlarni amalga oshiradi.
* **Tezkor xotira (RAM)** — vaqtinchalik ma'lumotlarni saqlaydi, elektr o'chganda ma'lumotlar o'chib ketadi.
* **Qattiq disk (HDD/SSD)** — ma'lumotlarni uzoq muddat saqlash qurilmasi.
* **Ona plata (Motherboard)** — barcha qurilmalarni birlashtiruvchi plata.`
      },
      {
        id: "l2_2",
        moduleId: "m2",
        title: "MS Excel dasturi bilan ishlash",
        status: "completed",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        content: `### MS Excel dasturi va formulalar

Excel elektron jadvallar bilan ishlash uchun mo'ljallangan dastur bo'lib, hisob-kitoblar va ma'lumotlar tahlilida keng qo'llaniladi.

#### Mashhur funksiyalar:
* \`=SUM(A1:A10)\` — belgilangan kataklardagi sonlar yig'indisini hisoblaydi.
* \`=AVERAGE(A1:A10)\` — o'rtacha arifmetik qiymatni topadi.
* \`=IF(A1>50; \"O'tdi\"; \"Yiqildi\")\` — mantiqiy shartni tekshiradi.`
      }
    ]
  },
  {
    id: "m3",
    title: "3. Mantiq va sanoq sistemalari",
    status: "current",
    description: "Sanoq sistemalari orasida o'tishlar, mantiqiy amallar va algebraik ifodalar.",
    lessons: [
      {
        id: "l3_1",
        moduleId: "m3",
        title: "Sanoq sistemalari: Ikkilik, Sakkizlik va O'n oltilik",
        status: "completed",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        content: `### Sanoq sistemalari

Sanoq sistemalari ikki turga bo'linadi: **pozitsiyali** va **pozitsiyasiz** (masalan, Rim raqamlari).

#### Pozitsiyali sanoq sistemalari:
* **Ikkilik (Binary)** — {0, 1}
* **Sakkizlik (Octal)** — {0, 1, 2, 3, 4, 5, 6, 7}
* **O'nlik (Decimal)** — {0..9}
* **O'n oltilik (Hexadecimal)** — {0..9, A, B, C, D, E, F}

*Misol:* O'nlik sanoq sistemasidagi 10 soni ikkilikda \`1010\` ga teng.`
      },
      {
        id: "l3_2",
        moduleId: "m3",
        title: "Mantiqiy amallar va jadvallar",
        status: "current",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        content: `### Mantiq algebrasi va amallar

Mantiq algebrasi mantiqiy o'zgaruvchilar ustida amallarni o'rganadi. Qiymatlar faqat **Rost (1)** yoki **Yolg'on (0)** bo'lishi mumkin.

#### Asosiy mantiqiy amallar:
1. **Konyunksiya (Mantiqiy VA / AND)** — ko'paytirish, ikkala ifoda ham rost bo'lgandagina rost bo'ladi. Symbol: \`&\`, \`∧\`.
2. **Dizyunksiya (Mantiqiy YOKI / OR)** — qo'shish, kamida bitta ifoda rost bo'lsa rost bo'ladi. Symbol: \`|\`, \`∨\`.
3. **Inkor (Mantiqiy EMAS / NOT)** — teskariga o'girish. Symbol: \`¬\`.`
      },
      {
        id: "l3_3",
        moduleId: "m3",
        title: "Mantiqiy sxemalar va qonunlar",
        status: "locked",
        content: `### Mantiqiy sxemalar

Kompyuter arxitekturasida signallarni qayta ishlash uchun mantiqiy elementlar (klapanlar) ishlatiladi:
* AND ventili
* OR ventili
* NOT ventili

Mantiqiy qonunlar (de Morgan qonunlari, tarqatish qonuni) mantiqiy ifodalarni soddalashtirish uchun xizmat qiladi.`
      }
    ]
  },
  {
    id: "m4",
    title: "4. Dasturlash va ma'lumotlar bazasi",
    status: "locked",
    description: "Python dasturlash tili, algoritmlash asoslari va SQL ma'lumotlar bazasi.",
    lessons: [
      {
        id: "l4_1",
        moduleId: "m4",
        title: "Python-da ma'lumot turlari va operatorlar",
        status: "locked",
        content: `### Python ma'lumot turlari

Python - dinamik tiplashga ega yuqori darajali dasturlash tili.

#### Asosiy ma'lumot turlari:
* \`int\` — butun sonlar (masalan: 12)
* \`float\` — haqiqiy sonlar (masalan: 3.14)
* \`str\` — satr (masalan: "Nur Academy")
* \`bool\` — mantiqiy (True/False)`
      },
      {
        id: "l4_2",
        moduleId: "m4",
        title: "SQL asoslari va ma'lumotlar bazasi",
        status: "locked",
        content: `### Relatsion ma'lumotlar bazasi va SQL

SQL (Structured Query Language) - ma'lumotlar bazasini boshqarish tili.

#### Asosiy buyruqlar:
* \`SELECT\` — ma'lumotlarni o'qish
* \`INSERT\` — yangi ma'lumot qo'shish
* \`UPDATE\` — ma'lumotni tahrirlash
* \`DELETE\` — ma'lumotni o'chirish`
      }
    ]
  },
  {
    id: "m5",
    title: "5. Grafika va veb-texnologiyalar",
    status: "locked",
    description: "Vektor va rastrli grafika dasturlari, HTML va CSS yordamida veb-saytlar yaratish.",
    lessons: [
      {
        id: "l5_1",
        moduleId: "m5",
        title: "Rastrli va vektorli grafika",
        status: "locked",
        content: `### Grafika turlari

Kompyuter grafikasi ikki turga bo'linadi:
1. **Rastrli grafika** — piksellardan tashkil topadi (masalan: JPEG, PNG). Kattalashtirilganda sifat yo'qoladi.
2. **Vektorli grafika** — geometrik shakllar va formulalardan tashkil topadi (masalan: SVG). Kattalashtirilganda sifat buzilmaydi.`
      },
      {
        id: "l5_2",
        moduleId: "m5",
        title: "HTML va CSS asoslari",
        status: "locked",
        content: `### Veb-sahifalar yaratish

* **HTML (HyperText Markup Language)** — veb-sahifaning tuzilishi va strukturasini belgilaydi.
* **CSS (Cascading Style Sheets)** — veb-sahifaga ko'rinish va dizayn beradi.`
      }
    ]
  },
  {
    id: "m6",
    title: "6. Tarmoqlar",
    status: "locked",
    description: "Tarmoq protokollari, IP-manzillar, OSI modeli va internet texnologiyalari.",
    lessons: [
      {
        id: "l6_1",
        moduleId: "m6",
        title: "Kompyuter tarmoqlari va OSI modeli",
        status: "locked",
        content: `### OSI modeli (Open Systems Interconnection)

OSI modeli tarmoqdagi qurilmalararo aloqani tushuntirish uchun 7 ta bosqichga bo'lingan:
1. Jismoniy (Physical)
2. Kanal (Data Link)
3. Tarmoq (Network) — IP protokoli ishlaydi
4. Transport (Transport) — TCP/UDP protokollari
5. Seans (Session)
6. Taqdimot (Presentation)
7. Ilova (Application) — HTTP, FTP, SMTP`
      }
    ]
  },
  {
    id: "m7",
    title: "7. Xavfsizlik va raqamli xizmatlar",
    status: "locked",
    description: "Kiberxavfsizlik, shifrlash usullari va elektron hukumat xizmatlaridan foydalanish.",
    lessons: [
      {
        id: "l7_1",
        moduleId: "m7",
        title: "Kiberxavfsizlik va parollar xavfsizligi",
        status: "locked",
        content: `### Shaxsiy xavfsizlik qoidalari

* Murakkab parollardan foydalanish (kamida 8 ta belgi, katta-kichik harflar, raqamlar va belgilar).
* Ikki faktorli autentifikatsiyani (2FA) yoqish.
* Fishing (Phishing) hujumlaridan ehtiyot bo'lish.`
      }
    ]
  },
  {
    id: "m8",
    title: "8. Pedagogika va metodika",
    status: "locked",
    description: "Informatika o'qitish metodikasi, zamonaviy pedagogik texnologiyalar va baholash mezonlari.",
    lessons: [
      {
        id: "l8_1",
        moduleId: "m8",
        title: "Zamonaviy informatika darsining metodikasi",
        status: "locked",
        content: `### Pedagogik yondashuvlar

Informatika darslarida amaliy va loyihaga yo'naltirilgan ta'lim (Project-based learning) juda muhim ahamiyatga ega. O'quvchilarda tanqidiy fikrlash (Critical thinking) va muammolarni hal qilish (Problem solving) ko'nikmalarini shakllantirish zarur.`
      }
    ]
  }
];

// Topic Tests (Mavzu testlari) - 8 items
export const mockTopicTests: TopicTest[] = [
  { id: "t1", title: "Axborot va raqamli savodxonlik testi", moduleId: "m1", questionsCount: 15, status: "completed", score: 85 },
  { id: "t2", title: "Kompyuter tizimlari va Office testi", moduleId: "m2", questionsCount: 15, status: "completed", score: 90 },
  { id: "t3", title: "Mantiq va sanoq sistemalari testi", moduleId: "m3", questionsCount: 20, status: "not_started", score: null },
  { id: "t4", title: "Dasturlash va ma'lumotlar bazasi testi", moduleId: "m4", questionsCount: 20, status: "locked", score: null },
  { id: "t5", title: "Grafika va veb-texnologiyalar testi", moduleId: "m5", questionsCount: 15, status: "locked", score: null },
  { id: "t6", title: "Tarmoqlar boʻyicha test", moduleId: "m6", questionsCount: 15, status: "locked", score: null },
  { id: "t7", title: "Xavfsizlik va raqamli xizmatlar testi", moduleId: "m7", questionsCount: 15, status: "locked", score: null },
  { id: "t8", title: "Pedagogika va metodika testi", moduleId: "m8", questionsCount: 20, status: "locked", score: null }
];

// 12 Mock Exams (Mock imtihonlar)
export const mockExams: MockExam[] = [
  { id: "e1", title: "Mock Imtihon #1 (O'tgan yillardagi savollar)", status: "completed", score: 78, questionsCount: 50 },
  { id: "e2", title: "Mock Imtihon #2 (Kengaytirilgan variant)", status: "not_started", score: null, questionsCount: 50 },
  { id: "e3", title: "Mock Imtihon #3 (Nazariy savollar to'plami)", status: "not_started", score: null, questionsCount: 50 },
  { id: "e4", title: "Mock Imtihon #4 (Mantiq va Dasturlashga yo'naltirilgan)", status: "locked", score: null, questionsCount: 50 },
  { id: "e5", title: "Mock Imtihon #5 (Pedagogika va Metodika integratsiyasi)", status: "locked", score: null, questionsCount: 50 },
  { id: "e6", title: "Mock Imtihon #6 (Kompyuter va Tarmoqlar)", status: "locked", score: null, questionsCount: 50 },
  { id: "e7", title: "Mock Imtihon #7 (Yillik attestatsiya varianti)", status: "locked", score: null, questionsCount: 50 },
  { id: "e8", title: "Mock Imtihon #8 (Kiberxavfsizlik va Grafik dizayn)", status: "locked", score: null, questionsCount: 50 },
  { id: "e9", title: "Mock Imtihon #9 (Oliy toifa savollari)", status: "locked", score: null, questionsCount: 50 },
  { id: "e10", title: "Mock Imtihon #10 (Birinchi toifa savollari)", status: "locked", score: null, questionsCount: 50 },
  { id: "e11", title: "Mock Imtihon #11 (Ikkinchi toifa savollari)", status: "locked", score: null, questionsCount: 50 },
  { id: "e12", title: "Mock Imtihon #12 (Yakuniy nazorat)", status: "locked", score: null, questionsCount: 50 }
];

// 50 Questions for Exam e1 and e2
export const mockQuestions: Question[] = [
  // Module 1 (1-15)
  {
    id: "q1",
    moduleId: "m1",
    text: "Qayta ishlanmagan, kontekstsiz xom faktlar va raqamlar qanday ataladi?",
    options: [
      "Ma'lumot (data)",
      "Axborot (information)",
      "Bilim (knowledge)",
      "Signal"
    ],
    correctOptionIndex: 0,
    explanation: "Qayta ishlanmagan, kontekstsiz xarakterdagi faktlar va raqamlar ma'lumot (data) deyiladi."
  },
  {
    id: "q2",
    moduleId: "m1",
    text: "Quyidagilardan qaysi biri axborotning asosiy xossalariga kirmaydi?",
    options: [
      "To'liqlik",
      "Ishonchlilik",
      "Rang",
      "Dolzarblik"
    ],
    correctOptionIndex: 2,
    explanation: "Rang axborotning xossasi emas. Asosiy xossalariga to'liqlik, ishonchlilik, aniqlik, dolzarblik va tushunarlilik kiradi."
  },
  {
    id: "q3",
    moduleId: "m1",
    text: "1 bayt nechta bitga teng?",
    options: [
      "4 bit",
      "8 bit",
      "16 bit",
      "1024 bit"
    ],
    correctOptionIndex: 1,
    explanation: "1 bayt har doim 8 bitga teng."
  },
  {
    id: "q4",
    moduleId: "m1",
    text: "1 Mbayt necha baytga teng?",
    options: [
      "1000 bayt",
      "1024 bayt",
      "1024 Kbayt",
      "1024 Gbayt"
    ],
    correctOptionIndex: 2,
    explanation: "1 Megabayt = 1024 Kilobayt (Kbayt) ga teng."
  },
  {
    id: "q5",
    moduleId: "m1",
    text: "\"Tashkent\" so'zi ASCII kodlashda nechta baytni egallaydi?",
    options: [
      "6 bayt",
      "7 bayt",
      "8 bayt",
      "16 bayt"
    ],
    correctOptionIndex: 2,
    explanation: "\"Tashkent\" so'zi 8 ta belgidan iborat bo'lib, ASCII kodlashda har bir belgi 1 bayt joy egallaganligi uchun jami 8 bayt bo'ladi."
  },
  {
    id: "q6",
    moduleId: "m1",
    text: "Internet tezligi 16 Mbit/s bo'lsa, 1 sekundda taxminan necha Mbayt ma'lumot yuklanadi?",
    options: [
      "1 Mbayt",
      "2 Mbayt",
      "8 Mbayt",
      "16 Mbayt"
    ],
    correctOptionIndex: 1,
    explanation: "1 bayt = 8 bit bo'lgani sababli, Mbit/s ni Mbayt/s ga o'tkazish uchun 8 ga bo'lish kifoya: 16 Mbit/s ÷ 8 = 2 Mbayt/s."
  },
  {
    id: "q6_2",
    moduleId: "m1",
    text: "Boshqa muallifning asarini ruxsatsiz o'ziniki sifatida taqdim etish qanday ataladi?",
    options: [
      "Sitatsiya",
      "Plagiat",
      "Litsenziya",
      "Lisensiya kodlash"
    ],
    correctOptionIndex: 1,
    explanation: "Boshqa muallifning asari yoki g'oyasini o'ziniki qilib ko'rsatish plagiat (ko'chirmakashlik) deyiladi."
  },
  {
    id: "q6_3",
    moduleId: "m1",
    text: "Dasturiy ta'minot kodini ko'rish, o'zgartirish va tarqatishga ruxsat beruvchi litsenziya turi qanday ataladi?",
    options: [
      "Mualliflik huquqi bilan himoyalangan",
      "Ochiq manba (Open Source)",
      "Tijoriy litsenziya",
      "Maxfiy kod"
    ],
    correctOptionIndex: 1,
    explanation: "Ochiq manbali (Open Source) dasturlarning kodini erkin ko'rish, o'zgartirish va tarqatish mumkin."
  },
  {
    id: "q6_4",
    moduleId: "m1",
    text: "Quyidagi qaysi misol \"bilim\" (knowledge) darajasiga to'g'ri keladi?",
    options: [
      "\"25\" raqami",
      "\"Bugun harorat 25°C\"",
      "\"25°C da yengil kiyim kiyish kerak\"",
      "Termometr ko'rsatkichi"
    ],
    correctOptionIndex: 2,
    explanation: "Axborotdan amaliy foydalanish va undan xulosa chiqarish qobiliyati bilim hisoblanadi."
  },
  {
    id: "q6_5",
    moduleId: "m1",
    text: "Internetda shaxsiy ma'lumotlarni himoya qilish bo'yicha qaysi xatti-harakat noto'g'ri?",
    options: [
      "Parolni murakkab qilib tuzish",
      "Ijtimoiy tarmoqda telefon raqamini ochiq qo'yish",
      "Noma'lum havolalarni bosmaslik",
      "Ikki bosqichli tasdiqlashdan foydalanish"
    ],
    correctOptionIndex: 1,
    explanation: "Ijtimoiy tarmoqlarda telefon raqami yoki manzil kabi shaxsiy ma'lumotlarni hammaga ochiq qoldirish xavfsizlik qoidalariga ziddir."
  },
  {
    id: "q6_6",
    moduleId: "m1",
    text: "5 MB hajmdagi fayl 2 Mbit/s tezlikda taxminan necha sekundda yuklanadi?",
    options: [
      "2.5 sekund",
      "5 sekund",
      "20 sekund",
      "40 sekund"
    ],
    correctOptionIndex: 2,
    explanation: "5 Megabayt (MB) = 40 Megabit (Mbit). Yuklash vaqti: 40 Mbit ÷ 2 Mbit/s = 20 sekund."
  },
  {
    id: "q6_7",
    moduleId: "m1",
    text: "Kompyuter axborotni qaysi sanoq sistemasida saqlaydi va qayta ishlaydi?",
    options: [
      "O'nlik (decimal)",
      "Ikkilik (binary)",
      "O'n oltilik (hex)",
      "Sakkizlik (octal)"
    ],
    correctOptionIndex: 1,
    explanation: "Kompyuter ballar ma'lumotlarni ikkilik (binary) kod ko'rinishida — 0 va 1 raqamlari orqali qayta ishlaydi."
  },
  {
    id: "q6_8",
    moduleId: "m1",
    text: "Internetdan olingan matndan foydalanganda nima qilish majburiy?",
    options: [
      "Matnni o'zgartirmasdan ishlatish",
      "Manbani ko'rsatish (sitatsiya)",
      "Matnni tarjima qilish",
      "Hech narsa qilish shart emas"
    ],
    correctOptionIndex: 1,
    explanation: "Plagiatning oldini olish va mualliflik huquqini hurmat qilish uchun manbani ko'rsatish shart."
  },
  {
    id: "q6_9",
    moduleId: "m1",
    text: "O'qituvchi darsda \"Bugun 30 ta o'quvchidan 27 tasi testdan o'tdi\" deydi. Bu ma'lumot-axborot-bilim zanjirida nimani ifodalaydi?",
    options: [
      "Faqat ma'lumot, chunki bu raqam",
      "Axborot, chunki kontekstga ega ma'noli xabar",
      "Bilim, chunki amaliy xulosa chiqarilgan",
      "Hech qaysi bosqichga to'g'ri kelmaydi"
    ],
    correctOptionIndex: 1,
    explanation: "Bu xabar ma'lum kontekst va mazmunga ega bo'lganligi sababli axborot (information) hisoblanadi."
  },
  {
    id: "q6_10",
    moduleId: "m1",
    text: "Creative Commons litsenziyasi haqida qaysi fikr to'g'ri?",
    options: [
      "Asar ustidan barcha huquqlar bekor qilinadi",
      "Muallif ba'zi huquqlarni saqlab, ba'zilarini beradi",
      "Faqat davlat tashkilotlari foydalanishi mumkin",
      "Bu mualliflik huquqi bilan bir xil narsa"
    ],
    correctOptionIndex: 1,
    explanation: "Creative Commons (CC) muallifga o'z asaridan erkin foydalanish shartlarini (masalan, fajat notijorat) belgilash imkonini beradi."
  },
  
  // Module 2 (7-12)
  {
    id: "q7",
    moduleId: "m2",
    text: "Kompyuter tezkor xotirasi (RAM) qanday vazifani bajaradi?",
    options: [
      "Ma'lumotlarni doimiy ravishda saqlaydi",
      "Protsessor tomonidan bajarilayotgan joriy dasturlar va ma'lumotlarni vaqtincha saqlaydi",
      "Kompyuter qurilmalarini tok bilan ta'minlaydi",
      "Ma'lumotlarni kiritish va chiqarishni boshqaradi"
    ],
    correctOptionIndex: 1,
    explanation: "RAM - kompyuter yoniq holatda bo'lganda joriy ishlayotgan dasturlar va ma'lumotlarni vaqtincha saqlash qurilmasi."
  },
  {
    id: "q8",
    moduleId: "m2",
    text: "Excelda aytaylik A1=10, B1=20 bo'lsa, '=A1+B1*2' formulaning natijasi nechaga teng bo'ladi?",
    options: [
      "60",
      "50",
      "30",
      "40"
    ],
    correctOptionIndex: 1,
    explanation: "Matematik qoidaga ko'ra birinchi ko'paytirish bajariladi: 20 * 2 = 40. Keyin qo'shish: 10 + 40 = 50."
  },
  {
    id: "q9",
    moduleId: "m2",
    text: "Quyidagilardan qaysi biri operatsion tizim hisoblanadi?",
    options: [
      "MS Excel",
      "Linux",
      "Google Chrome",
      "Python IDLE"
    ],
    correctOptionIndex: 1,
    explanation: "Linux - bu ochiq manbali operatsion tizim bo'lib, kompyuter resurslarini boshqaradi."
  },
  {
    id: "q10",
    moduleId: "m2",
    text: "Kompyuterda ma'lumotlarni saqlash uchun ishlatiladigan SSD qurilmasining HDD dan asosiy afzalligi nimada?",
    options: [
      "Arzonligi",
      "O'lchamining kattaligi",
      "O'qish/yozish tezligining juda yuqoriligi va mexanik harakatlanuvchi qismlarning yo'qligi",
      "Ko'p elektr energiyasi iste'mol qilishi"
    ],
    correctOptionIndex: 2,
    explanation: "SSD (Solid State Drive) mikrosxemalar asosida ishlaydi, unda aylanuvchi disk yo'q va shuning uchun u HDD dan ancha tezroq."
  },
  {
    id: "q11",
    moduleId: "m2",
    text: "MS Word dasturida sahifa yo'nalishini (orientation) qanday turlarga o'zgartirish mumkin?",
    options: [
      "Faqat Portret (Kitob)",
      "Portret (Kitob) va Albom (Ko'ndalang)",
      "A4 va A3 format",
      "Vertikal va diagonal"
    ],
    correctOptionIndex: 1,
    explanation: "Word dasturida varaq yo'nalishi Portrait (kitob shakli) yoki Landscape (albom shakli) bo'lishi mumkin."
  },
  {
    id: "q12",
    moduleId: "m2",
    text: "Quyidagi Excel formulalaridan qaysi biri noto'g'ri yozilgan?",
    options: [
      "=SUM(A1:A10)",
      "=SUM(A1;B2)",
      "=SUM A1+B1",
      "=A1+B1"
    ],
    correctOptionIndex: 2,
    explanation: "Excelda funksiyadan foydalanilganda argumentlar qavs ichida bo'lishi kerak. '=SUM A1+B1' xato hisoblanadi."
  },

  // Module 3 (13-19)
  {
    id: "q13",
    moduleId: "m3",
    text: "O'nlik sanoq sistemasidagi 13 soni ikkilik sanoq sistemasida qanday yoziladi?",
    options: [
      "1100",
      "1101",
      "1110",
      "1011"
    ],
    correctOptionIndex: 1,
    explanation: "13 / 2 = 6 (qoldiq 1); 6 / 2 = 3 (qoldiq 0); 3 / 2 = 1 (qoldiq 1); 1 / 2 = 0 (qoldiq 1). Pastdan yuqoriga: 1101."
  },
  {
    id: "q14",
    moduleId: "m3",
    text: "Mantiqiy ifodaning qiymatini hisoblang: (1 YOKI 0) VA (NOT 0)",
    options: [
      "0",
      "1",
      "Noma'lum",
      "Xatolik beradi"
    ],
    correctOptionIndex: 1,
    explanation: "(1 OR 0) = 1. (NOT 0) = 1. 1 AND 1 = 1 (Rost)."
  },
  {
    id: "q15",
    moduleId: "m3",
    text: "Ikkilik sanoq sistemasida 1011 + 1101 yig'indisi nechaga teng?",
    options: [
      "11000",
      "11010",
      "10100",
      "10000"
    ],
    correctOptionIndex: 0,
    explanation: "1011 (o'nlikda 11) + 1101 (o'nlikda 13) = 24. 24 soni ikkilikda 11000 ga teng."
  },
  {
    id: "q16",
    moduleId: "m3",
    text: "Sakkizlik sanoq sistemasidagi 34 soni o'nlikda nechaga teng?",
    options: [
      "28",
      "26",
      "34",
      "30"
    ],
    correctOptionIndex: 0,
    explanation: "34_8 = 3 * 8^1 + 4 * 8^0 = 24 + 4 = 28_10."
  },
  {
    id: "q17",
    moduleId: "m3",
    text: "Quyidagilardan qaysi biri A & (B | C) ifodaga teng kuchli (de Morgan yoki algebraik qonunlar bo'yicha)?",
    options: [
      "(A & B) | (A & C)",
      "(A | B) & (A | C)",
      "(A & B) & C",
      "A | B | C"
    ],
    correctOptionIndex: 0,
    explanation: "Konyunksiyaning dizyunksiyaga nisbatan tarqatish (distributivlik) qonuni: A & (B | C) = (A & B) | (A & C)."
  },
  {
    id: "q18",
    moduleId: "m3",
    text: "O'n oltilik sanoq sistemasidagi 'F' harfi o'nlik sanoq sistemasidagi qaysi songa mos keladi?",
    options: [
      "10",
      "11",
      "15",
      "16"
    ],
    correctOptionIndex: 2,
    explanation: "Hexadecimal sanoq sistemasida: A=10, B=11, C=12, D=13, E=14, F=15."
  },
  {
    id: "q19",
    moduleId: "m3",
    text: "Inkor amali qanday nomlanadi?",
    options: [
      "Konyunksiya",
      "Dizyunksiya",
      "Inversiya",
      "Implikatsiya"
    ],
    correctOptionIndex: 2,
    explanation: "Mantiqiy inkor amali 'inversiya' (NOT) deb ham ataladi."
  },

  // Module 4 (20-26)
  {
    id: "q20",
    moduleId: "m4",
    text: "Python-da 'print(type(5 / 2))' kodi ekranga nima chiqaradi?",
    options: [
      "<class 'int'>",
      "<class 'float'>",
      "<class 'double'>",
      "2.5"
    ],
    correctOptionIndex: 1,
    explanation: "Pythonda bo'lish amali (/) har doim float turidagi qiymat qaytaradi."
  },
  {
    id: "q21",
    moduleId: "m4",
    text: "SQL-da jadvaldan ma'lumotlarni o'chirish uchun qaysi buyruq ishlatiladi?",
    options: [
      "REMOVE",
      "DELETE",
      "DROP",
      "TRUNCATE"
    ],
    correctOptionIndex: 1,
    explanation: "Jadval ichidagi satrlarni o'chirish uchun DELETE FROM buyrug'i ishlatiladi."
  },
  {
    id: "q22",
    moduleId: "m4",
    text: "Python-da ro'yxat (list) elementini oxiriga qo'shish uchun qaysi metod ishlatiladi?",
    options: [
      "add()",
      "append()",
      "push()",
      "insert()"
    ],
    correctOptionIndex: 1,
    explanation: "append() metodi ro'yxatning oxiriga bitta element qo'shadi."
  },
  {
    id: "q23",
    moduleId: "m4",
    text: "Ma'lumotlar bazasining asosiy kaliti (Primary Key) nima?",
    options: [
      "Jadvaldagi eng birinchi ustun",
      "Jadvaldagi har bir satrni takrorlanmas (yagona) qilib aniqlaydigan kalit",
      "Boshqa jadval bilan bog'lanuvchi ustun",
      "Faqat matnli ma'lumotlarni saqlaydigan ustun"
    ],
    correctOptionIndex: 1,
    explanation: "Primary Key - jadvaldagi yozuvlarning yagonaligini kafolatlovchi va null qiymat qabul qilmaydigan ustundir."
  },
  {
    id: "q24",
    moduleId: "m4",
    text: "Python-da '3 * '2'' ifodaning natijasi nima bo'ladi?",
    options: [
      "6",
      "222",
      "Xatolik",
      "32"
    ],
    correctOptionIndex: 1,
    explanation: "Python-da satrni songa ko'paytirish satrni shu soncha marta takrorlash (duplikatsiya) hisoblanadi."
  },
  {
    id: "q25",
    moduleId: "m4",
    text: "Python-da 'range(2, 10, 3)' funksiyasi qaysi sonlar ketma-ketligini hosil qiladi?",
    options: [
      "2, 3, 4, 5, 6, 7, 8, 9, 10",
      "2, 5, 8",
      "2, 5, 8, 11",
      "3, 6, 9"
    ],
    correctOptionIndex: 1,
    explanation: "Boshlang'ich qiymat 2, qadam 3, oxirgi chegara 10 (kirmaydi). Shuning uchun: 2, 5, 8."
  },
  {
    id: "q26",
    moduleId: "m4",
    text: "Python-da lug'at (dictionary) qanday qavslar ichida e'lon qilinadi?",
    options: [
      "[ ]",
      "( )",
      "{ }",
      "< >"
    ],
    correctOptionIndex: 2,
    explanation: "Lug'atlar (dict) kalit-qiymat ko'rinishida gulli qavslar '{ }' yordamida yaratiladi."
  },

  // Module 5 (27-32)
  {
    id: "q27",
    moduleId: "m5",
    text: "Quyidagilardan qaysi biri veb-sahifaning shrift o'lchamini belgilovchi CSS xossasi hisoblanadi?",
    options: [
      "font-style",
      "font-size",
      "text-size",
      "font-weight"
    ],
    correctOptionIndex: 1,
    explanation: "CSS-da matn o'lchamini o'zgartirish uchun font-size xossasidan foydalaniladi."
  },
  {
    id: "q28",
    moduleId: "m5",
    text: "Rastrli grafika muharrirlariga qaysi dasturlar kiradi?",
    options: [
      "Adobe Photoshop, Corel PaintShop",
      "CorelDraw, Adobe Illustrator",
      "AutoCAD, 3ds Max",
      "Inkscape, Adobe Animate"
    ],
    correctOptionIndex: 0,
    explanation: "Adobe Photoshop rastrli tasvirlar (piksellar) bilan ishlash uchun asosiy dasturdir."
  },
  {
    id: "q29",
    moduleId: "m5",
    text: "HTML-da gipermurojaat (link) yaratish uchun qaysi teg ishlatiladi?",
    options: [
      "&lt;link&gt;",
      "&lt;href&gt;",
      "&lt;a&gt;",
      "&lt;url&gt;"
    ],
    correctOptionIndex: 2,
    explanation: "HTML-da link yaratish uchun Anchor &lt;a href='...'&gt; tegi ishlatiladi."
  },
  {
    id: "q30",
    moduleId: "m5",
    text: "HTML sahifada tartibsiz ro'yxat (bulleted list) qaysi teg yordamida yaratiladi?",
    options: [
      "&lt;ol&gt;",
      "&lt;ul&gt;",
      "&lt;li&gt;",
      "&lt;list&gt;"
    ],
    correctOptionIndex: 1,
    explanation: "&lt;ul&gt; (Unordered List) tartibsiz (nuqtali) ro'yxat yaratadi."
  },
  {
    id: "q31",
    moduleId: "m5",
    text: "Veb-saytga tashqi CSS faylini ulash uchun qaysi HTML tegi ishlatiladi?",
    options: [
      "&lt;style&gt;",
      "&lt;link&gt;",
      "&lt;script&gt;",
      "&lt;css&gt;"
    ],
    correctOptionIndex: 1,
    explanation: "Tashqi CSS fayllarni ulash uchun &lt;head&gt; bo'limida &lt;link rel='stylesheet' href='style.css'&gt; ishlatiladi."
  },
  {
    id: "q32",
    moduleId: "m5",
    text: "CSS-da element atrofidagi tashqi masofani (bo'shliqni) belgilash uchun nima ishlatiladi?",
    options: [
      "padding",
      "margin",
      "border",
      "width"
    ],
    correctOptionIndex: 1,
    explanation: "margin - elementning chegarasidan tashqaridagi masofani (tashqi bo'shliqni) belgilaydi."
  },

  // Module 6 (33-38)
  {
    id: "q33",
    moduleId: "m6",
    text: "IPv4 manzili xotirada necha bit joyni egallaydi?",
    options: [
      "16 bit",
      "32 bit",
      "64 bit",
      "128 bit"
    ],
    correctOptionIndex: 1,
    explanation: "IPv4 manzili 4 ta bayt, ya'ni 32 bitdan tashkil topgan."
  },
  {
    id: "q34",
    moduleId: "m6",
    text: "Domen nomini IP-manzilga aylantirib beruvchi tarmoq xizmati qanday nomlanadi?",
    options: [
      "DHCP",
      "DNS",
      "FTP",
      "NAT"
    ],
    correctOptionIndex: 1,
    explanation: "DNS (Domain Name System) - inson tushunadigan domen nomlarini (masalan, google.com) kompyuter tushunadigan IP-manzilga aylantiradi."
  },
  {
    id: "q35",
    moduleId: "m6",
    text: "Tarmoq darajasida ishlaydigan va paketlarni yo'naltiruvchi tarmoq qurilmasi nima deb ataladi?",
    options: [
      "Kommutator (Switch)",
      "Marshrutizator (Router)",
      "Konsentrator (Hub)",
      "Modem"
    ],
    correctOptionIndex: 1,
    explanation: "Marshrutizator (Router) OSI modelining 3-bosqichida (Tarmoq darajasi) ishlaydi va paketlarni eng optimal yo'l bilan yo'naltiradi."
  },
  {
    id: "q36",
    moduleId: "m6",
    text: "HTTP protokoli qaysi port orqali ishlaydi?",
    options: [
      "21",
      "80",
      "443",
      "25"
    ],
    correctOptionIndex: 1,
    explanation: "HTTP shifrlanmagan veb-trafik uchun 80-portdan, xavfsiz HTTPS esa 443-portdan foydalanadi."
  },
  {
    id: "q37",
    moduleId: "m6",
    text: "Lokal tarmoq qanday nomlanadi?",
    options: [
      "LAN",
      "WAN",
      "MAN",
      "PAN"
    ],
    correctOptionIndex: 0,
    explanation: "LAN (Local Area Network) - kichik hududdagi (uy, maktab, ofis) lokal tarmoq."
  },
  {
    id: "q38",
    moduleId: "m6",
    text: "IP manzillarni tarmoqdagi qurilmalarga avtomatik tarzda taqsimlaydigan protokol qaysi?",
    options: [
      "DNS",
      "DHCP",
      "SMTP",
      "ARP"
    ],
    correctOptionIndex: 1,
    explanation: "DHCP (Dynamic Host Configuration Protocol) tarmoqqa ulangan qurilmalarga avtomatik ravishda IP, niqob va shlyuz manzillarini beradi."
  },

  // Module 7 (39-44)
  {
    id: "q39",
    moduleId: "m7",
    text: "Fishing (Phishing) nima?",
    options: [
      "Kompyuter tizimini viruslardan tozalash jarayoni",
      "Soxta veb-saytlar yoki xabarlar orqali foydalanuvchilarning maxfiy ma'lumotlarini (parol, karta raqami) o'g'irlash",
      "Tarmoq tezligini oshirish usuli",
      "Ma'lumotlar bazasini arxivlash texnologiyasi"
    ],
    correctOptionIndex: 1,
    explanation: "Fishing - kiberjinoyatchilarning soxta elektron xatlar yoki veb-saytlar yordamida maxfiy ma'lumotlarni aldov yo'li bilan olishidir."
  },
  {
    id: "q40",
    moduleId: "m7",
    text: "Foydalanuvchi parolini shifrlashda eng ko'p ishlatiladigan qaytmas algoritmlar qanday ataladi?",
    options: [
      "Simmetrik shifrlash",
      "Xesh (Hash) funksiyalari",
      "Asimmetrik shifrlash",
      "Arxivlash"
    ],
    correctOptionIndex: 1,
    explanation: "Xesh funksiyalari (MD5, SHA-256) ma'lumotlarni qayta tiklab bo'lmaydigan ko'rinishda shifrlaydi va parollarni saqlashda xavfsizlikni ta'minlaydi."
  },
  {
    id: "q41",
    moduleId: "m7",
    text: "Kriptografiyada asimmetrik shifrlash usuli qanday ishlaydi?",
    options: [
      "Shifrlash va deshifrlash uchun bitta kalitdan foydalaniladi",
      "Shifrlash uchun ochiq kalit (public key), deshifrlash uchun yopiq kalit (private key) ishlatiladi",
      "Kalitlardan foydalanilmaydi",
      "Faqat matnli ma'lumotlarni shifrlay oladi"
    ],
    correctOptionIndex: 1,
    explanation: "Asimmetrik kriptografiyada ikkita kalit juftligidan foydalaniladi: ochiq kalit (shifrlash uchun) va faqat egasiga ma'lum bo'lgan maxfiy yopiq kalit (deshifrlash uchun)."
  },
  {
    id: "q42",
    moduleId: "m7",
    text: "Zararli dasturlarni (viruslar, josus dasturlar) aniqlash va ularni yo'q qilish uchun ishlatiladigan dasturiy ta'minot nima deyiladi?",
    options: [
      "Drayver",
      "Antivirus",
      "Brandmauer",
      "Brauzer"
    ],
    correctOptionIndex: 1,
    explanation: "Antivirus - zararli dasturlarni qidirish, bloklash va o'chirishga ixtisoslashgan xavfsizlik dasturidir."
  },
  {
    id: "q43",
    moduleId: "m7",
    text: "O'zbekiston Respublikasida elektron davlat xizmatlari ko'rsatiladigan yagona portal qaysi?",
    options: [
      "lex.uz",
      "my.gov.uz",
      "dtm.uz",
      "gov.uz"
    ],
    correctOptionIndex: 1,
    explanation: "my.gov.uz - Yagona interaktiv davlat xizmatlari portali (YIDXP) hisoblanadi."
  },
  {
    id: "q44",
    moduleId: "m7",
    text: "Tarmoq orqali kiruvchi va chiquvchi trafikni nazorat qiluvchi va filtrlash vazifasini bajaruvchi tizim nima deb ataladi?",
    options: [
      "Router",
      "Fayrvol (Firewall/Brandmauer)",
      "Proxy server",
      "Antivirus"
    ],
    correctOptionIndex: 1,
    explanation: "Firewall (Brandmauer) belgilangan xavfsizlik qoidalariga asosan tarmoq trafigini tahlil qiluvchi va begona kirishlardan himoyalovchi to'siqdir."
  },

  // Module 8 (45-50)
  {
    id: "q45",
    moduleId: "m8",
    text: "Informatika darslarida o'quvchilarda amaliy ko'nikmalarni shakllantirish uchun eng samarali yondashuv nima?",
    options: [
      "Konspekt yozdirish",
      "Amaliy kompyuter laboratoriya mashg'ulotlari va loyiha ishlari",
      "Faqat darslikni o'qib berish",
      "Mavzuni og'zaki so'rash"
    ],
    correctOptionIndex: 1,
    explanation: "Informatika fani asosan amaliy yo'nalish bo'lganligi bois, o'quvchining kompyuterda bevosita ishlashi va loyiha tayyorlashi eng samarali uslubdir."
  },
  {
    id: "q46",
    moduleId: "m8",
    text: "Kriterial baholash nima?",
    options: [
      "Faqat imtihon yakunida baho qo'yish",
      "Oldindan belgilangan va barcha uchun tushunarli bo'lgan aniq mezonlar (kriteriylar) asosida o'quvchilar bilimini baholash",
      "O'qituvchining shaxsiy munosabati asosida baholash",
      "O'quvchilarni bir-biriga solishtirib reyting tuzish"
    ],
    correctOptionIndex: 1,
    explanation: "Kriterial baholash - o'quvchi natijalarini oldindan ma'lum bo'lgan mezonlar va ta'lim maqsadlari bilan solishtirib baholash tizimidir."
  },
  {
    id: "q47",
    moduleId: "m8",
    text: "Informatikada 'blended learning' (aralash ta'lim) nima?",
    options: [
      "Faqat maktabda o'qish",
      "An'anaviy sinfdagi ta'lim va onlayn ta'lim usullarining integratsiyalashgan kombinatsiyasi",
      "Faqat uyda mustaqil o'qish",
      "Bir vaqtning o'zida bir nechta fanni o'rganish"
    ],
    correctOptionIndex: 1,
    explanation: "Blended learning (aralash ta'lim) an'anaviy yuzma-yuz darslar bilan mustaqil onlayn ta'lim elementlarini birlashtiradi."
  },
  {
    id: "q48",
    moduleId: "m8",
    text: "Pedagogikada 'STEAM' yondashuvidagi 'E' harfi qaysi sohani bildiradi?",
    options: [
      "Education (Ta'lim)",
      "Engineering (Muhandislik)",
      "Environment (Ekologiya)",
      "Economics (Iqtisodiyot)"
    ],
    correctOptionIndex: 1,
    explanation: "STEAM: Science (Fan), Technology (Texnologiya), Engineering (Muhandislik), Arts (San'at), Mathematics (Matematika)."
  },
  {
    id: "q49",
    moduleId: "m8",
    text: "Formativ (shakllantiruvchi) baholashning asosiy maqsadi nima?",
    options: [
      "Choraklik yoki yillik yakuniy bahoni aniqlash",
      "O'quv jarayonini monitoring qilish va o'quvchiga o'z vaqtida qayta aloqa (feedback) berish orqali uning o'sishiga yordam berish",
      "O'quvchilarni sinfdan sinfga o'tkazishni belgilash",
      "Maktab reytingini ko'tarish"
    ],
    correctOptionIndex: 1,
    explanation: "Formativ baholash o'quv jarayonining o'zida amalga oshirilib, o'quvchining kuchli va kuchsiz tomonlarini aniqlash va rivojlantirishga qaratilgan."
  },
  {
    id: "q50",
    moduleId: "m8",
    text: "O'quvchining axborot texnologiyalari bilan to'g'ri ishlash madaniyati, gigiyena va xavfsizlik qoidalariga rioya qilishi nima deb ataladi?",
    options: [
      "Dasturlash madaniyati",
      "Raqamli gigiyena va axborot madaniyati",
      "Texnik savodxonlik",
      "Tarmoq odobi"
    ],
    correctOptionIndex: 1,
    explanation: "Raqamli gigiyena va axborot madaniyati - kompyuter texnikasidan salomatlik va xavfsizlik qoidalariga amal qilgan holda to'g'ri va samarali foydalanishdir."
  }
];

// Mock Exam Results
export const mockExamResult: ExamResult = {
  examId: "e1",
  score: 78,
  totalQuestions: 50,
  moduleScores: {
    "m1": { title: "Axborot va raqamli savodxonlik", correct: 5, total: 6 },
    "m2": { title: "Kompyuter tizimlari va Office", correct: 5, total: 6 },
    "m3": { title: "Mantiq va sanoq sistemalari", correct: 6, total: 7 },
    "m4": { title: "Dasturlash va ma'lumotlar bazasi", correct: 4, total: 7 },
    "m5": { title: "Grafika va veb-texnologiyalar", correct: 4, total: 6 },
    "m6": { title: "Tarmoqlar", correct: 5, total: 6 },
    "m7": { title: "Xavfsizlik va raqamli xizmatlar", correct: 5, total: 6 },
    "m8": { title: "Pedagogika va metodika", correct: 5, total: 6 }
  },
  userAnswers: {
    "q1": 1, // Correct (1)
    "q2": 0, // Correct (0)
    "q3": 0, // Correct
    "q4": 1, // Correct
    "q5": 2, // Correct
    "q6": 0, // Wrong (user chose 1 bayt, correct is 2 bayt)
    "q7": 1, // Correct
    "q8": 1, // Correct
    "q9": 1, // Correct
    "q10": 2, // Correct
    "q11": 1, // Correct
    "q12": 0, // Wrong (user chose =SUM(A1:A10), correct is =SUM A1+B1)
    "q13": 1, // Correct
    "q14": 1, // Correct
    "q15": 0, // Correct
    "q16": 0, // Correct
    "q17": 0, // Correct
    "q18": 2, // Correct
    "q19": 0, // Wrong (user chose Konyunksiya, correct is Inversiya)
    "q20": 1, // Correct
    "q21": 1, // Correct
    "q22": 1, // Correct
    "q23": 1, // Correct
    "q24": 0, // Wrong
    "q25": 1, // Correct
    "q26": 0, // Wrong
    "q27": 1, // Correct
    "q28": 0, // Correct
    "q29": 2, // Correct
    "q30": 1, // Correct
    "q31": 1, // Correct
    "q32": 0, // Wrong
    "q33": 1, // Correct
    "q34": 1, // Correct
    "q35": 1, // Correct
    "q36": 1, // Correct
    "q37": 0, // Correct
    "q38": 0, // Wrong
    "q39": 1, // Correct
    "q40": 1, // Correct
    "q41": 1, // Correct
    "q42": 1, // Correct
    "q43": 1, // Correct
    "q44": 0, // Wrong
    "q45": 1, // Correct
    "q46": 1, // Correct
    "q47": 1, // Correct
    "q48": 1, // Correct
    "q49": 1, // Correct
    "q50": 0  // Wrong
  }
};

// --- Progress Management for Presentation Mode ---
const MODULES_KEY = 'nur_academy_mock_modules_v2';
const TOPIC_TESTS_KEY = 'nur_academy_mock_topic_tests_v2';
const EXAMS_KEY = 'nur_academy_mock_exams_v2';

export function saveProgressToLocalStorage() {
  localStorage.setItem(MODULES_KEY, JSON.stringify(mockModules));
  localStorage.setItem(TOPIC_TESTS_KEY, JSON.stringify(mockTopicTests));
  localStorage.setItem(EXAMS_KEY, JSON.stringify(mockExams));
}

export function resetDefaultProgress() {
  localStorage.removeItem(MODULES_KEY);
  localStorage.removeItem(TOPIC_TESTS_KEY);
  localStorage.removeItem(EXAMS_KEY);
  localStorage.removeItem('nur_academy_mock_attempts');

  // Set m1 as current, others locked
  mockModules.forEach((m, mIdx) => {
    if (mIdx === 0) {
      m.status = 'current';
      m.lessons.forEach((l, lIdx) => {
        l.status = lIdx === 0 ? 'current' : 'locked';
      });
    } else {
      m.status = 'locked';
      m.lessons.forEach(l => {
        l.status = 'locked';
      });
    }
  });

  // Topic tests: t1 is not_started, others locked
  mockTopicTests.forEach((t, tIdx) => {
    t.status = tIdx === 0 ? 'not_started' : 'locked';
    t.score = null;
  });

  // Exams: e1, e2, e3 are not_started, others locked
  mockExams.forEach((e, eIdx) => {
    e.status = eIdx < 3 ? 'not_started' : 'locked';
    e.score = null;
  });

  saveProgressToLocalStorage();
}

export function loadProgressFromLocalStorage() {
  const savedModules = localStorage.getItem(MODULES_KEY);
  const savedTopicTests = localStorage.getItem(TOPIC_TESTS_KEY);
  const savedExams = localStorage.getItem(EXAMS_KEY);

  if (savedModules) {
    try {
      const parsed = JSON.parse(savedModules);
      mockModules.length = 0;
      mockModules.push(...parsed);
    } catch (e) {
      resetDefaultProgress();
    }
  } else {
    // If not set, start with a completely fresh state (0% completed)
    resetDefaultProgress();
  }

  if (savedTopicTests) {
    try {
      const parsed = JSON.parse(savedTopicTests);
      mockTopicTests.length = 0;
      mockTopicTests.push(...parsed);
    } catch (e) {}
  }

  if (savedExams) {
    try {
      const parsed = JSON.parse(savedExams);
      mockExams.length = 0;
      mockExams.push(...parsed);
    } catch (e) {}
  }
}

export function resetAllProgress() {
  resetDefaultProgress();
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
}

export function completeLessonAndUnlockNext(lessonId: string) {
  let foundLesson = false;
  let nextLessonToUnlock: any = null;
  let nextModuleToUnlock: any = null;

  for (let mIdx = 0; mIdx < mockModules.length; mIdx++) {
    const m = mockModules[mIdx];
    const lIdx = m.lessons.findIndex(l => l.id === lessonId);
    if (lIdx !== -1) {
      const l = m.lessons[lIdx];
      l.status = 'completed';
      foundLesson = true;

      if (lIdx + 1 < m.lessons.length) {
        nextLessonToUnlock = m.lessons[lIdx + 1];
      } else {
        m.status = 'completed';
        if (mIdx + 1 < mockModules.length) {
          nextModuleToUnlock = mockModules[mIdx + 1];
        }
      }
      break;
    }
  }

  if (foundLesson) {
    if (nextLessonToUnlock) {
      if (nextLessonToUnlock.status === 'locked') {
        nextLessonToUnlock.status = 'current';
      }
    } else if (nextModuleToUnlock) {
      if (nextModuleToUnlock.status === 'locked') {
        nextModuleToUnlock.status = 'current';
        if (nextModuleToUnlock.lessons.length > 0) {
          nextModuleToUnlock.lessons[0].status = 'current';
        }
      }
    }

    // Auto-unlock corresponding topic test
    const mIdx = mockModules.findIndex(m => m.lessons.some(l => l.id === lessonId));
    if (mIdx !== -1 && mockModules[mIdx].status === 'completed') {
      if (mockTopicTests[mIdx]) {
        mockTopicTests[mIdx].status = 'not_started';
      }
    }

    saveProgressToLocalStorage();
  }
}

export function completeTestOrExam(id: string, score: number) {
  // Check if it's a topic test
  const topicIdx = mockTopicTests.findIndex(t => t.id === id);
  if (topicIdx !== -1) {
    mockTopicTests[topicIdx].status = 'completed';
    mockTopicTests[topicIdx].score = score;
    // Unlock next topic test if previous module was completed
    if (topicIdx + 1 < mockTopicTests.length) {
      const nextTest = mockTopicTests[topicIdx + 1];
      const nextModCompleted = mockModules[topicIdx + 1]?.status === 'completed';
      if (nextTest.status === 'locked' && nextModCompleted) {
        nextTest.status = 'not_started';
      }
    }
  }

  // Check if it's a mock exam
  const examIdx = mockExams.findIndex(e => e.id === id);
  if (examIdx !== -1) {
    mockExams[examIdx].status = 'completed';
    mockExams[examIdx].score = score;
    // Unlock next mock exam
    if (examIdx + 1 < mockExams.length) {
      if (mockExams[examIdx + 1].status === 'locked') {
        mockExams[examIdx + 1].status = 'not_started';
      }
    }
  }

  saveProgressToLocalStorage();
}

// Automatically load on import
if (typeof window !== 'undefined') {
  loadProgressFromLocalStorage();
}

