# Admin Dashboard - User Guide

## Overview
The Admin Dashboard provides a powerful way to export all assessment data from the complex nested JSON format into a clean, flattened Excel file that's optimized for Power BI analysis.

## Accessing the Admin Dashboard
1. Log in as a **District Officer** (owner role)
2. Click on your profile icon in the top right
3. Select **"Admin Dashboard"** from the dropdown menu
4. Alternatively, on mobile, use the side drawer menu

## Features

### 1. Statistics Overview
The dashboard displays:
- **Total Assessments**: Total number of submissions in the database
- **Unique Districts**: Number of different districts with data
- **Latest Submission**: Date of the most recent assessment

### 2. Data Filtering
Before exporting, you can filter the data by:
- **District**: Enter a district name to filter assessments
- **Region**: Filter by statistical region
- **Start Date**: Only include assessments from this date onwards
- **End Date**: Only include assessments up to this date

Click **"Clear Filters"** to reset all filters.

### 3. Excel Export

#### How It Works
When you click **"Export to Excel"**, the system:
1. Fetches all assessments from the database
2. Applies any active filters
3. Flattens the complex nested JSON into separate Excel sheets
4. Downloads the file to your computer

#### Excel File Structure
The exported file contains **5 separate sheets**:

##### Sheet 1: Introduction
Contains basic information for each assessment:
- Assessment ID
- User ID
- Created/Updated timestamps
- Reporting year and period
- Statistical region
- District
- Sub county
- Official name and title

##### Sheet 2: Crop Production
Flattened crop data with columns:
- Assessment ID
- District
- Category (Crop Performance, Crop Yields, Land Size, Crop Utilization)
- Crop name
- Value
- Metric

##### Sheet 3: Livestock
Livestock data with columns:
- Assessment ID
- District
- Category (Livestock Numbers, Livestock Conditions, Milk Production)
- Animal type
- Value
- Metric

##### Sheet 4: Fisheries
Fisheries data with columns:
- Assessment ID
- District
- Category (Fish Catch, Fish Species, Fisheries Overview)
- Species
- Value
- Metric

##### Sheet 5: Markets & Trade
Market data (the most complex section) with columns:
- Assessment ID
- District
- Market name
- Parish
- Market type
- Frequency
- Respondent
- Category (Commodity, Livestock, Price Change, Market Access, Transport, Labour Market)
- Item
- Value
- Metric

## Using the Data in Power BI

### Step 1: Import the Excel File
1. Open Power BI Desktop
2. Click **"Get Data"** > **"Excel"**
3. Select your exported file
4. Select all 5 sheets and click **"Load"**

### Step 2: Create Relationships
Power BI should auto-detect relationships, but verify:
- All sheets can be related via **assessment_id**
- Introduction sheet can be related to others via **district**

### Step 3: Create Visualizations
Now you can easily create:
- **Bar charts** comparing crop performance across districts
- **Line charts** showing trends over reporting periods
- **Tables** displaying market prices by commodity
- **Maps** showing regional data distribution
- **Filters** by district, date range, or reporting period

### Example Visualizations

#### Crop Performance by District
- Visual: Clustered Bar Chart
- Axis: District
- Values: Count of assessments where crop_performance > 3
- Filter: Category = "Crop Performance"

#### Market Price Trends
- Visual: Line Chart
- Axis: Reporting Period
- Values: Average of value
- Legend: Item (commodity name)
- Filter: Category = "Commodity", Metric = "price_curr"

#### Livestock Distribution
- Visual: Pie Chart
- Legend: Animal Type
- Values: Sum of value
- Filter: Category = "Livestock Numbers"

## Benefits of This Approach

### ✅ Advantages
1. **No Database Changes**: Your existing Supabase schema remains unchanged
2. **Flexible**: Export data anytime with different filters
3. **Power BI Ready**: Data is pre-flattened for easy analysis
4. **Multiple Perspectives**: Each sheet provides a different view of the data
5. **Preserves Relationships**: Assessment IDs link all data together

### 📊 Data Structure
- **Normalized**: Each row represents a single data point
- **Consistent**: Same column structure across all assessments
- **Filterable**: Easy to filter and slice in Power BI
- **Aggregatable**: Values are numeric where appropriate

## Troubleshooting

### No Data Appears
- Check that assessments have been submitted
- Verify filters aren't too restrictive
- Ensure you're logged in as an owner

### Export Button Disabled
- This happens when there are no assessments in the database
- Submit at least one assessment first

### Missing Data in Excel
- Some sections may be empty if users haven't filled them
- Check the "Recent Assessments" table to see what data exists

### Power BI Relationships Not Working
- Ensure you're using **assessment_id** as the primary key
- Check that column names match exactly
- Verify data types are correct (numbers vs. text)

## Best Practices

1. **Regular Exports**: Export data weekly or monthly for trend analysis
2. **Use Filters**: Export specific districts or time periods for focused analysis
3. **Backup Data**: Keep exported Excel files as backups
4. **Document Changes**: Note the date range when sharing reports
5. **Validate Data**: Check the "Recent Assessments" table before exporting

## Technical Notes

### Data Flattening Logic
- **Objects** (like cropPerformance) are converted to rows with key-value pairs
- **Arrays** (like markets) create multiple rows, one per array item
- **Nested fields** are prefixed with their parent category
- **Empty values** are preserved as empty cells

### File Naming
Files are automatically named: `Food_Security_Assessment_YYYY-MM-DD.xlsx`

### Performance
- Export time depends on the number of assessments
- Typical export: 100 assessments in ~2-3 seconds
- Large datasets (1000+) may take 10-15 seconds

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your internet connection
3. Ensure you have the latest version of the application
4. Contact your system administrator

---

**Last Updated**: January 2026
**Version**: 1.0
