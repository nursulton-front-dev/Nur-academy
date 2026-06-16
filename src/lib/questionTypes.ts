export type QuestionType = "single_choice" | "matching" | "sequence" | "calculation" | "code_reading";

export interface ExtendedQuestion {
  id: string;
  type: QuestionType;
  topic: string;
  subtopic: string;
  difficulty: "easy" | "medium" | "hard" | "exam";
  question: string;
  code?: string;
  options?: string[];
  pairs?: Array<{ left: string; right: string }>;
  sequence?: string[];
  correctAnswer: any; // Can be number (index), string (input), array (order), or Record<string, string> (matching)
  explanation: string;
}

// 25 Diagnostic Questions mapping across all school attestation modules
export const diagnosticQuestions: ExtendedQuestion[] = [
  {
    id: "diag_1",
    type: "single_choice",
    topic: "Axborot va kodlash",
    subtopic: "Axborot o'lchov birliklari",
    difficulty: "medium",
    question: "10 Megabayt necha Kilobaytga teng?",
    options: ["10240 KB", "10000 KB", "1048576 KB", "1024 KB"],
    correctAnswer: 0,
    explanation: "1 Megabayt = 1024 Kilobayt. Shuning uchun 10 MB = 10 * 1024 = 10240 KB bo'ladi."
  },
  {
    id: "diag_2",
    type: "code_reading",
    topic: "Scratch/Python/JS",
    subtopic: "Python loops",
    difficulty: "medium",
    question: "Quyidagi Python dasturi bajarilishi natijasida ekranga nima chiqadi?",
    code: `s = 0
for i in range(1, 5):
    s += i
print(s)`,
    options: ["10", "15", "6", "5"],
    correctAnswer: 0,
    explanation: "range(1, 5) operatori 1, 2, 3, 4 qiymatlarini qaytaradi. Ularning yig'indisi: 1+2+3+4 = 10."
  },
  {
    id: "diag_3",
    type: "matching",
    topic: "Kompyuter va OT",
    subtopic: "Qurilmalar va vazifalar",
    difficulty: "easy",
    question: "Qurilmalarni ularning vazifalariga mos ravishda joylashtiring:",
    pairs: [
      { left: "Protsessor (CPU)", right: "Amallarni hisoblash va boshqarish" },
      { left: "Tezkor xotira (RAM)", right: "Vaqtinchalik ma'lumotlarni saqlash" },
      { left: "Qattiq disk (HDD/SSD)", right: "Fayllarni doimiy saqlash" }
    ],
    correctAnswer: {
      "Protsessor (CPU)": "Amallarni hisoblash va boshqarish",
      "Tezkor xotira (RAM)": "Vaqtinchalik ma'lumotlarni saqlash",
      "Qattiq disk (HDD/SSD)": "Fayllarni doimiy saqlash"
    },
    explanation: "CPU hisob-kitob qiladi, RAM vaqtinchalik ishchi ma'lumotlarni saqlaydi, HDD/SSD esa doimiy saqlash qurilmasidir."
  },
  {
    id: "diag_4",
    type: "sequence",
    topic: "Algoritmlash",
    subtopic: "Algoritm bosqichlari",
    difficulty: "medium",
    question: "Dastur tuzish va kompyuterda masalani yechish bosqichlarini to'g'ri ketma-ketlikda joylashtiring:",
    sequence: [
      "Masalaning qo'yilishi",
      "Algoritm yaratish",
      "Dastur kodini yozish",
      "Dasturni testlash va sozlash"
    ],
    correctAnswer: [
      "Masalaning qo'yilishi",
      "Algoritm yaratish",
      "Dastur kodini yozish",
      "Dasturni testlash va sozlash"
    ],
    explanation: "Dastlab masala qo'yiladi, keyin algoritm ishlab chiqiladi, so'ng kod yoziladi va nihoyat testlanadi."
  },
  {
    id: "diag_5",
    type: "calculation",
    topic: "Mantiq va sanoq sistemalari",
    subtopic: "Sanoq sistemalari",
    difficulty: "hard",
    question: "O'nli sanoq sistemasidagi 25 sonini ikkilik sanoq sistemasida tasvirlang (faqat raqamlar bilan yozing):",
    correctAnswer: "11001",
    explanation: "25 ni 2 ga bo'lish orqali qoldiqlarni yozamiz: 25 = 12*2 + 1; 12 = 6*2 + 0; 6 = 3*2 + 0; 3 = 1*2 + 1; 1 = 0*2 + 1. Qoldiqlarni teskari yozsak: 11001."
  },
  {
    id: "diag_6",
    type: "single_choice",
    topic: "Office",
    subtopic: "Excel formulalari",
    difficulty: "medium",
    question: "Excel jadvalida =SUM(A1:A3) formulasi qanday vazifani bajaradi?",
    options: [
      "A1 dan A3 gacha bo'lgan kataklar yig'indisini hisoblaydi",
      "A1 va A3 kataklar ko'paytmasini topadi",
      "A1 va A3 kataklardagi eng katta qiymatni topadi",
      "A1 dan A3 gacha bo'lgan kataklar o'rtacha qiymatini hisoblaydi"
    ],
    correctAnswer: 0,
    explanation: "SUM funksiyasi berilgan kataklar oralig'idagi barcha sonli qiymatlar yig'indisini hisoblash uchun mo'ljallangan."
  },
  {
    id: "diag_7",
    type: "single_choice",
    topic: "Database",
    subtopic: "SQL queries",
    difficulty: "medium",
    question: "Jadvaldan ma'lumotlarni o'chirish uchun qaysi SQL buyrug'i ishlatiladi?",
    options: ["DELETE", "REMOVE", "DROP", "CLEAR"],
    correctAnswer: 0,
    explanation: "SQLda jadval ichidagi ma'lumotlarni satrma-satr o'chirish uchun DELETE FROM buyrug'i qo'llaniladi."
  },
  {
    id: "diag_8",
    type: "single_choice",
    topic: "HTML/CSS/Grafika",
    subtopic: "CSS selector",
    difficulty: "easy",
    question: "CSS da id orqali elementni tanlash uchun qaysi belgidan foydalaniladi?",
    options: ["#", ".", "*", "@"],
    correctAnswer: 0,
    explanation: "CSSda '#' (panjara) belgisi elementning unique ID-si orqali selector sifatida bog'lashda ishlatiladi. Nuqta esa class selectoridir."
  },
  {
    id: "diag_9",
    type: "single_choice",
    topic: "Tarmoq/IP",
    subtopic: "IP manzillar",
    difficulty: "medium",
    question: "Quyidagilardan qaysi biri to'g'ri IPv4 manzilini ifodalaydi?",
    options: ["192.168.1.256", "172.16.254.1", "10.0.0.1.5", "256.0.0.1"],
    correctAnswer: 1,
    explanation: "IPv4 manzili to'rtta oktdan iborat bo'lib, har bir oktet 0 va 255 oralig'idagi son bo'lishi shart. 256 soni bo'la olmaydi."
  },
  {
    id: "diag_10",
    type: "single_choice",
    topic: "Axborot xavfsizligi",
    subtopic: "Kiber-xavfsizlik",
    difficulty: "medium",
    question: "Foydalanuvchilarni aldash va maxfiy ma'lumotlarini (parol, karta raqami) olishga qaratilgan kiberhujum turi qanday nomlanadi?",
    options: ["Phishing (Fishing)", "DDoS", "Spam", "Trojan"],
    correctAnswer: 0,
    explanation: "Phishing - bu ijtimoiy injeneriyaga asoslangan firibgarlik turi bo'lib, soxta saytlar orqali foydalanuvchilarning parollarini va bank ma'lumotlarini o'g'irlashdir."
  },
  {
    id: "diag_11",
    type: "single_choice",
    topic: "Pedagogika",
    subtopic: "Ta'lim mezonlari",
    difficulty: "medium",
    question: "Kriterial baholash nima?",
    options: [
      "O'quvchi natijalarini oldindan belgilangan mezonlar bilan solishtirish",
      "O'quvchilarni o'zaro solishtirib reyting tuzish",
      "Faqat yakuniy imtihon ballari asosida qo'yiladigan baho",
      "O'qituvchining subyektiv fikri bo'yicha baholash"
    ],
    correctAnswer: 0,
    explanation: "Kriterial baholash tizimi o'quvchi ishini avvaldan ishlab chiqilgan, ta'lim maqsadlariga mos aniq baholash mezonlari bilan taqqoslashdir."
  },
  {
    id: "diag_12",
    type: "single_choice",
    topic: "Kasb standarti",
    subtopic: "O'qituvchi majburiyatlari",
    difficulty: "medium",
    question: "Zamonaviy informatika o'qituvchisining eng asosiy kasbiy kompetensiyalaridan biri nima?",
    options: [
      "Raqamli texnologiyalar va pedagogik uslublarni darsga integratsiya qila olish",
      "Faqat kompyuterlarni texnik ta'mirlay olish",
      "Darslikdagi matnlarni yodlatish",
      "Barcha dasturlash tillarini bilish"
    ],
    correctAnswer: 0,
    explanation: "Kasbiy standart bo'yicha o'qituvchining asosiy vazifasi AKT hamda zamonaviy pedagogik metodlarni dars jarayonida uyg'un ishlata olishdir."
  },
  // Extra questions to reach 20 questions for a solid diagnostic
  {
    id: "diag_13",
    type: "calculation",
    topic: "Axborot va kodlash",
    subtopic: "Kodlash standarti",
    difficulty: "medium",
    question: "Unicode kodlash tizimida har bir belgi xotiradan necha bayt joy egallaydi? (Javobni raqamda yozing):",
    correctAnswer: "2",
    explanation: "Unicode (xususan UTF-16) kodlash tizimida har bir belgi xotiradan 2 bayt (yoki 16 bit) joy egallaydi. ASCII-da esa 1 bayt."
  },
  {
    id: "diag_14",
    type: "code_reading",
    topic: "Scratch/Python/JS",
    subtopic: "List indexing",
    difficulty: "medium",
    question: "Quyidagi Python kodi bajarilganda ekranda nima chop etiladi?",
    code: `a = [10, 20, 30, 40]
print(a[-1] + a[1])`,
    options: ["60", "50", "30", "40"],
    correctAnswer: 0,
    explanation: "a[-1] - bu ro'yxatning oxirgi elementi ya'ni 40. a[1] esa 1-indeksdagi element ya'ni 20. 40 + 20 = 60."
  },
  {
    id: "diag_15",
    type: "single_choice",
    topic: "Kompyuter va OT",
    subtopic: "Operatsion tizim",
    difficulty: "easy",
    question: "Quyidagilardan qaysi biri ochiq kodli (Open Source) bepul operatsion tizim hisoblanadi?",
    options: ["Linux", "Windows 11", "macOS", "MS-DOS"],
    correctAnswer: 0,
    explanation: "Linux yadrosi ochiq kodli va butunlay bepul tarqatiladigan operatsion tizimlar oilasidir."
  },
  {
    id: "diag_16",
    type: "single_choice",
    topic: "Algoritmlash",
    subtopic: "Algoritm turlari",
    difficulty: "easy",
    question: "Algoritmning qaysi turi shartning bajarilishiga qarab ma'lum bir tarmoq bo'yicha davom etadi?",
    options: ["Tarmoqlanuvchi", "Chiziqli", "Takrorlanuvchi", "Davriy"],
    correctAnswer: 0,
    explanation: "Tarmoqlanuvchi algoritmlar tarkibida kamida bitta mantiqiy shart tekshiriladi va natijaga ko'ra u yoki bu tarmoq tanlanadi."
  },
  {
    id: "diag_17",
    type: "single_choice",
    topic: "Tarmoq/IP",
    subtopic: "Tarmoq protokoli",
    difficulty: "easy",
    question: "Veb-sahifalar va resurslarni uzatish uchun brauzerlar foydalanadigan asosiy protokol nima?",
    options: ["HTTP / HTTPS", "FTP", "SMTP", "DNS"],
    correctAnswer: 0,
    explanation: "HTTP (HyperText Transfer Protocol) va uning xavfsiz versiyasi HTTPS veb-saytlarni uzatishning asosiy protokollaridir."
  },
  {
    id: "diag_18",
    type: "single_choice",
    topic: "Database",
    subtopic: "Primary Key",
    difficulty: "medium",
    question: "Ma'lumotlar bazasida Primary Key (Birlamchi kalit) ning asosiy vazifasi nima?",
    options: [
      "Satrning takrorlanmasligini (unikal) ta'minlash",
      "Ma'lumotlarni shifrlash",
      "Tashqi jadvallar bilan bog'lashni man qilish",
      "Kiritilgan qiymatlarni o'chirish"
    ],
    correctAnswer: 0,
    explanation: "Birlamchi kalit jadvaldagi har bir satrni unikal identifikatsiya qilish uchun xizmat qiladi, u takrorlanishi mumkin emas."
  },
  {
    id: "diag_19",
    type: "single_choice",
    topic: "HTML/CSS/Grafika",
    subtopic: "HTML tags",
    difficulty: "easy",
    question: "HTMLda rasmlarni joylashtirish uchun qaysi teg ishlatiladi?",
    options: ["<img>", "<picture>", "<src>", "<href>"],
    correctAnswer: 0,
    explanation: "HTMLda veb-sahifaga rasm qo'shish uchun faqat bitta <img> tegi ishlatiladi (src atributi orqali rasm manzili beriladi)."
  },
  {
    id: "diag_20",
    type: "single_choice",
    topic: "Pedagogika",
    subtopic: "Metodlar",
    difficulty: "medium",
    question: "Muammoli ta'lim texnologiyasining asosiy maqsadi nima?",
    options: [
      "O'quvchilarda muammoni mustaqil yechish va mantiqiy fikrlashni rivojlantirish",
      "Darsni tezroq yakunlash",
      "Tayyor formulalarni yodlatish",
      "O'quvchilar intizomini nazorat qilish"
    ],
    correctAnswer: 0,
    explanation: "Muammoli ta'lim metodi o'quvchi oldiga muammoli vaziyat qo'yib, uni mustaqil izlanish, tahlil qilish orqali yechishga undaydi."
  }
];
