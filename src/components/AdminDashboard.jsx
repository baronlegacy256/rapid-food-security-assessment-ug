import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Download, FileSpreadsheet, Loader2, Calendar, Filter, Users, Database } from 'lucide-react';
import * as XLSX from 'xlsx';

import { flattenIntroData } from '../utils/flatteners/intro';
import { flattenCropData } from '../utils/flatteners/crop';
import { flattenLivestockData } from '../utils/flatteners/livestock';
import { flattenFisheriesData } from '../utils/flatteners/fisheries';
import { flattenMarketsData } from '../utils/flatteners/markets';

const AdminDashboard = () => {
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        district: '',
        region: ''
    });

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

    const exportToExcel = async () => {
        setExporting(true);
        try {
            // Filter assessments based on criteria
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

            // Sheet 1: Introduction/Basic Info
            const introData = filteredAssessments.map(flattenIntroData);
            const introSheet = XLSX.utils.json_to_sheet(introData);
            XLSX.utils.book_append_sheet(wb, introSheet, 'Introduction');

            // Sheet 2: Crop Production (flattened)
            const cropData = filteredAssessments.flatMap(flattenCropData);
            if (cropData.length > 0) {
                const cropSheet = XLSX.utils.json_to_sheet(cropData);
                XLSX.utils.book_append_sheet(wb, cropSheet, 'Crop Production');
            }

            // Sheet 3: Livestock (flattened)
            const livestockData = filteredAssessments.flatMap(flattenLivestockData);
            if (livestockData.length > 0) {
                const livestockSheet = XLSX.utils.json_to_sheet(livestockData);
                XLSX.utils.book_append_sheet(wb, livestockSheet, 'Livestock');
            }

            // Sheet 4: Fisheries (flattened)
            const fisheriesData = filteredAssessments.flatMap(flattenFisheriesData);
            if (fisheriesData.length > 0) {
                const fisheriesSheet = XLSX.utils.json_to_sheet(fisheriesData);
                XLSX.utils.book_append_sheet(wb, fisheriesSheet, 'Fisheries');
            }

            // Sheet 5: Markets & Trade (flattened)
            const marketsData = filteredAssessments.flatMap(flattenMarketsData);
            if (marketsData.length > 0) {
                const marketsSheet = XLSX.utils.json_to_sheet(marketsData);
                XLSX.utils.book_append_sheet(wb, marketsSheet, 'Markets & Trade');
            }

            // Generate filename with timestamp
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `Food_Security_Assessment_${timestamp}.xlsx`;

            // Write file
            XLSX.writeFile(wb, filename);

            alert(`Successfully exported ${filteredAssessments.length} assessments to Excel!`);
        } catch (err) {
            console.error('Export error:', err);
            alert('Error exporting to Excel: ' + err.message);
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <Database className="w-8 h-8" />
                    <h2 className="text-2xl font-bold">Admin Dashboard</h2>
                </div>
                <p className="text-blue-100">Export assessment data to Excel for analysis in Power BI</p>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Assessments</p>
                            <p className="text-2xl font-bold text-gray-900">{assessments.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <Users className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Unique Districts</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {new Set(assessments.map(a => a.submission_data?.district).filter(Boolean)).size}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Calendar className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Latest Submission</p>
                            <p className="text-sm font-bold text-gray-900">
                                {assessments[0]?.created_at ? new Date(assessments[0].created_at).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-bold text-gray-900">Filter Data</h3>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            placeholder="Enter district name"
                            value={filters.district}
                            onChange={(e) => setFilters({ ...filters, district: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            placeholder="Enter region"
                            value={filters.region}
                            onChange={(e) => setFilters({ ...filters, region: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                        <input
                            type="date"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                        <input
                            type="date"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                        />
                    </div>
                </div>

                <div className="mt-4 flex gap-3">
                    <button
                        onClick={() => setFilters({ startDate: '', endDate: '', district: '', region: '' })}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Export Button */}
            <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Export to Excel</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Download all assessment data as an Excel file with separate sheets for each section.
                    The data is flattened and optimized for Power BI analysis.
                </p>

                <button
                    onClick={exportToExcel}
                    disabled={exporting || assessments.length === 0}
                    className="flex items-center gap-3 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {exporting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Exporting...
                        </>
                    ) : (
                        <>
                            <Download className="w-5 h-5" />
                            Export to Excel
                        </>
                    )}
                </button>
            </div>

            {/* Recent Assessments Table */}
            <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Recent Assessments</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">District</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub County</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Official</th>
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
    );
};

export default AdminDashboard;
