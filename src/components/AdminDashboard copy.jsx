import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Download, FileSpreadsheet, Loader2, Calendar, Filter, Users, Database, Activity, Archive } from 'lucide-react';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';

const AdminDashboard = ({ session }) => {
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [exportingByDistrict, setExportingByDistrict] = useState(false);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        district: '',
        region: ''
    });

    // Status scoring system (matching Python script)
    const STATUS_SCORE = {
        "Food Secure": 3,
        "Marginally Food Insecure": 2,
        "Food Insecure": 1,
        "Unknown": 0
    };

    useEffect(() => {
        fetchAssessments();
    }, []);

    const fetchAssessments = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('assessments')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAssessments(data || []);
        } catch (err) {
            console.error('Error fetching assessments:', err);
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // FOOD SECURITY ANALYSIS FUNCTIONS
    // (Matching Python script logic)
    // ==========================================

    const worstStatus = (statuses) => {
        const statusPriority = ["Food Insecure", "Marginally Food Insecure", "Food Secure"];
        for (const status of statusPriority) {
            if (statuses.includes(status)) {
                return status;
            }
        }
        return "Unknown";
    };

    // 1. FOOD AVAILABILITY
    const analyzeCropPerformance = (cropPerf) => {
        if (!cropPerf || Object.keys(cropPerf).length === 0) {
            return { status: "Unknown", comment: "No crop production data" };
        }

        const vals = Object.values(cropPerf)
            .filter(v => !isNaN(parseFloat(v)))
            .map(v => parseFloat(v));

        if (vals.length === 0) {
            return { status: "Unknown", comment: "No valid crop data" };
        }

        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;

        if (avg >= 70) {
            return { status: "Food Secure", comment: `Normal production (${avg.toFixed(1)}%)` };
        } else if (avg >= 50) {
            return { status: "Marginally Food Insecure", comment: `Average production (${avg.toFixed(1)}%)` };
        } else {
            return { status: "Food Insecure", comment: `Poor production (${avg.toFixed(1)}%)` };
        }
    };

    const analyzeRainfall = (sub) => {
        const dryDays = parseInt(sub.drySpellDays || 0);
        const status = sub.rainfallStatus;

        if (dryDays > 30) {
            return { status: "Food Insecure", comment: "Drought (>1 month)" };
        } else if (dryDays >= 8 && dryDays <= 30) {
            return { status: "Marginally Food Insecure", comment: "Prolonged dry spell" };
        } else if (dryDays >= 7) {
            return { status: "Marginally Food Insecure", comment: "Dry spell" };
        } else if (status === "Below Normal") {
            return { status: "Marginally Food Insecure", comment: "Below normal rainfall" };
        } else {
            return { status: "Food Secure", comment: "Normal rainfall" };
        }
    };

    const analyzeFoodStocks = (stocks) => {
        if (!stocks || Object.keys(stocks).length === 0) {
            return { status: "Unknown", comment: "No food stock data" };
        }

        const vals = Object.values(stocks)
            .filter(v => !isNaN(parseInt(v)))
            .map(v => parseInt(v));

        if (vals.length === 0) {
            return { status: "Unknown", comment: "No valid stock data" };
        }

        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;

        if (avg >= 3) {
            return { status: "Food Secure", comment: "Stocks last ≥2 months" };
        } else if (avg === 2) {
            return { status: "Marginally Food Insecure", comment: "Stocks <1 month" };
        } else {
            return { status: "Food Insecure", comment: "Critically low stocks" };
        }
    };

    // 2. FOOD UTILIZATION
    const analyzeMeals = (meals) => {
        if (!meals || Object.keys(meals).length === 0) {
            return { status: "Unknown", comment: "No meal data" };
        }

        const oneMeal = parseInt(meals["1 meal"] || 0);
        const twoMeals = parseInt(meals["2 meals"] || 0);
        const threePlus = parseInt(meals["3 or more meals"] || 0);

        if (oneMeal > Math.max(twoMeals, threePlus)) {
            return { status: "Food Insecure", comment: "1 meal per day dominant" };
        } else if (twoMeals > threePlus) {
            return { status: "Marginally Food Insecure", comment: "2 meals per day dominant" };
        } else {
            return { status: "Food Secure", comment: "3 meals per day dominant" };
        }
    };

    const analyzeDietaryDiversity = (dd) => {
        if (!dd) {
            return { status: "Unknown", comment: "No dietary data" };
        }

        const groups = parseInt(dd.foodGroups || 0);

        if (groups <= 1) {
            return { status: "Food Insecure", comment: "1 food group" };
        } else if (groups === 2) {
            return { status: "Marginally Food Insecure", comment: "2 food groups" };
        } else {
            return { status: "Food Secure", comment: "≥3 food groups" };
        }
    };

    // 3. FOOD ACCESSIBILITY
    const analyzeAccessibility = (sub) => {
        const issues = [];

        if (sub.householdIncome === "Poor") {
            issues.push("Low household income");
        }
        if (sub.roadAccess === "Poor") {
            issues.push("Poor road network");
        }
        if (sub.marketPrices === "High") {
            issues.push("High food prices");
        }
        if (sub.foodDistribution === "Poor") {
            issues.push("Weak distribution channels");
        }

        if (issues.length >= 3) {
            return { status: "Food Insecure", comment: issues.join(", ") };
        } else if (issues.length > 0) {
            return { status: "Marginally Food Insecure", comment: issues.join(", ") };
        } else {
            return { status: "Food Secure", comment: "Markets accessible" };
        }
    };

    // 4. FOOD STABILITY
    const analyzeStability = (sub) => {
        const flags = [];

        if (sub.copingStrategiesActive === "yes") {
            flags.push("Coping strategies used");
        }
        if (sub.livestockOutbreaks?.hasOutbreak === "yes") {
            flags.push("Livestock disease");
        }
        if (sub.floods === "yes") {
            flags.push("Floods");
        }
        if (sub.soilFertility === "Poor") {
            flags.push("Poor soil fertility");
        }
        if (sub.waterForProduction === "Inadequate") {
            flags.push("Water stress");
        }

        if (flags.length >= 2) {
            return { status: "Food Insecure", comment: flags.join(", ") };
        } else if (flags.length > 0) {
            return { status: "Marginally Food Insecure", comment: flags.join(", ") };
        } else {
            return { status: "Food Secure", comment: "Stable conditions" };
        }
    };

    // COMPREHENSIVE FOOD SECURITY ANALYSIS
    const analyzeFoodSecurity = (assessment) => {
        const sub = assessment.submission_data || {};

        // Availability
        const crop = analyzeCropPerformance(sub.cropPerformance);
        const rain = analyzeRainfall(sub);
        const stock = analyzeFoodStocks(sub.foodStocks);
        const availability = worstStatus([crop.status, rain.status, stock.status]);

        // Utilization
        const meals = analyzeMeals(sub.mealsPerDay);
        const diet = analyzeDietaryDiversity(sub.dietaryDiversity);
        const utilization = worstStatus([meals.status, diet.status]);

        // Accessibility
        const access = analyzeAccessibility(sub);

        // Stability
        const stability = analyzeStability(sub);

        // Final Outlook
        const finalOutlook = worstStatus([
            availability,
            utilization,
            access.status,
            stability.status
        ]);

        return {
            assessment_id: assessment.id,
            district: sub.district,
            region: sub.statisticalRegion,
            sub_county: sub.subCounty,
            created_at: assessment.created_at,

            // Availability
            availability_status: availability,
            availability_score: STATUS_SCORE[availability],
            crop_status: crop.status,
            crop_comment: crop.comment,
            rainfall_status: rain.status,
            rainfall_comment: rain.comment,
            stock_status: stock.status,
            stock_comment: stock.comment,

            // Utilization
            utilization_status: utilization,
            utilization_score: STATUS_SCORE[utilization],
            meals_status: meals.status,
            meals_comment: meals.comment,
            diet_status: diet.status,
            diet_comment: diet.comment,

            // Accessibility
            accessibility_status: access.status,
            accessibility_score: STATUS_SCORE[access.status],
            accessibility_comment: access.comment,

            // Stability
            stability_status: stability.status,
            stability_score: STATUS_SCORE[stability.status],
            stability_comment: stability.comment,

            // Final
            final_outlook: finalOutlook,
            final_score: STATUS_SCORE[finalOutlook]
        };
    };

    // ==========================================
    // EXISTING FLATTEN FUNCTIONS
    // ==========================================

    const flattenIntroData = (assessment) => {
        const data = assessment.submission_data || {};
        return {
            assessment_id: assessment.id,
            user_id: assessment.user_id,
            created_at: assessment.created_at,
            updated_at: assessment.updated_at,
            reporting_year: assessment.reporting_year,
            reporting_period: assessment.reporting_period,
            statistical_region: data.statisticalRegion || '',
            district: data.district || '',
            sub_county: data.subCounty || '',
            official_name: data.officialName || '',
            official_title: data.officialTitle || ''
        };
    };

    const flattenCropData = (assessment) => {
        const data = assessment.submission_data || {};
        const rows = [];

        if (data.cropPerformance) {
            Object.entries(data.cropPerformance).forEach(([crop, performance]) => {
                rows.push({
                    assessment_id: assessment.id,
                    district: data.district,
                    category: 'Crop Performance',
                    crop_name: crop,
                    value: performance,
                    metric: 'performance_rating'
                });
            });
        }

        if (data.cropYields) {
            Object.entries(data.cropYields).forEach(([crop, yield_value]) => {
                rows.push({
                    assessment_id: assessment.id,
                    district: data.district,
                    category: 'Crop Yields',
                    crop_name: crop,
                    value: yield_value,
                    metric: 'yield_amount'
                });
            });
        }

        if (data.landSizeByHousehold) {
            Object.entries(data.landSizeByHousehold).forEach(([category, size]) => {
                rows.push({
                    assessment_id: assessment.id,
                    district: data.district,
                    category: 'Land Size',
                    crop_name: category,
                    value: size,
                    metric: 'hectares'
                });
            });
        }

        if (data.cropUtilization) {
            Object.entries(data.cropUtilization).forEach(([crop, utilization]) => {
                rows.push({
                    assessment_id: assessment.id,
                    district: data.district,
                    category: 'Crop Utilization',
                    crop_name: crop,
                    value: utilization,
                    metric: 'utilization_type'
                });
            });
        }

        return rows;
    };

    const flattenLivestockData = (assessment) => {
        const data = assessment.submission_data || {};
        const rows = [];

        if (data.livestockNumbers) {
            Object.entries(data.livestockNumbers).forEach(([animal, count]) => {
                rows.push({
                    assessment_id: assessment.id,
                    district: data.district,
                    category: 'Livestock Numbers',
                    animal_type: animal,
                    value: count,
                    metric: 'count'
                });
            });
        }

        if (data.livestockConditions) {
            Object.entries(data.livestockConditions).forEach(([animal, condition]) => {
                rows.push({
                    assessment_id: assessment.id,
                    district: data.district,
                    category: 'Livestock Conditions',
                    animal_type: animal,
                    value: condition,
                    metric: 'condition_rating'
                });
            });
        }

        if (data.milkProduction) {
            Object.entries(data.milkProduction).forEach(([metric, value]) => {
                rows.push({
                    assessment_id: assessment.id,
                    district: data.district,
                    category: 'Milk Production',
                    animal_type: 'Dairy',
                    value: value,
                    metric: metric
                });
            });
        }

        return rows;
    };

    const flattenFisheriesData = (assessment) => {
        const data = assessment.submission_data || {};
        const rows = [];

        if (data.fishCatch) {
            Object.entries(data.fishCatch).forEach(([species, catch_amount]) => {
                rows.push({
                    assessment_id: assessment.id,
                    district: data.district,
                    category: 'Fish Catch',
                    species: species,
                    value: catch_amount,
                    metric: 'catch_volume'
                });
            });
        }

        if (data.fishSpecies) {
            Object.entries(data.fishSpecies).forEach(([species, data_value]) => {
                rows.push({
                    assessment_id: assessment.id,
                    district: data.district,
                    category: 'Fish Species',
                    species: species,
                    value: data_value,
                    metric: 'species_data'
                });
            });
        }

        rows.push({
            assessment_id: assessment.id,
            district: data.district,
            category: 'Fisheries Overview',
            species: 'General',
            value: data.fishingHouseholds || '',
            metric: 'fishing_households'
        });

        rows.push({
            assessment_id: assessment.id,
            district: data.district,
            category: 'Fisheries Overview',
            species: 'General',
            value: data.waterBodies || '',
            metric: 'water_bodies_present'
        });

        return rows;
    };

    const flattenMarketsData = (assessment) => {
        const data = assessment.submission_data || {};
        const rows = [];

        if (data.markets && Array.isArray(data.markets)) {
            data.markets.forEach((market, index) => {
                const marketData = market.data || {};

                rows.push({
                    assessment_id: assessment.id,
                    district: data.district,
                    market_name: market.name || `Market ${index + 1}`,
                    parish: marketData.parish || '',
                    market_type: marketData.marketType || '',
                    frequency: marketData.frequency || '',
                    respondent: marketData.respondent || '',
                    category: 'Market Info',
                    item: 'Basic Info',
                    value: '',
                    metric: 'general'
                });

                Object.entries(marketData).forEach(([key, value]) => {
                    if (key.startsWith('commodity_')) {
                        const parts = key.split('_');
                        const itemName = parts.slice(1, -1).join(' ');
                        const metric = parts[parts.length - 1];

                        rows.push({
                            assessment_id: assessment.id,
                            district: data.district,
                            market_name: market.name,
                            parish: marketData.parish || '',
                            market_type: marketData.marketType || '',
                            frequency: marketData.frequency || '',
                            respondent: marketData.respondent || '',
                            category: 'Commodity',
                            item: itemName,
                            value: value,
                            metric: metric
                        });
                    }

                    if (key.startsWith('livestock_')) {
                        const parts = key.split('_');
                        const itemName = parts.slice(1, -1).join(' ');
                        const metric = parts[parts.length - 1];

                        rows.push({
                            assessment_id: assessment.id,
                            district: data.district,
                            market_name: market.name,
                            parish: marketData.parish || '',
                            market_type: marketData.marketType || '',
                            frequency: marketData.frequency || '',
                            respondent: marketData.respondent || '',
                            category: 'Livestock',
                            item: itemName,
                            value: value,
                            metric: metric
                        });
                    }

                    if (key.startsWith('change_')) {
                        const parts = key.split('_');
                        const itemName = parts.slice(1, -1).join(' ');
                        const metric = parts[parts.length - 1];

                        rows.push({
                            assessment_id: assessment.id,
                            district: data.district,
                            market_name: market.name,
                            parish: marketData.parish || '',
                            market_type: marketData.marketType || '',
                            frequency: marketData.frequency || '',
                            respondent: marketData.respondent || '',
                            category: 'Price Change',
                            item: itemName,
                            value: value,
                            metric: metric
                        });
                    }

                    if (key.startsWith('access_')) {
                        const parts = key.split('_');
                        const itemName = parts.slice(1, -1).join(' ');
                        const metric = parts[parts.length - 1];

                        rows.push({
                            assessment_id: assessment.id,
                            district: data.district,
                            market_name: market.name,
                            parish: marketData.parish || '',
                            market_type: marketData.marketType || '',
                            frequency: marketData.frequency || '',
                            respondent: marketData.respondent || '',
                            category: 'Market Access',
                            item: itemName,
                            value: value,
                            metric: metric
                        });
                    }

                    if (key.startsWith('transport_')) {
                        const parts = key.split('_');
                        const itemName = parts.slice(1, -1).join(' ');
                        const metric = parts[parts.length - 1];

                        rows.push({
                            assessment_id: assessment.id,
                            district: data.district,
                            market_name: market.name,
                            parish: marketData.parish || '',
                            market_type: marketData.marketType || '',
                            frequency: marketData.frequency || '',
                            respondent: marketData.respondent || '',
                            category: 'Transport',
                            item: itemName,
                            value: value,
                            metric: metric
                        });
                    }

                    if (key.startsWith('labour_')) {
                        rows.push({
                            assessment_id: assessment.id,
                            district: data.district,
                            market_name: market.name,
                            parish: marketData.parish || '',
                            market_type: marketData.marketType || '',
                            frequency: marketData.frequency || '',
                            respondent: marketData.respondent || '',
                            category: 'Labour Market',
                            item: key.replace('labour_', ''),
                            value: value,
                            metric: 'labour_data'
                        });
                    }
                });
            });
        }

        return rows;
    };

    // ==========================================
    // ENHANCED EXPORT FUNCTION
    // ==========================================

    const exportToExcel = async () => {
        setExporting(true);
        try {
            // Filter assessments
            let filteredAssessments = [...assessments];

            if (filters.district) {
                filteredAssessments = filteredAssessments.filter(a =>
                    a.submission_data?.district?.toLowerCase().includes(filters.district.toLowerCase())
                );
            }
            if (filters.region) {
                filteredAssessments = filteredAssessments.filter(a =>
                    a.submission_data?.statisticalRegion?.toLowerCase().includes(filters.region.toLowerCase())
                );
            }
            if (filters.startDate) {
                filteredAssessments = filteredAssessments.filter(a =>
                    new Date(a.created_at) >= new Date(filters.startDate)
                );
            }
            if (filters.endDate) {
                filteredAssessments = filteredAssessments.filter(a =>
                    new Date(a.created_at) <= new Date(filters.endDate)
                );
            }

            // Create workbook
            const wb = XLSX.utils.book_new();

            // ===== FOOD SECURITY OUTLOOK SHEET (NEW - MATCHING PYTHON) =====
            const foodSecurityData = filteredAssessments.map(analyzeFoodSecurity);
            if (foodSecurityData.length > 0) {
                const fsSheet = XLSX.utils.json_to_sheet(foodSecurityData);
                XLSX.utils.book_append_sheet(wb, fsSheet, 'Food Security Outlook');
            }

            // ===== EXISTING SHEETS =====

            // Sheet: Introduction/Basic Info
            const introData = filteredAssessments.map(flattenIntroData);
            const introSheet = XLSX.utils.json_to_sheet(introData);
            XLSX.utils.book_append_sheet(wb, introSheet, 'Introduction');

            // Sheet: Crop Production
            const cropData = filteredAssessments.flatMap(flattenCropData);
            if (cropData.length > 0) {
                const cropSheet = XLSX.utils.json_to_sheet(cropData);
                XLSX.utils.book_append_sheet(wb, cropSheet, 'Crop Production');
            }

            // Sheet: Livestock
            const livestockData = filteredAssessments.flatMap(flattenLivestockData);
            if (livestockData.length > 0) {
                const livestockSheet = XLSX.utils.json_to_sheet(livestockData);
                XLSX.utils.book_append_sheet(wb, livestockSheet, 'Livestock');
            }

            // Sheet: Fisheries
            const fisheriesData = filteredAssessments.flatMap(flattenFisheriesData);
            if (fisheriesData.length > 0) {
                const fisheriesSheet = XLSX.utils.json_to_sheet(fisheriesData);
                XLSX.utils.book_append_sheet(wb, fisheriesSheet, 'Fisheries');
            }

            // Sheet: Markets & Trade
            const marketsData = filteredAssessments.flatMap(flattenMarketsData);
            if (marketsData.length > 0) {
                const marketsSheet = XLSX.utils.json_to_sheet(marketsData);
                XLSX.utils.book_append_sheet(wb, marketsSheet, 'Markets & Trade');
            }

            // Generate filename
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `Food_Security_Assessment_Complete_${timestamp}.xlsx`;

            // Write file
            XLSX.writeFile(wb, filename);

            alert(`Successfully exported ${filteredAssessments.length} assessments with food security analysis!`);
        } catch (err) {
            console.error('Export error:', err);
            alert('Error exporting to Excel: ' + err.message);
        } finally {
            setExporting(false);
        }
    };

    // ==========================================
    // EXPORT BY DISTRICT FUNCTION (ZIP VERSION)
    // ==========================================

    const exportByDistrict = async () => {
        setExportingByDistrict(true);
        try {
            // Filter assessments
            let filteredAssessments = [...assessments];

            if (filters.district) {
                filteredAssessments = filteredAssessments.filter(a =>
                    a.submission_data?.district?.toLowerCase().includes(filters.district.toLowerCase())
                );
            }
            if (filters.region) {
                filteredAssessments = filteredAssessments.filter(a =>
                    a.submission_data?.statisticalRegion?.toLowerCase().includes(filters.region.toLowerCase())
                );
            }
            if (filters.startDate) {
                filteredAssessments = filteredAssessments.filter(a =>
                    new Date(a.created_at) >= new Date(filters.startDate)
                );
            }
            if (filters.endDate) {
                filteredAssessments = filteredAssessments.filter(a =>
                    new Date(a.created_at) <= new Date(filters.endDate)
                );
            }

            if (filteredAssessments.length === 0) {
                alert('No assessments found matching your filters!');
                return;
            }

            // Group assessments by district
            const districtGroups = {};
            filteredAssessments.forEach(assessment => {
                const district = assessment.submission_data?.district || 'Unknown';
                if (!districtGroups[district]) {
                    districtGroups[district] = [];
                }
                districtGroups[district].push(assessment);
            });

            const timestamp = new Date().toISOString().split('T')[0];

            // Create ZIP file
            const zip = new JSZip();
            let filesCreated = 0;

            // Create separate file for each district
            Object.entries(districtGroups).forEach(([district, districtAssessments]) => {
                const wb = XLSX.utils.book_new();

                // ===== FOOD SECURITY OUTLOOK SHEET =====
                const foodSecurityData = districtAssessments.map(analyzeFoodSecurity);
                if (foodSecurityData.length > 0) {
                    const fsSheet = XLSX.utils.json_to_sheet(foodSecurityData);
                    XLSX.utils.book_append_sheet(wb, fsSheet, 'Food Security Outlook');
                }

                // ===== INTRODUCTION =====
                const introData = districtAssessments.map(flattenIntroData);
                const introSheet = XLSX.utils.json_to_sheet(introData);
                XLSX.utils.book_append_sheet(wb, introSheet, 'Introduction');

                // ===== CROP PRODUCTION =====
                const cropData = districtAssessments.flatMap(flattenCropData);
                if (cropData.length > 0) {
                    const cropSheet = XLSX.utils.json_to_sheet(cropData);
                    XLSX.utils.book_append_sheet(wb, cropSheet, 'Crop Production');
                }

                // ===== LIVESTOCK =====
                const livestockData = districtAssessments.flatMap(flattenLivestockData);
                if (livestockData.length > 0) {
                    const livestockSheet = XLSX.utils.json_to_sheet(livestockData);
                    XLSX.utils.book_append_sheet(wb, livestockSheet, 'Livestock');
                }

                // ===== FISHERIES =====
                const fisheriesData = districtAssessments.flatMap(flattenFisheriesData);
                if (fisheriesData.length > 0) {
                    const fisheriesSheet = XLSX.utils.json_to_sheet(fisheriesData);
                    XLSX.utils.book_append_sheet(wb, fisheriesSheet, 'Fisheries');
                }

                // ===== MARKETS & TRADE =====
                const marketsData = districtAssessments.flatMap(flattenMarketsData);
                if (marketsData.length > 0) {
                    const marketsSheet = XLSX.utils.json_to_sheet(marketsData);
                    XLSX.utils.book_append_sheet(wb, marketsSheet, 'Markets & Trade');
                }

                // Convert workbook to binary
                const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

                // Sanitize district name for filename
                const sanitizedDistrict = district.replace(/[^a-z0-9]/gi, '_');
                const filename = `${sanitizedDistrict}_Food_Security_${timestamp}.xlsx`;

                // Add to ZIP
                zip.file(filename, excelBuffer);
                filesCreated++;
            });

            // Generate ZIP file
            const zipBlob = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 6 }
            });

            // Download ZIP
            const zipFilename = `District_Food_Security_Reports_${timestamp}.zip`;
            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipBlob);
            link.download = zipFilename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

            alert(`Successfully created ZIP file with ${filesCreated} district reports (${filteredAssessments.length} total assessments)!\n\nFile: ${zipFilename}`);
        } catch (err) {
            console.error('Export error:', err);
            alert('Error exporting by district: ' + err.message);
        } finally {
            setExportingByDistrict(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading assessments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Activity className="w-10 h-10 text-green-600" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                            <p className="text-gray-600 mt-1">
                                Export assessment data with comprehensive food security analysis
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center gap-4">
                            <Database className="w-10 h-10 text-blue-600" />
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Total Assessments</p>
                                <p className="text-3xl font-bold text-gray-900">{assessments.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center gap-4">
                            <Users className="w-10 h-10 text-green-600" />
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Unique Districts</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {new Set(assessments.map(a => a.submission_data?.district).filter(Boolean)).size}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center gap-4">
                            <Calendar className="w-10 h-10 text-purple-600" />
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Latest Submission</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {assessments[0]?.created_at
                                        ? new Date(assessments[0].created_at).toLocaleDateString()
                                        : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Filter className="w-6 h-6 text-gray-700" />
                        <h2 className="text-2xl font-bold text-gray-900">Filter Data</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                District
                            </label>
                            <input
                                type="text"
                                placeholder="Enter district..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                value={filters.district}
                                onChange={(e) => setFilters({ ...filters, district: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Region
                            </label>
                            <input
                                type="text"
                                placeholder="Enter region..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                value={filters.region}
                                onChange={(e) => setFilters({ ...filters, region: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date
                            </label>
                            <input
                                type="date"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                value={filters.startDate}
                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Date
                            </label>
                            <input
                                type="date"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                value={filters.endDate}
                                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => setFilters({ startDate: '', endDate: '', district: '', region: '' })}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                        Clear Filters
                    </button>
                </div>

                {/* Export Button */}
                <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
                    <div className="flex items-start gap-6">
                        <FileSpreadsheet className="w-12 h-12 flex-shrink-0" />
                        <div className="flex-grow">
                            <h2 className="text-2xl font-bold mb-2">Export Options</h2>
                            <p className="text-green-50 mb-6">
                                Download comprehensive assessment data with food security analysis. Includes:
                            </p>
                            <ul className="text-green-50 mb-6 space-y-1 ml-4">
                                <li>• <strong>Food Security Outlook</strong> - IPC-style analysis with scores</li>
                                <li>• <strong>Introduction</strong> - Basic assessment information</li>
                                <li>• <strong>Crop Production</strong> - Performance, yields, utilization</li>
                                <li>• <strong>Livestock</strong> - Numbers, conditions, milk production</li>
                                <li>• <strong>Fisheries</strong> - Catch data and species information</li>
                                <li>• <strong>Markets & Trade</strong> - Prices, access, transport</li>
                            </ul>

                            <div className="flex flex-wrap gap-4">
                                {/* Single File Export */}
                                <button
                                    onClick={exportToExcel}
                                    disabled={exporting || exportingByDistrict}
                                    className="px-8 py-3 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-all font-semibold shadow-md flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {exporting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Exporting...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-5 h-5" />
                                            Export All Districts (Single File)
                                        </>
                                    )}
                                </button>

                                {/* Export by District as ZIP */}
                                <button
                                    onClick={exportByDistrict}
                                    disabled={exporting || exportingByDistrict}
                                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-md flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-white"
                                >
                                    {exportingByDistrict ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Creating ZIP...
                                        </>
                                    ) : (
                                        <>
                                            <Archive className="w-5 h-5" />
                                            Export by District (ZIP File)
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="mt-4 text-sm text-green-50">
                                <p>💡 <strong>Tip:</strong> Use "Single File" for overall Power BI analysis. Use "ZIP File" to get separate Excel reports for each district.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Assessments Table */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Assessments</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        District
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Region
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Sub County
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Official
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {assessments.slice(0, 10).map((assessment) => (
                                    <tr key={assessment.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(assessment.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {assessment.submission_data?.district || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {assessment.submission_data?.statisticalRegion || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {assessment.submission_data?.subCounty || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {assessment.submission_data?.officialName || 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;