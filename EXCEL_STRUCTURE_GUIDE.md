# Excel Export Structure - Visual Guide

## Overview
This document shows exactly how your complex JSON data is transformed into Excel sheets.

## Example: Single Assessment Data

### Original JSON (Simplified)
```json
{
  "id": "assessment-123",
  "user_id": "user-456",
  "created_at": "2026-01-29T10:00:00Z",
  "reporting_year": 2026,
  "reporting_period": "Q1",
  "submission_data": {
    "district": "Kampala",
    "subCounty": "Central",
    "officialName": "John Doe",
    "cropPerformance": {
      "Maize": "3",
      "Beans": "2",
      "Cassava": "4"
    },
    "livestockNumbers": {
      "Cattle": "150",
      "Goats": "80",
      "Chickens": "200"
    },
    "markets": [
      {
        "id": 1,
        "name": "Nakasero Market",
        "data": {
          "parish": "Nakasero",
          "marketType": "urban",
          "commodity_Maize_grain_price_curr": "5000",
          "commodity_Beans_price_curr": "8000",
          "livestock_Bull_(Medium)_price_curr": "1500000"
        }
      },
      {
        "id": 2,
        "name": "Owino Market",
        "data": {
          "parish": "Owino",
          "marketType": "urban",
          "commodity_Maize_grain_price_curr": "4800",
          "commodity_Beans_price_curr": "7500"
        }
      }
    ]
  }
}
```

## Transformed Excel Sheets

### Sheet 1: Introduction
| assessment_id | user_id | created_at | reporting_year | reporting_period | district | sub_county | official_name |
|--------------|---------|------------|----------------|------------------|----------|------------|---------------|
| assessment-123 | user-456 | 2026-01-29T10:00:00Z | 2026 | Q1 | Kampala | Central | John Doe |

**Use in Power BI**: 
- Primary dimension table
- Link to all other sheets via `assessment_id`
- Filter by district, reporting period, etc.

---

### Sheet 2: Crop Production
| assessment_id | district | category | crop_name | value | metric |
|--------------|----------|----------|-----------|-------|--------|
| assessment-123 | Kampala | Crop Performance | Maize | 3 | performance_rating |
| assessment-123 | Kampala | Crop Performance | Beans | 2 | performance_rating |
| assessment-123 | Kampala | Crop Performance | Cassava | 4 | performance_rating |

**Use in Power BI**:
- Bar chart: Crop performance by district
- Filter: Show only crops with performance > 3
- Aggregate: Average performance by crop type

---

### Sheet 3: Livestock
| assessment_id | district | category | animal_type | value | metric |
|--------------|----------|----------|-------------|-------|--------|
| assessment-123 | Kampala | Livestock Numbers | Cattle | 150 | count |
| assessment-123 | Kampala | Livestock Numbers | Goats | 80 | count |
| assessment-123 | Kampala | Livestock Numbers | Chickens | 200 | count |

**Use in Power BI**:
- Pie chart: Distribution of livestock types
- Sum: Total livestock by district
- Trend: Livestock numbers over time

---

### Sheet 4: Fisheries
| assessment_id | district | category | species | value | metric |
|--------------|----------|----------|---------|-------|--------|
| assessment-123 | Kampala | Fisheries Overview | General | yes | water_bodies_present |
| assessment-123 | Kampala | Fish Catch | Tilapia | 200 | catch_volume |
| assessment-123 | Kampala | Fish Catch | Mukene | 150 | catch_volume |

**Use in Power BI**:
- Filter: Only districts with water bodies
- Chart: Fish catch by species
- Compare: Catch volumes across districts

---

### Sheet 5: Markets & Trade (Most Complex)
| assessment_id | district | market_name | parish | market_type | category | item | value | metric |
|--------------|----------|-------------|--------|-------------|----------|------|-------|--------|
| assessment-123 | Kampala | Nakasero Market | Nakasero | urban | Commodity | Maize grain | 5000 | price_curr |
| assessment-123 | Kampala | Nakasero Market | Nakasero | urban | Commodity | Beans | 8000 | price_curr |
| assessment-123 | Kampala | Nakasero Market | Nakasero | urban | Livestock | Bull (Medium) | 1500000 | price_curr |
| assessment-123 | Kampala | Owino Market | Owino | urban | Commodity | Maize grain | 4800 | price_curr |
| assessment-123 | Kampala | Owino Market | Owino | urban | Commodity | Beans | 7500 | price_curr |

**Use in Power BI**:
- Line chart: Price trends over time by commodity
- Table: Compare prices across markets
- Filter: Urban vs rural markets
- Average: Mean price by item and district

---

## Power BI Relationship Diagram

```
┌─────────────────┐
│  Introduction   │ (Dimension Table)
│  - assessment_id│◄─────┐
│  - district     │      │
│  - reporting_   │      │
│    period       │      │
└─────────────────┘      │
                         │
        ┌────────────────┼────────────────┬────────────────┐
        │                │                │                │
        │                │                │                │
┌───────▼──────┐  ┌──────▼──────┐  ┌─────▼──────┐  ┌─────▼──────────┐
│Crop Production│  │  Livestock  │  │ Fisheries  │  │Markets & Trade │
│- assessment_id│  │- assessment_│  │- assessment│  │- assessment_id │
│- crop_name    │  │  id         │  │  _id       │  │- market_name   │
│- value        │  │- animal_type│  │- species   │  │- item          │
│- metric       │  │- value      │  │- value     │  │- value         │
└───────────────┘  └─────────────┘  └────────────┘  └────────────────┘
```

## Example Power BI Visualizations

### 1. Crop Performance Dashboard
```
Visual Type: Clustered Bar Chart
Axis: crop_name
Values: Average of value
Filter: category = "Crop Performance"
Slicer: district, reporting_period
```

### 2. Market Price Comparison
```
Visual Type: Line Chart
Axis: reporting_period (from Introduction sheet)
Values: Average of value
Legend: item
Filter: category = "Commodity", metric = "price_curr"
```

### 3. Livestock Distribution Map
```
Visual Type: Map
Location: district
Size: Sum of value
Filter: category = "Livestock Numbers"
Tooltip: animal_type, value
```

### 4. Multi-Market Price Table
```
Visual Type: Matrix
Rows: item
Columns: market_name
Values: value
Filter: category = "Commodity"
```

## Data Types in Excel

| Column | Data Type | Example |
|--------|-----------|---------|
| assessment_id | Text | "assessment-123" |
| district | Text | "Kampala" |
| reporting_year | Number | 2026 |
| reporting_period | Text | "Q1" |
| value | Text/Number | "5000" or "good" |
| metric | Text | "price_curr" |
| created_at | DateTime | "2026-01-29T10:00:00Z" |

**Note**: The `value` column is text because it can contain both numbers ("5000") and text ("good", "poor"). In Power BI, you can convert specific metrics to numbers using DAX.

## Power BI DAX Examples

### Convert Price Values to Numbers
```dax
Price_Numeric = 
IF(
    'Markets & Trade'[metric] = "price_curr",
    VALUE('Markets & Trade'[value]),
    BLANK()
)
```

### Calculate Average Crop Performance
```dax
Avg_Crop_Performance = 
CALCULATE(
    AVERAGE(VALUE('Crop Production'[value])),
    'Crop Production'[category] = "Crop Performance"
)
```

### Count Assessments by District
```dax
Assessment_Count = 
DISTINCTCOUNT(Introduction[assessment_id])
```

## Benefits of This Structure

### ✅ Normalized Data
- Each row represents one data point
- Easy to filter and aggregate
- No nested structures

### ✅ Consistent Schema
- Same columns for all assessments
- Predictable data types
- Easy to append new data

### ✅ Flexible Analysis
- Can analyze by district, time period, crop, market, etc.
- Easy to create calculated columns
- Simple to build relationships

### ✅ Scalable
- Works with 10 or 10,000 assessments
- Performance stays consistent
- Easy to update and refresh

## Common Power BI Queries

### Q: How do I show only current prices?
**A**: Filter `metric = "price_curr"` in the Markets & Trade sheet

### Q: How do I compare this year vs last year?
**A**: Use `reporting_year` from Introduction sheet as a slicer

### Q: How do I see data for one district?
**A**: Filter `district` in any sheet (they're all linked)

### Q: How do I calculate total livestock?
**A**: `SUM(Livestock[value])` where `category = "Livestock Numbers"`

### Q: How do I show market trends over time?
**A**: Join Markets & Trade with Introduction using `assessment_id`, then use `reporting_period` on axis

---

**This structure makes your complex form data simple to analyze in Power BI!** 🎉
