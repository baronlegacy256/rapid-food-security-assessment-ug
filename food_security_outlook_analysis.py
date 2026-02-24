"""
🇺🇬 UGANDA RAPID FOOD SECURITY OUTLOOK ANALYZER
Implements the Rapid Food Security Outlook Checklist logic for data analysis.
Converts raw assessment data into Status Categories (Food Secure, Marginally Insecure, Insecure).
"""

import requests
import pandas as pd
import os
from datetime import datetime

# ============================================
# CONFIGURATION
# ============================================

SUPABASE_URL = "https://owvmkdqdfytzlvdrtyrl.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93dm1rZHFkZnl0emx2ZHJ0eXJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MjQ2NjIsImV4cCI6MjA4NDMwMDY2Mn0.EVxxETJigW1pTByGwi1G3JfjLbr0gMzmAc1QiL1ft-A"
TABLE_NAME = "assessments"
OUTPUT_FILE = "food_security_outlook_report.csv"

# ============================================
# ANALYSIS LOGIC ENGINE
# ============================================

def analyze_crop_status(crop_data):
    """Categorizes Crop Performance based on percentage production"""
    if not crop_data: return "Unknown", "No Data"
    
    # Calculate average performance across all crops mentioned
    vals = [float(v) for v in crop_data.values() if str(v).replace('.','',1).isdigit()]
    if not vals: return "Unknown", "No valid values"
    
    avg_prod = sum(vals) / len(vals)
    
    if avg_prod >= 70:
        return "Food Secure", f"Normal Production ({avg_prod:.1f}%)"
    elif 50 <= avg_prod < 70:
        return "Marginally Food Insecure", f"Average Production ({avg_prod:.1f}%)"
    else:
        return "Food Insecure", f"Poor Production (<{avg_prod:.1f}%)"

def analyze_food_stocks(stock_data):
    """Categorizes Stock status (1=Insecure, 2=Marginal, 3/4=Secure)"""
    if not stock_data: return "Unknown", "No Data"
    
    # We look at the consensus or average code (1 to 4)
    vals = [int(v) for v in stock_data.values() if str(v).isdigit()]
    if not vals: return "Unknown", "No valid values"
    
    avg_code = sum(vals) / len(vals)
    
    if avg_code >= 3:
        return "Food Secure", f"Good Stocks (Avg code {avg_code:.1f})"
    elif 2 <= avg_code < 3:
        return "Marginally Food Insecure", f"Minimal Stocks (Lasts ~2 months)"
    else:
        return "Food Insecure", "Critically Low Stocks (<1 month)"

def analyze_meals_status(meal_data):
    """Categorizes status based on number of meals per day"""
    if not meal_data: return "Unknown", "No Data"
    
    # Logic: Identify the meal group with the highest percentage of households
    # Map raw field names to standard labels
    mapping = {
        '1 meal': ('Food Insecure', 1),
        '2 meals': ('Marginally Food Insecure', 2),
        '3 or more meals': ('Food Secure', 3)
    }
    
    highest_pct = -1
    best_category = "Unknown"
    
    for label, (status, weight) in mapping.items():
        val = float(meal_data.get(label, 0))
        if val > highest_pct:
            highest_pct = val
            best_category = status
            
    return best_category, f"Dominant Group: {highest_pct}% households"

def analyze_hazards(submission):
    """Checks for Dry Spells, Drought, and Outbreaks"""
    hazards = []
    
    # Check Rainfall Patterns
    normal = submission.get('normalYearLevels', {})
    current = submission.get('currentYearLevels', {})
    
    # Basic check for negative gaps
    if normal and current:
        gaps = 0
        for k, v in normal.items():
            if current.get(k) == 'Below Normal': gaps += 1
        if gaps >= 2: hazards.append("Rainfall Below Normal")

    # Check Disease Outbreaks
    if submission.get('diseaseOutbreaks', {}).get('hasOutbreak') == 'yes':
        hazards.append("Crop Pest Outbreak")
    if submission.get('livestockOutbreaks', {}).get('hasOutbreak') == 'yes':
        hazards.append("Livestock Disease")

    return ", ".join(hazards) if hazards else "None Reported"

# ============================================
# MAIN EXECUTION
# ============================================

def run_analysis():
    print("📡 Fetching data for analysis...")
    url = f"{SUPABASE_URL}/rest/v1/{TABLE_NAME}?select=*"
    headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
    
    resp = requests.get(url, headers=headers)
    if resp.status_code != 200:
        print(f"❌ Error: {resp.status_code}")
        return

    data = resp.json()
    analysis_records = []

    print(f"📊 Analyzing {len(data)} assessments...")

    for assessment in data:
        sub = assessment.get('submission_data', {})
        if not sub: continue

        # 1. Run Individual Dimension Analysis
        crop_status, crop_comment = analyze_crop_status(sub.get('cropPerformance'))
        stock_status, stock_comment = analyze_food_stocks(sub.get('foodStocks'))
        meal_status, meal_comment = analyze_meals_status(sub.get('mealsPerDay'))
        hazards = analyze_hazards(sub)
        
        # 2. Determine Final Integrated Outlook
        # If any major dimension is Insecure, the overall status trends towards Insecure
        statuses = [crop_status, stock_status, meal_status]
        if "Food Insecure" in statuses:
            final_outlook = "Insecure"
        elif "Marginally Food Insecure" in statuses:
            final_outlook = "Marginal Situation"
        else:
            final_outlook = "Generally Secure"

        # 3. Compile Record
        analysis_records.append({
            'District': sub.get('district', 'Unknown').title(),
            'Sub_County': sub.get('subCounty', 'Unknown').title(),
            'Region': sub.get('statisticalRegion', 'Unknown').title(),
            'Created_At': assessment.get('created_at')[:10],
            
            # Dimension 1: Availability
            'Crop_Performance_Status': crop_status,
            'Crop_Comments': crop_comment,
            'Food_Stock_Status': stock_status,
            'Food_Stock_Comments': stock_comment,
            
            # Dimension 2: Utilization
            'Meal_Count_Status': meal_status,
            'Meal_Comments': meal_comment,
            
            # Dimension 3: Accessibility & Stability
            'Hazard_Alerts': hazards,
            'Drug_Availability': sub.get('drugAvailability', 'N/A'),
            
            # Final Conclusion
            'FINAL_OUTLOOK': final_outlook
        })

    # Export to CSV for Power BI
    df = pd.DataFrame(analysis_records)
    df.to_csv(OUTPUT_FILE, index=False)
    
    print(f"\n✨ ANALYSIS COMPLETE!")
    print(f"💾 Report saved to: {OUTPUT_FILE}")
    print("\n📈 Summary of Results:")
    print(df['FINAL_OUTLOOK'].value_counts())

if __name__ == "__main__":
    run_analysis()
