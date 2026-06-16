-- =========================================================================
-- SEED: Lesson 1 "Axborot, ma'lumot va bilim" (module axborot_savodxonlik)
-- Run AFTER lesson_steps_migration.sql.
-- Fixed UUIDs are used so the lesson can be opened directly and re-run safely.
-- Apostrophes use ʻ / ʼ (modifier letters) to avoid SQL string escaping.
-- =========================================================================

-- 1) Module + lesson under the attestatsiya course --------------------------
insert into public.modules (id, course_id, order_index) values
  ('0a7e0d01-0000-4000-8000-000000000001', '0a7e57a7-0000-4000-8000-000000000001', 0)
on conflict (id) do nothing;

insert into public.module_translations (module_id, locale, title) values
  ('0a7e0d01-0000-4000-8000-000000000001', 'uz', 'Axborot va raqamli savodxonlik')
on conflict (module_id, locale) do nothing;

insert into public.lessons (id, module_id, video_url, content, order_index) values
  ('0a7e1e01-0000-4000-8000-000000000001', '0a7e0d01-0000-4000-8000-000000000001', null,
   'Legacy fallback konspekti (qadamlar mavjud boʻlsa koʻrsatilmaydi).', 0)
on conflict (id) do nothing;

insert into public.lesson_translations (lesson_id, locale, title, content) values
  ('0a7e1e01-0000-4000-8000-000000000001', 'uz', 'Axborot, maʼlumot va bilim', null)
on conflict (lesson_id, locale) do nothing;

-- 2) Seven steps ------------------------------------------------------------
insert into public.lesson_steps (id, lesson_id, step_type, order_index) values
  ('0a7e5701-0000-4000-8000-000000000001', '0a7e1e01-0000-4000-8000-000000000001', 'text',            1),
  ('0a7e5702-0000-4000-8000-000000000002', '0a7e1e01-0000-4000-8000-000000000001', 'quiz',            2),
  ('0a7e5703-0000-4000-8000-000000000003', '0a7e1e01-0000-4000-8000-000000000001', 'text',            3),
  ('0a7e5704-0000-4000-8000-000000000004', '0a7e1e01-0000-4000-8000-000000000001', 'quiz',            4),
  ('0a7e5705-0000-4000-8000-000000000005', '0a7e1e01-0000-4000-8000-000000000001', 'common_mistakes', 5),
  ('0a7e5706-0000-4000-8000-000000000006', '0a7e1e01-0000-4000-8000-000000000001', 'quiz',            6),
  ('0a7e5707-0000-4000-8000-000000000007', '0a7e1e01-0000-4000-8000-000000000001', 'summary',         7)
on conflict (id) do nothing;

-- 3) Step translations (uz) -------------------------------------------------
insert into public.lesson_step_translations (step_id, locale, title, content) values
('0a7e5701-0000-4000-8000-000000000001', 'uz', 'Asosiy tushunchalar',
'## Maʼlumot, axborot va bilim

Bu uchta tushuncha bir-biri bilan bogʻliq, lekin bir xil emas.

- **Maʼlumot (data)** — qayta ishlanmagan xom faktlar, raqamlar yoki belgilar. Masalan: `25`, `Toshkent`, `01010101`.
- **Axborot (information)** — maʼlumot qayta ishlanib, maʼno va kontekst kasb etgani. Masalan: "Bugun Toshkentda harorat 25°C".
- **Bilim (knowledge)** — axborotni tushunish, tahlil qilish va qoʻllash natijasida shakllanadigan tajriba.

### Ierarxiya

Maʼlumot → (qayta ishlash) → Axborot → (tushunish, tajriba) → Bilim

Yaʼni xom maʼlumot kontekst bilan boyitilganda axborotga, axborot esa oʻzlashtirilib qoʻllanilganda bilimga aylanadi.'),

('0a7e5702-0000-4000-8000-000000000002', 'uz', 'Tushunchalarni farqlash', null),

('0a7e5703-0000-4000-8000-000000000003', 'uz', 'Axborotning xossalari va kodlash',
'## Axborotning asosiy xossalari

Sifatli axborot quyidagi xossalarga ega boʻladi:

1. **Toʻliqlik** — qaror qabul qilish uchun yetarli boʻlishi.
2. **Ishonchlilik** — haqiqatga mos, xatosiz boʻlishi.
3. **Aniqlik** — voqelikni qanchalik aniq aks ettirishi.
4. **Dolzarblik** — oʻz vaqtida, kerakli paytda boʻlishi.
5. **Tushunarlilik** — qabul qiluvchi uchun tushunarli boʻlishi.

## Axborotni oʻlchash birliklari

Eng kichik birlik — **bit** (0 yoki 1).

- 1 **bayt** = 8 bit
- 1 **Kilobayt (KB)** = 1024 bayt
- 1 **Megabayt (MB)** = 1024 KB
- 1 **Gigabayt (GB)** = 1024 MB

> Diqqat: kompyuter olamida oʻlchovlar **1024** karrali (2 in 10-darajasi), 1000 emas!'),

('0a7e5704-0000-4000-8000-000000000004', 'uz', 'Oʻlchov birliklari hisobi', null),

('0a7e5705-0000-4000-8000-000000000005', 'uz', 'Tez-tez uchraydigan xatolar',
'Quyidagi xatolar imtihonlarda koʻp uchraydi:

**❌ Xato:** 1 MB = 1000 KB deb hisoblash.
**✓ Toʻgʻri:** 1 MB = 1024 KB — oʻlchovlar 1024 karrali.

**❌ Xato:** Megabit (Mbit) va Megabayt (MB) ni aralashtirish.
**✓ Toʻgʻri:** 1 bayt = 8 bit, demak 1 MB = 8 Mbit. Internet tezligi **bit**da (Mbit/s), fayl hajmi **bayt**da (MB) oʻlchanadi.

**❌ Xato:** Har qanday raqamlar toʻplamini "axborot" deb atash.
**✓ Toʻgʻri:** Xom raqamlar — bu **maʼlumot**; u maʼno kasb etgandagina **axborot** boʻladi.

<!-- TODO: kerak boʻlsa yana 1 ta real keysdagi xatoni qoʻshing -->'),

('0a7e5706-0000-4000-8000-000000000006', 'uz', 'Amaliy tahlil', null),

('0a7e5707-0000-4000-8000-000000000007', 'uz', 'Xulosa',
'Asosiy tezislar:

- **Maʼlumot** — xom faktlar; **axborot** — maʼno kasb etgan maʼlumot; **bilim** — qoʻllaniladigan tajriba.
- Axborotning 5 xossasi: toʻliqlik, ishonchlilik, aniqlik, dolzarblik, tushunarlilik.
- Eng kichik birlik — bit; 1 bayt = 8 bit.
- Oʻlchovlar **1024** karrali: 1 KB = 1024 bayt, 1 MB = 1024 KB, 1 GB = 1024 MB.
- Mbit (tezlik) va MB (hajm) — har xil narsa: 1 MB = 8 Mbit.')
on conflict (step_id, locale) do nothing;

-- 4) New questions for axborot_savodxonlik (2 qollash + 3 mulohaza) ---------
insert into public.question_bank (id, domain, subdomain, question_type, difficulty, cognitive_level) values
  ('0a7eb001-0000-4000-8000-000000000001', 'axborot_savodxonlik', 'Oʻlchov birliklari', 'multiple_choice', 'medium', 'qollash'),
  ('0a7eb002-0000-4000-8000-000000000002', 'axborot_savodxonlik', 'Oʻlchov birliklari', 'multiple_choice', 'medium', 'qollash'),
  ('0a7ec001-0000-4000-8000-000000000001', 'axborot_savodxonlik', 'Tahlil',            'multiple_choice', 'hard',   'mulohaza'),
  ('0a7ec002-0000-4000-8000-000000000002', 'axborot_savodxonlik', 'Tahlil',            'multiple_choice', 'medium', 'mulohaza'),
  ('0a7ec003-0000-4000-8000-000000000003', 'axborot_savodxonlik', 'Tahlil',            'multiple_choice', 'hard',   'mulohaza')
on conflict (id) do nothing;

insert into public.question_bank_translations (question_id, locale, question_text, options) values
('0a7eb001-0000-4000-8000-000000000001', 'uz', '2 KB necha baytga teng?',
 '[{"text":"2048 bayt","is_correct":true},{"text":"2000 bayt","is_correct":false},{"text":"1024 bayt","is_correct":false},{"text":"512 bayt","is_correct":false}]'),
('0a7eb002-0000-4000-8000-000000000002', 'uz', '3 Megabayt necha Kilobaytga teng?',
 '[{"text":"3072 KB","is_correct":true},{"text":"3000 KB","is_correct":false},{"text":"1536 KB","is_correct":false},{"text":"1024 KB","is_correct":false}]'),
('0a7ec001-0000-4000-8000-000000000001', 'uz', 'Talaba 1 GB ni 1000 MB deb hisobladi. Uning xatosi nimada?',
 '[{"text":"Oʻlchovlar 1024 karrali — toʻgʻrisi 1 GB = 1024 MB","is_correct":true},{"text":"Xato yoʻq, hammasi toʻgʻri","is_correct":false},{"text":"1 GB = 100 MB boʻlishi kerak","is_correct":false},{"text":"1 GB = 10 MB boʻlishi kerak","is_correct":false}]'),
('0a7ec002-0000-4000-8000-000000000002', 'uz', 'Quyidagilardan qaysi biri "axborot" (information)ga misol boʻladi?',
 '[{"text":"Bugun Toshkentda harorat 25°C","is_correct":true},{"text":"01010101","is_correct":false},{"text":"25","is_correct":false},{"text":"Tartibsiz belgilar toʻplami","is_correct":false}]'),
('0a7ec003-0000-4000-8000-000000000003', 'uz', 'Fayl hajmi 5120 KB. Bu necha MB ga teng?',
 '[{"text":"5 MB","is_correct":true},{"text":"5.12 MB","is_correct":false},{"text":"51.2 MB","is_correct":false},{"text":"0.5 MB","is_correct":false}]')
on conflict (question_id, locale) do nothing;

-- 5) Quiz step ↔ question links (3 per quiz step = 9 total) ------------------
insert into public.lesson_step_questions (step_id, question_id, order_index) values
  -- Step 2 (bilish) — existing questions
  ('0a7e5702-0000-4000-8000-000000000002', 'efeeaa20-75dd-4e98-9505-1bcccc2760c2', 0),
  ('0a7e5702-0000-4000-8000-000000000002', 'fc63fc1b-3ead-45e4-8d35-9d5b2dec63b1', 1),
  ('0a7e5702-0000-4000-8000-000000000002', '5fc7b968-e6c8-4cc2-9cfa-bfe7a47fe842', 2),
  -- Step 4 (qollash) — 1 existing + 2 new
  ('0a7e5704-0000-4000-8000-000000000004', 'f1d55476-f876-4a51-8be3-7f1c594ad942', 0),
  ('0a7e5704-0000-4000-8000-000000000004', '0a7eb001-0000-4000-8000-000000000001', 1),
  ('0a7e5704-0000-4000-8000-000000000004', '0a7eb002-0000-4000-8000-000000000002', 2),
  -- Step 6 (mulohaza) — 3 new
  ('0a7e5706-0000-4000-8000-000000000006', '0a7ec001-0000-4000-8000-000000000001', 0),
  ('0a7e5706-0000-4000-8000-000000000006', '0a7ec002-0000-4000-8000-000000000002', 1),
  ('0a7e5706-0000-4000-8000-000000000006', '0a7ec003-0000-4000-8000-000000000003', 2)
on conflict (step_id, question_id) do nothing;

-- Lesson to open:  /attestatsiya/dars/0a7e1e01-0000-4000-8000-000000000001
