// Mock question bank for the diagnostic test (50 questions across 8 domains).
// Replace with real Supabase question_bank data later — the diagnostic UI reads
// from this module today.

export interface DiagnosticQuestion {
  id: string;
  domain: string;
  text: string;
  options: string[]; // exactly 4
  correctIndex: number; // 0-3
}

export interface DiagnosticDomain {
  name: string;
  count: number;
}

// Domain order + expected question counts shown on the intro screen.
export const DIAGNOSTIC_DOMAINS: DiagnosticDomain[] = [
  { name: 'Axborot va raqamli savodxonlik', count: 5 },
  { name: 'Kompyuter tizimlari va Office', count: 7 },
  { name: 'Mantiq va sanoq sistemalari', count: 8 },
  { name: 'Dasturlash va MB', count: 8 },
  { name: 'Grafika va veb-texnologiyalar', count: 5 },
  { name: 'Tarmoqlar', count: 3 },
  { name: 'Xavfsizlik va raqamli xizmatlar', count: 4 },
  { name: 'Pedagogika va metodika', count: 10 }
];

export const diagnosticMockQuestions: DiagnosticQuestion[] = [
  // ── Axborot va raqamli savodxonlik (5) ──
  { id: 'd1', domain: 'Axborot va raqamli savodxonlik', text: '1 bayt nechta bitdan iborat?', options: ['4', '8', '16', '2'], correctIndex: 1 },
  { id: 'd2', domain: 'Axborot va raqamli savodxonlik', text: 'Axborotning eng kichik oʻlchov birligi qaysi?', options: ['Bayt', 'Bit', 'Kilobayt', 'Megabayt'], correctIndex: 1 },
  { id: 'd3', domain: 'Axborot va raqamli savodxonlik', text: '1 Kilobayt necha baytga teng?', options: ['1000', '1024', '512', '2048'], correctIndex: 1 },
  { id: 'd4', domain: 'Axborot va raqamli savodxonlik', text: 'Quyidagilardan qaysi biri raqamli axborot turi emas?', options: ['Matn', 'Rasm', 'Hid', 'Video'], correctIndex: 2 },
  { id: 'd5', domain: 'Axborot va raqamli savodxonlik', text: 'ASCII kodlash tizimi nima uchun ishlatiladi?', options: ['Rasmlarni siqish', 'Belgilarni raqamlar bilan ifodalash', 'Ovozni yozish', 'Videoni tahrirlash'], correctIndex: 1 },

  // ── Kompyuter tizimlari va Office (7) ──
  { id: 'd6', domain: 'Kompyuter tizimlari va Office', text: "Kompyuterning 'miyasi' deb nima ataladi?", options: ['Operativ xotira', 'Protsessor (CPU)', 'Qattiq disk', 'Monitor'], correctIndex: 1 },
  { id: 'd7', domain: 'Kompyuter tizimlari va Office', text: 'Operativ xotira (RAM) qanday xotira hisoblanadi?', options: ['Doimiy', 'Vaqtinchalik', 'Optik', 'Magnit'], correctIndex: 1 },
  { id: 'd8', domain: 'Kompyuter tizimlari va Office', text: 'MS Wordda matnni qalin (bold) qilish uchun qaysi tugmalar bosiladi?', options: ['Ctrl+I', 'Ctrl+B', 'Ctrl+U', 'Ctrl+S'], correctIndex: 1 },
  { id: 'd9', domain: 'Kompyuter tizimlari va Office', text: 'MS Excelda yacheykalar yigʻindisini hisoblovchi funksiya qaysi?', options: ['AVERAGE', 'COUNT', 'SUM', 'MAX'], correctIndex: 2 },
  { id: 'd10', domain: 'Kompyuter tizimlari va Office', text: 'Operatsion tizimning asosiy vazifasi nima?', options: ['Faqat oʻyin oʻynash', 'Qurilma va dasturlarni boshqarish', 'Internetga ulanish', 'Rasm chizish'], correctIndex: 1 },
  { id: 'd11', domain: 'Kompyuter tizimlari va Office', text: 'Quyidagilardan qaysi biri operatsion tizim?', options: ['MS Word', 'Windows', 'Photoshop', 'Chrome'], correctIndex: 1 },
  { id: 'd12', domain: 'Kompyuter tizimlari va Office', text: 'Faylni saqlash uchun MS Wordda qaysi tugmalar ishlatiladi?', options: ['Ctrl+P', 'Ctrl+S', 'Ctrl+C', 'Ctrl+V'], correctIndex: 1 },

  // ── Mantiq va sanoq sistemalari (8) ──
  { id: 'd13', domain: 'Mantiq va sanoq sistemalari', text: "AND (mantiqiy 'va') amali qachon 1 (rost) qiymat beradi?", options: ['Ikkala operand ham 1 boʻlsa', 'Hech boʻlmasa bittasi 1 boʻlsa', 'Ikkalasi 0 boʻlsa', 'Hech qachon'], correctIndex: 0 },
  { id: 'd14', domain: 'Mantiq va sanoq sistemalari', text: "OR (mantiqiy 'yoki') amali qachon 0 (yolgʻon) qiymat beradi?", options: ['Bittasi 1 boʻlsa', 'Ikkala operand ham 0 boʻlsa', 'Ikkalasi 1 boʻlsa', 'Doimo'], correctIndex: 1 },
  { id: 'd15', domain: 'Mantiq va sanoq sistemalari', text: '2 lik sanoq sistemasidagi 101 soni 10 lik sistemada nechaga teng?', options: ['3', '5', '7', '101'], correctIndex: 1 },
  { id: 'd16', domain: 'Mantiq va sanoq sistemalari', text: '10 lik sistemadagi 8 soni 2 lik sistemada qanday yoziladi?', options: ['1000', '100', '110', '1010'], correctIndex: 0 },
  { id: 'd17', domain: 'Mantiq va sanoq sistemalari', text: 'NOT (inkor) amali 1 qiymatni nimaga aylantiradi?', options: ['1', '0', '2', '10'], correctIndex: 1 },
  { id: 'd18', domain: 'Mantiq va sanoq sistemalari', text: '2 lik sistemadagi 11 soni 10 lik sistemada nechaga teng?', options: ['2', '3', '4', '11'], correctIndex: 1 },
  { id: 'd19', domain: 'Mantiq va sanoq sistemalari', text: 'Bir baytda maksimal nechta turli qiymat ifodalanishi mumkin?', options: ['128', '255', '256', '512'], correctIndex: 2 },
  { id: 'd20', domain: 'Mantiq va sanoq sistemalari', text: '16 lik (oʻn oltilik) sanoq sistemasida nechta belgi ishlatiladi?', options: ['8', '10', '16', '2'], correctIndex: 2 },

  // ── Dasturlash va MB (8) ──
  { id: 'd21', domain: 'Dasturlash va MB', text: 'Pythonda ekranga matn chiqarish uchun qaysi funksiya ishlatiladi?', options: ['input()', 'print()', 'echo()', 'write()'], correctIndex: 1 },
  { id: 'd22', domain: 'Dasturlash va MB', text: 'Quyidagilardan qaysi biri takrorlash (sikl) operatori?', options: ['if', 'for', 'def', 'import'], correctIndex: 1 },
  { id: 'd23', domain: 'Dasturlash va MB', text: 'Pythonda roʻyxat (list) qaysi qavslar bilan yoziladi?', options: ['()', '[]', '{}', '<>'], correctIndex: 1 },
  { id: 'd24', domain: 'Dasturlash va MB', text: 'Maʼlumotlar bazasida jadval satri nima deb ataladi?', options: ['Ustun', 'Yozuv (qator)', 'Kalit', 'Indeks'], correctIndex: 1 },
  { id: 'd25', domain: 'Dasturlash va MB', text: 'SQL da maʼlumotni tanlab olish uchun qaysi buyruq ishlatiladi?', options: ['INSERT', 'DELETE', 'SELECT', 'UPDATE'], correctIndex: 2 },
  { id: 'd26', domain: 'Dasturlash va MB', text: 'Dasturlashda oʻzgaruvchi (variable) nima?', options: ['Oʻzgarmas son', 'Maʼlumot saqlanadigan nomli joy', 'Funksiya nomi', 'Fayl turi'], correctIndex: 1 },
  { id: 'd27', domain: 'Dasturlash va MB', text: 'Pythonda bir qatorli izoh (comment) qaysi belgi bilan boshlanadi?', options: ['//', '#', '/*', '--'], correctIndex: 1 },
  { id: 'd28', domain: 'Dasturlash va MB', text: 'Maʼlumotlar bazasida birlamchi kalit (primary key) vazifasi nima?', options: ['Jadvalni boʻyash', 'Har bir yozuvni yagona aniqlash', 'Maʼlumotni oʻchirish', 'Hisoblash'], correctIndex: 1 },

  // ── Grafika va veb-texnologiyalar (5) ──
  { id: 'd29', domain: 'Grafika va veb-texnologiyalar', text: 'Veb-sahifa tuzilmasini yaratish uchun qaysi til ishlatiladi?', options: ['CSS', 'HTML', 'Python', 'SQL'], correctIndex: 1 },
  { id: 'd30', domain: 'Grafika va veb-texnologiyalar', text: 'Veb-sahifaning koʻrinishi (stili) uchun qaysi til ishlatiladi?', options: ['HTML', 'CSS', 'PHP', 'SQL'], correctIndex: 1 },
  { id: 'd31', domain: 'Grafika va veb-texnologiyalar', text: 'Quyidagilardan qaysi biri rastrli (piksel) grafika formati?', options: ['SVG', 'JPG', 'CDR', 'AI'], correctIndex: 1 },
  { id: 'd32', domain: 'Grafika va veb-texnologiyalar', text: 'RGB rang modeli qaysi ranglardan iborat?', options: ['Qizil, Yashil, Koʻk', 'Qizil, Sariq, Koʻk', 'Yashil, Sariq, Qora', 'Koʻk, Oq, Qora'], correctIndex: 0 },
  { id: 'd33', domain: 'Grafika va veb-texnologiyalar', text: 'Veb-saytga kirish manzili qanday ataladi?', options: ['HTML', 'URL', 'CPU', 'RAM'], correctIndex: 1 },

  // ── Tarmoqlar (3) ──
  { id: 'd34', domain: 'Tarmoqlar', text: 'Internet — bu nima?', options: ['Bitta kompyuter', 'Oʻzaro bogʻlangan kompyuter tarmoqlari', 'Dastur', 'Operatsion tizim'], correctIndex: 1 },
  { id: 'd35', domain: 'Tarmoqlar', text: 'IP-manzil nima uchun kerak?', options: ['Qurilmani tarmoqda aniqlash uchun', 'Rasm chizish uchun', 'Matn yozish uchun', 'Ovoz chiqarish uchun'], correctIndex: 0 },
  { id: 'd36', domain: 'Tarmoqlar', text: 'Mahalliy tarmoq qanday qisqartma bilan ataladi?', options: ['WAN', 'LAN', 'URL', 'USB'], correctIndex: 1 },

  // ── Xavfsizlik va raqamli xizmatlar (4) ──
  { id: 'd37', domain: 'Xavfsizlik va raqamli xizmatlar', text: 'Kuchli parol qanday boʻlishi kerak?', options: ['Qisqa va sodda', 'Uzun, harf, raqam va belgilardan iborat', 'Faqat raqamlardan', 'Ism va tugʻilgan sanadan'], correctIndex: 1 },
  { id: 'd38', domain: 'Xavfsizlik va raqamli xizmatlar', text: 'Kompyuterni viruslardan himoyalovchi dastur qanday ataladi?', options: ['Antivirus', 'Brauzer', 'Tahrirlovchi', 'Kompilyator'], correctIndex: 0 },
  { id: 'd39', domain: 'Xavfsizlik va raqamli xizmatlar', text: 'Fishing (phishing) hujumi nima?', options: ['Baliq ovlash', 'Aldab maxfiy maʼlumot olish', 'Faylni siqish', 'Tarmoqni tezlashtirish'], correctIndex: 1 },
  { id: 'd40', domain: 'Xavfsizlik va raqamli xizmatlar', text: 'Maxfiy maʼlumotlarni himoyalashning eng yaxshi usuli qaysi?', options: ['Hammaga aytish', 'Shifrlash (kodlash)', 'Ish stoliga yozib qoʻyish', 'Oʻchirib tashlash'], correctIndex: 1 },

  // ── Pedagogika va metodika (10) ──
  { id: 'd41', domain: 'Pedagogika va metodika', text: 'Kriterial baholash nimaga asoslanadi?', options: ['Oʻquvchilarni bir-biriga solishtirishga', 'Oldindan belgilangan mezonlarga', 'Tasodifga', 'Faqat imtihonga'], correctIndex: 1 },
  { id: 'd42', domain: 'Pedagogika va metodika', text: 'Formativ baholash qachon oʻtkaziladi?', options: ['Oʻquv jarayoni davomida', 'Faqat yil oxirida', 'Hech qachon', 'Faqat imtihonda'], correctIndex: 0 },
  { id: 'd43', domain: 'Pedagogika va metodika', text: 'Differensial taʼlim nimani nazarda tutadi?', options: ['Barchaga bir xil yondashuvni', 'Oʻquvchilarning individual ehtiyojini hisobga olishni', 'Faqat kuchli oʻquvchilar bilan ishlashni', 'Baholamaslikni'], correctIndex: 1 },
  { id: 'd44', domain: 'Pedagogika va metodika', text: 'Quyidagilardan qaysi biri interfaol metod?', options: ['Maʼruza oʻqish', 'Klaster va bahs-munozara', 'Diktovka', 'Kitobdan koʻchirish'], correctIndex: 1 },
  { id: 'd45', domain: 'Pedagogika va metodika', text: 'Taʼlim maqsadlari qanday boʻlishi kerak?', options: ['Noaniq', 'Aniq va oʻlchanadigan', 'Maxfiy', 'Faqat ogʻzaki'], correctIndex: 1 },
  { id: 'd46', domain: 'Pedagogika va metodika', text: 'Summativ baholashning asosiy maqsadi nima?', options: ['Yakuniy natijani aniqlash', 'Dars boshida qiziqtirish', 'Oʻyin oʻynash', 'Davomatni belgilash'], correctIndex: 0 },
  { id: 'd47', domain: 'Pedagogika va metodika', text: "'Aqliy hujum' (brainstorming) metodi nimaga qaratilgan?", options: ['Jazolashga', 'Koʻp gʻoyalar generatsiya qilishga', 'Tinchlikka', 'Faqat baholashga'], correctIndex: 1 },
  { id: 'd48', domain: 'Pedagogika va metodika', text: 'Oʻquvchi faolligini oshiruvchi yondashuv qaysi?', options: ['Passiv tinglash', 'Faoliyatga asoslangan taʼlim', 'Faqat yozish', 'Jim oʻtirish'], correctIndex: 1 },
  { id: 'd49', domain: 'Pedagogika va metodika', text: 'Refleksiya odatda darsning qaysi qismida oʻtkaziladi?', options: ['Boshida', 'Oxirida (yakunida)', 'Faqat tanaffusda', 'Oʻtkazilmaydi'], correctIndex: 1 },
  { id: 'd50', domain: 'Pedagogika va metodika', text: 'Pedagogik diagnostika nima uchun kerak?', options: ['Oʻquvchi bilim darajasini aniqlash uchun', 'Jazolash uchun', 'Vaqt oʻtkazish uchun', 'Reyting tuzish uchun'], correctIndex: 0 }
];
