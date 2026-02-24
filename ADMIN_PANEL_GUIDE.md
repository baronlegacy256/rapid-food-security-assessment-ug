# 🔐 Admin Panel - Complete Guide

## Overview
The Admin Panel is a **separate, dedicated interface** for system administrators to manage all aspects of the Food Security Assessment system. It's completely isolated from the regular user interface and accessible only to District Officers (owners).

## Accessing the Admin Panel

### Method 1: Navigation Menu
1. Log in as a District Officer (owner)
2. Click your profile icon (top right)
3. Select **"Admin Dashboard"** from the dropdown
4. You'll be redirected to `/admin`

### Method 2: Direct URL
Navigate directly to: `https://your-domain.com/admin`

**Note**: You must be logged in as an owner to access this page.

## Features

### 1. 📊 Dashboard Tab
**Overview statistics and quick actions**

#### Statistics Cards:
- **Total Assessments**: All submissions in the database
- **This Month**: Assessments submitted this month
- **Districts**: Number of unique districts with data
- **Regions**: Number of unique regions covered

#### Quick Actions:
- **Export Data**: Jump to export tab
- **Manage Assessments**: View and delete assessments
- **Refresh Data**: Reload from database

#### Recent Activity:
- View the 5 most recent assessments
- See submission dates and status

---

### 2. 📝 Assessments Tab
**Full assessment management with search, filter, and delete capabilities**

#### Search & Filter:
- **Search Bar**: Search by district, sub-county, or official name
- **District Filter**: Filter by specific district
- **Region Filter**: Filter by statistical region
- **Date Range**: Filter by start and end dates
- **Clear Button**: Reset all filters

#### Assessment Table:
Displays all assessments with:
- Checkbox for bulk selection
- Submission date
- District
- Sub County
- Official name
- Reporting period
- Delete action button

#### Bulk Operations:
- **Select All**: Check all visible assessments
- **Deselect All**: Uncheck all selections
- **Delete Selected**: Remove multiple assessments at once
- Confirmation dialog prevents accidental deletions

#### Individual Actions:
- **Delete Button** (trash icon): Remove single assessment
- Confirmation modal with warning message

---

### 3. 📥 Export Data Tab
**Excel export with advanced filtering**

#### Export Filters:
Same as Assessments tab:
- District
- Region
- Start Date
- End Date

#### Export Button:
- Shows count of assessments to be exported
- Disabled if no data matches filters
- Downloads Excel file with 5 sheets:
  1. Introduction
  2. Crop Production
  3. Livestock
  4. Fisheries
  5. Markets & Trade

#### File Naming:
`Food_Security_Assessment_YYYY-MM-DD.xlsx`

---

## Key Differences from Regular Dashboard

| Feature | Regular Dashboard | Admin Panel |
|---------|------------------|-------------|
| **Access** | All users | Owners only |
| **URL** | `/` | `/admin` |
| **Navigation** | Integrated in app | Separate interface |
| **Delete** | ❌ Not available | ✅ Full delete capability |
| **Bulk Actions** | ❌ Not available | ✅ Select & delete multiple |
| **Search** | ❌ Limited | ✅ Advanced search & filters |
| **View** | Own assessments | All assessments |
| **Exit** | N/A | "Exit Admin" button |

## Security Features

### Access Control:
- ✅ Only accessible to logged-in users
- ✅ Only visible to owners (District Officers)
- ✅ Separate route prevents accidental access
- ✅ Session validation required

### Delete Protection:
- ✅ Confirmation dialog for single delete
- ✅ Confirmation dialog for bulk delete
- ✅ Clear warning messages
- ✅ Cannot be undone warning

## Usage Scenarios

### Scenario 1: Monthly Cleanup
**Goal**: Delete test or duplicate assessments

1. Go to **Assessments** tab
2. Use **Search** to find test data
3. **Select** unwanted assessments
4. Click **Delete Selected**
5. Confirm deletion

### Scenario 2: Export Regional Data
**Goal**: Export all assessments from a specific region

1. Go to **Export Data** tab
2. Enter **Region** name in filter
3. Optionally set **Date Range**
4. Click **Export** button
5. Open file in Power BI

### Scenario 3: View System Statistics
**Goal**: Check overall system usage

1. Go to **Dashboard** tab
2. View **Statistics Cards**
3. Check **Recent Activity** table
4. Use **Refresh** if needed

### Scenario 4: Delete Old Data
**Goal**: Remove assessments older than 2 years

1. Go to **Assessments** tab
2. Set **End Date** to 2 years ago
3. Click **Select All**
4. Click **Delete Selected**
5. Confirm bulk deletion

## Navigation

### Within Admin Panel:
- **Dashboard Tab**: Overview and quick actions
- **Assessments Tab**: Manage and delete
- **Export Data Tab**: Download Excel files

### Exiting Admin Panel:
- Click **"Exit Admin"** button (top right)
- Returns to regular assessment interface
- URL changes back to `/`

## Tips & Best Practices

### 🎯 Search Tips:
- Search is case-insensitive
- Searches across district, sub-county, and official name
- Combine with filters for precise results

### 🗑️ Deletion Tips:
- **Always double-check** before deleting
- Use **filters** to isolate data before bulk delete
- **Export data** before major deletions (backup)
- Deletions are **permanent** and cannot be undone

### 📊 Export Tips:
- **Filter first** to reduce file size
- Export **regularly** for backups
- Use **date ranges** for periodic reports
- Check **filtered count** before exporting

### ⚡ Performance Tips:
- Use **filters** to reduce data load
- **Refresh** data if it seems outdated
- **Clear filters** after specific searches
- **Exit admin** when done to free resources

## Troubleshooting

### Issue: Can't Access Admin Panel
**Solutions**:
- Verify you're logged in as an owner
- Check URL is `/admin`
- Try logging out and back in
- Clear browser cache

### Issue: No Assessments Showing
**Solutions**:
- Click **Refresh Data** button
- Check if filters are too restrictive
- Click **Clear** to reset filters
- Verify database connection

### Issue: Export Button Disabled
**Solutions**:
- Check if any assessments match filters
- Clear filters to see all data
- Verify assessments exist in database
- Try refreshing the page

### Issue: Delete Not Working
**Solutions**:
- Ensure you confirmed the deletion
- Check browser console for errors
- Verify database permissions
- Try deleting one at a time

### Issue: Bulk Select Not Working
**Solutions**:
- Ensure assessments are visible (not filtered out)
- Try clicking individual checkboxes first
- Refresh the page
- Check if table loaded completely

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Search | Click search box or Tab to it |
| Clear Filters | Click "Clear" button |
| Select All | Click "Select All" link |
| Delete Selected | Click "Delete Selected" button |

## Data Management Best Practices

### Regular Maintenance:
1. **Weekly**: Check dashboard statistics
2. **Monthly**: Export data for backup
3. **Quarterly**: Review and clean test data
4. **Yearly**: Archive old assessments (export then delete)

### Before Major Changes:
1. **Export** all data as backup
2. **Document** what you're changing
3. **Test** with small batch first
4. **Verify** results before proceeding

### Data Retention:
- Keep current year data
- Archive previous year (export to Excel)
- Delete data older than 2 years (after export)
- Maintain backups of all exports

## Technical Details

### Routes:
- Regular App: `/`
- Admin Panel: `/admin`

### State Management:
- `isAdminMode`: Boolean flag for admin state
- `enterAdminMode()`: Function to switch to admin
- `exitAdminMode()`: Function to return to regular app

### Components:
- **AdminPanel.jsx**: Main admin interface
- **AdminDashboard.jsx**: Old component (kept for compatibility)

### Data Flow:
```
User clicks "Admin Dashboard"
         ↓
enterAdminMode() called
         ↓
URL changes to /admin
         ↓
isAdminMode = true
         ↓
AdminPanel component renders
         ↓
Fetches all assessments
         ↓
Displays admin interface
```

## Security Considerations

### What Admins Can Do:
- ✅ View all assessments
- ✅ Delete any assessment
- ✅ Export all data
- ✅ Search and filter data
- ✅ Bulk operations

### What Admins Cannot Do:
- ❌ Edit other users' assessments
- ❌ Create assessments for others
- ❌ Change user roles
- ❌ Access user passwords
- ❌ Modify system settings

### Audit Trail:
- All deletions are logged in browser console
- Export operations are timestamped
- Consider implementing server-side logging for production

## Support

### For Help:
1. Check this guide first
2. Review browser console for errors
3. Verify Supabase connection
4. Contact system administrator

### Reporting Issues:
Include:
- What you were trying to do
- What happened instead
- Browser console errors
- Steps to reproduce

---

**Admin Panel Version**: 1.0  
**Last Updated**: January 29, 2026  
**Access Level**: District Officers (Owners) Only  
**Status**: ✅ Production Ready
