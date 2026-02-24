"""
Off-line Excel Export Pipeline
Fetches data from Supabase and creates separate Excel files for each district.
Each file contains multiple sheets (Intro, Crop, Livestock, Fisheries, Markets).
"""

import requests
import pandas as pd
import os
import re
from datetime import datetime

# ============================================
# CONFIGURATION
# ============================================

SUPABASE_URL = "https://owvmkdqdfytzlvdrtyrl.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93dm1rZHFkZnl0emx2ZHJ0eXJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MjQ2NjIsImV4cCI6MjA4NDMwMDY2Mn0.EVxxETJigW1pTByGwi1G3JfjLbr0gMzmAc1QiL1ft-A"
TABLE_NAME = "assessments"
OUTPUT_FOLDER = "district_reports"

# Define section fields (matches constants.js)
SECTION_FIELDS = {
    'intro': ['statisticalRegion', 'district', 'subCounty', 'officialName', 'officialTitle', 'submittedAt'],
    'crop': ['normalYearEvents', 'lastSeasonEvents', 'normalYearLevels', 'currentYearLevels', 'cropPerformance', 'landSizeByHousehold', 'cropYields', 'cropUtilization', 'foodStocks', 'stapleAvailability', 'mealsPerDay', 'poorPerformanceReasons', 'subCountyRanking', 'affectedParishes', 'foodSecurityRanking', 'productionConstraints', 'diseaseOutbreaks', 'copingStrategies'],
    'livestock': ['livestockConditions', 'livestockNumbers', 'livestockMigration', 'livestockMarketConditions', 'livestockOutbreaks', 'livestockInterventions', 'drugAvailability', 'milkProduction', 'waterSources'],
    'fisheries': ['fishingHouseholds', 'fishingActivityChange', 'waterBodies', 'fishCatch', 'fishUtilization', 'fishPonds', 'stockedPonds', 'fishSpecies', 'aquacultureHarvest', 'fishingChallenges'],
    'markets': ['markets']
}

# ============================================
# UTILITIES
# ============================================

def clean_label(text):
    """Converts camelCase or snake_case to Space Case"""
    if not text: return ""
    # Space before capitals
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1 \2', text)
    s2 = re.sub('([a-z0-9])([A-Z])', r'\1 \2', s1)
    # Underscores to spaces
    return s2.replace('_', ' ').title()

def get_base_data(assessment, submission):
    """Returns the base metadata for every row"""
    return {
        'Assessment_ID': assessment.get('id'),
        'District': submission.get('district', '').title(),
        'Sub_County': submission.get('subCounty', '').title(),
        'Region': submission.get('statisticalRegion', '').title(),
        'Official_Name': submission.get('officialName', ''),
        'Submitted_At': submission.get('submittedAt') or assessment.get('created_at')
    }

# ============================================
# FLATTENERS
# ============================================

def flatten_section(assessment, submission, section_key):
    """Generic flattener for Crop, Livestock, and Fisheries"""
    rows = []
    base = get_base_data(assessment, submission)
    fields = SECTION_FIELDS.get(section_key, [])

    for field in fields:
        val = submission.get(field)
        if val is None or val == "" or val == {}: continue

        cat_label = clean_label(field)

        if isinstance(val, dict):
            for k, v in val.items():
                if v is None or v == "": continue
                row = base.copy()
                row.update({
                    'Category': cat_label,
                    'Item': clean_label(k),
                    'Value': str(v) if isinstance(v, (dict, list)) else v
                })
                rows.append(row)
        else:
            row = base.copy()
            row.update({
                'Category': cat_label,
                'Item': 'Value',
                'Value': ", ".join(val) if isinstance(val, list) else val
            })
            rows.append(row)
    return rows

def flatten_markets(assessment, submission):
    """Specific flattener for Markets array"""
    rows = []
    base = get_base_data(assessment, submission)
    markets = submission.get('markets', [])

    if not isinstance(markets, list): return rows

    for m in markets:
        m_name = m.get('name', 'Unknown Market')
        m_data = m.get('data', {})
        for k, v in m_data.items():
            if v is None or v == "": continue
            row = base.copy()
            row.update({
                'Market_Name': m_name,
                'Category': 'Market observation',
                'Item': clean_label(k),
                'Value': str(v) if isinstance(v, (dict, list)) else v
            })
            rows.append(row)
    return rows

# ============================================
# MAIN ETL
# ============================================

def run_export():
    print("📡 Connecting to Supabase...")
    url = f"{SUPABASE_URL}/rest/v1/{TABLE_NAME}?select=*"
    headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
    
    resp = requests.get(url, headers=headers)
    if resp.status_code != 200:
        print(f"❌ Error: {resp.status_code}")
        return

    data = resp.json()
    print(f"✅ Fetched {len(data)} assessments.")

    # Group assessments by district
    district_groups = {}
    for assessment in data:
        sub = assessment.get('submission_data', {})
        if not sub: continue
        
        dist = sub.get('district', 'Unknown').strip().title()
        if dist not in district_groups:
            district_groups[dist] = []
        district_groups[dist].append(assessment)

    os.makedirs(OUTPUT_FOLDER, exist_ok=True)

    for district, assessments in district_groups.items():
        # Get latest update date for the district filename
        latest_date = max([a.get('updated_at', a.get('created_at'))[:10] for a in assessments])
        filename = f"{district.replace(' ', '_')}_{latest_date}.xlsx"
        filepath = os.path.join(OUTPUT_FOLDER, filename)
        
        print(f"📦 Exporting {district} -> {filename}...")

        with pd.ExcelWriter(filepath, engine='openpyxl') as writer:
            # 1. Intro Sheet
            intro_rows = []
            for a in assessments:
                sub = a.get('submission_data', {})
                row = get_base_data(a, sub)
                intro_rows.append(row)
            pd.DataFrame(intro_rows).to_excel(writer, sheet_name='Introduction', index=False)

            # 2. Crop Production
            crop_rows = []
            for a in assessments:
                crop_rows.extend(flatten_section(a, a.get('submission_data', {}), 'crop'))
            if crop_rows: pd.DataFrame(crop_rows).to_excel(writer, sheet_name='Crop Production', index=False)

            # 3. Livestock
            live_rows = []
            for a in assessments:
                live_rows.extend(flatten_section(a, a.get('submission_data', {}), 'livestock'))
            if live_rows: pd.DataFrame(live_rows).to_excel(writer, sheet_name='Livestock', index=False)

            # 4. Fisheries
            fish_rows = []
            for a in assessments:
                fish_rows.extend(flatten_section(a, a.get('submission_data', {}), 'fisheries'))
            if fish_rows: pd.DataFrame(fish_rows).to_excel(writer, sheet_name='Fisheries', index=False)

            # 5. Markets
            market_rows = []
            for a in assessments:
                market_rows.extend(flatten_markets(a, a.get('submission_data', {})))
            if market_rows: pd.DataFrame(market_rows).to_excel(writer, sheet_name='Markets & Trade', index=False)

    print(f"\n✨ DONE! All district reports are in the '{OUTPUT_FOLDER}' folder.")

if __name__ == "__main__":
    run_export()
