"""
Run once to create the 4 Supabase tables.
Uses the Management / REST SQL endpoint with the service_role key.
"""
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SERVICE_KEY   = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

SQL = """
-- 1. Patients
create table if not exists patients (
    id          uuid primary key default gen_random_uuid(),
    tc_no       text unique not null,
    full_name   text not null,
    birth_date  date,
    gender      text,
    phone       text,
    email       text,
    created_at  timestamptz default now()
);

-- 2. Visits
create table if not exists visits (
    id          uuid primary key default gen_random_uuid(),
    patient_id  uuid references patients(id) on delete cascade,
    visit_date  timestamptz default now(),
    complaint   text,
    notes       text,
    doctor_id   text
);

-- 3. Analysis results (NovaVision YOLO output)
create table if not exists analysis_results (
    id              uuid primary key default gen_random_uuid(),
    visit_id        uuid references visits(id) on delete cascade,
    patient_id      uuid references patients(id) on delete cascade,
    disease_name    text not null,
    confidence      numeric(5,4),
    image_url       text,
    raw_response    jsonb,
    analyzed_at     timestamptz default now()
);

-- 4. AI reports (PUQ.ai output)
create table if not exists ai_reports (
    id              uuid primary key default gen_random_uuid(),
    analysis_id     uuid references analysis_results(id) on delete cascade,
    patient_id      uuid references patients(id) on delete cascade,
    report_text     text,
    recommendations text,
    created_at      timestamptz default now()
);
"""

headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
}

resp = httpx.post(
    f"{SUPABASE_URL}/rest/v1/rpc/exec_sql",
    headers=headers,
    json={"query": SQL},
    timeout=30,
)

if resp.status_code in (200, 201, 204):
    print("Tables created successfully.")
else:
    # Supabase doesn't expose exec_sql by default — fall back to printing the SQL
    print(f"Status: {resp.status_code}  Body: {resp.text}")
    print("\n--- Run the SQL below manually in Supabase SQL Editor ---")
    print(SQL)
