#!/usr/bin/env python3
import json

BLUEPRINT = [
    ('pedagogika', 15),
    ('axborot_savodxonlik', 8),
    ('mantiq_sanoq', 8),
    ('dasturlash_mb', 7),
    ('kompyuter_office', 5),
    ('grafika_veb', 3),
    ('xavfsizlik', 2),
    ('tarmoqlar', 2)
]

COURSE_1 = '0a7e57a7-0000-4000-8000-000000000001' # Informatika
COURSE_2 = '0b7e57a7-0000-4000-8000-000000000002' # Tarix

sql = []

# Courses
sql.append(f"""
INSERT INTO public.courses (id, title, description)
VALUES
  ('{COURSE_1}', 'Informatika va axborot texnologiyalari', 'Attestatsiya kursi'),
  ('{COURSE_2}', 'Tarix fani', 'Tarix fani attestatsiyasi')
ON CONFLICT (id) DO NOTHING;
""")

# Users
ALICE_ID = '11111111-1111-4111-8111-111111111111'
BOB_ID   = '22222222-2222-4222-8222-222222222222'
CHARLIE_ID = '33333333-3333-4333-8333-333333333333'
ADMIN_ID = '99999999-9999-4999-8999-999999999999'

sql.append(f"""
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
  ('{ALICE_ID}', 'alice@example.com', '{{"full_name": "Alice User"}}'::jsonb),
  ('{BOB_ID}', 'bob@example.com', '{{"full_name": "Bob User"}}'::jsonb),
  ('{CHARLIE_ID}', 'charlie@example.com', '{{"full_name": "Charlie Pro"}}'::jsonb),
  ('{ADMIN_ID}', 'admin@example.com', '{{"full_name": "Super Admin"}}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, role, subscription_tier, xp) VALUES
  ('{ALICE_ID}', 'Alice User', 'student', 'free', 0),
  ('{BOB_ID}', 'Bob User', 'student', 'free', 0),
  ('{CHARLIE_ID}', 'Charlie Pro', 'student', 'pro', 150),
  ('{ADMIN_ID}', 'Super Admin', 'admin', 'pro', 500)
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, subscription_tier = EXCLUDED.subscription_tier;
""")

# 50 questions for Course 1
q_idx = 1
for domain, count in BLUEPRINT:
    for i in range(1, count + 1):
        q_id = f"10000000-0000-4000-8000-{q_idx:012d}"
        q_text = f"Savol #{q_idx}: {domain} mavzusiga oid test savoli {i}"
        options = [
            {"text": f"Variant A (toʻgʻri) - {q_idx}", "is_correct": True},
            {"text": f"Variant B (notoʻgʻri) - {q_idx}", "is_correct": False},
            {"text": f"Variant C (notoʻgʻri) - {q_idx}", "is_correct": False},
            {"text": f"Variant D (notoʻgʻri) - {q_idx}", "is_correct": False}
        ]
        opt_json = json.dumps(options).replace("'", "''")
        
        sql.append(f"""
        INSERT INTO public.question_bank (id, domain, question_type, difficulty)
        VALUES ('{q_id}', '{domain}', 'multiple_choice', 'medium')
        ON CONFLICT (id) DO NOTHING;

        INSERT INTO public.question_bank_translations (question_id, locale, question_text, options)
        VALUES ('{q_id}', 'uz', '{q_text}', '{opt_json}'::jsonb)
        ON CONFLICT (question_id, locale) DO UPDATE SET options = '{opt_json}'::jsonb;
        """)
        q_idx += 1

# 5 questions for Course 2
for i in range(1, 6):
    q_id = f"20000000-0000-4000-8000-{i:012d}"
    q_text = f"Tarix savoli #{i}"
    options = [
        {"text": f"Variant A (toʻgʻri) - {i}", "is_correct": True},
        {"text": f"Variant B - {i}", "is_correct": False},
        {"text": f"Variant C - {i}", "is_correct": False},
        {"text": f"Variant D - {i}", "is_correct": False}
    ]
    opt_json = json.dumps(options).replace("'", "''")
    sql.append(f"""
    INSERT INTO public.question_bank (id, domain, question_type, difficulty)
    VALUES ('{q_id}', 'tarix_asoslari', 'multiple_choice', 'medium')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.question_bank_translations (question_id, locale, question_text, options)
    VALUES ('{q_id}', 'uz', '{q_text}', '{opt_json}'::jsonb)
    ON CONFLICT (question_id, locale) DO UPDATE SET options = '{opt_json}'::jsonb;
    """)

with open('/tmp/seed_test_cluster.sql', 'w') as f:
    f.write("\n".join(sql))

print("Regenerated /tmp/seed_test_cluster.sql successfully.")
