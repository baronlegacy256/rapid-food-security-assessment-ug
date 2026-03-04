import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
    Download, FileSpreadsheet, Loader2, Calendar, Filter, Users, Database,
    Trash2, Eye, Search, RefreshCw, AlertTriangle, CheckCircle, XCircle,
    BarChart3, TrendingUp, MapPin, Shield
} from 'lucide-react';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { flattenIntroData } from '../utils/flatteners/intro';
import { flattenCropData } from '../utils/flatteners/crop';
import { flattenLivestockData } from '../utils/flatteners/livestock';
import { flattenFisheriesData } from '../utils/flatteners/fisheries';
import { flattenMarketsData } from '../utils/flatteners/markets';
import DistrictDpoDirectory from '../components/admin/DistrictDpoDirectory';

const AdminPanel = ({ session, onExit }) => {
    const [assessments, setAssessments] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'assessments', 'districts', 'export'
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        district: '',
        region: ''
    });
    const [selectedAssessments, setSelectedAssessments] = useState([]);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch assessments
            const { data: assessmentsData, error: assessmentsError } = await supabase
                .from('assessments')
                .select('*')
                .order('created_at', { ascending: false });

            if (assessmentsError) throw assessmentsError;
            setAssessments(assessmentsData || []);

            // Fetch unique users from assessments
            const uniqueUsers = [...new Set(assessmentsData?.map(a => a.user_id))];
            setUsers(uniqueUsers.map(id => ({ id, email: 'User ' + id.substring(0, 8) })));

        } catch (err) {
            console.error('Error fetching data:', err);
            alert('Error loading data: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const deleteAssessment = async (id) => {
        try {
            const { error } = await supabase
                .from('assessments')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setAssessments(assessments.filter(a => a.id !== id));
            setDeleteConfirm(null);
            alert('Assessment deleted successfully!');
        } catch (err) {
            console.error('Error deleting assessment:', err);
            alert('Error deleting assessment: ' + err.message);
        }
    };

    const deleteBulkAssessments = async () => {
        if (selectedAssessments.length === 0) return;

        if (!confirm(`Are you sure you want to delete ${selectedAssessments.length} assessments? This cannot be undone.`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from('assessments')
                .delete()
                .in('id', selectedAssessments);

            if (error) throw error;

            setAssessments(assessments.filter(a => !selectedAssessments.includes(a.id)));
            setSelectedAssessments([]);
            alert(`${selectedAssessments.length} assessments deleted successfully!`);
        } catch (err) {
            console.error('Error deleting assessments:', err);
            alert('Error deleting assessments: ' + err.message);
        }
    };

    const toggleSelectAssessment = (id) => {
        if (selectedAssessments.includes(id)) {
            setSelectedAssessments(selectedAssessments.filter(aid => aid !== id));
        } else {
            setSelectedAssessments([...selectedAssessments, id]);
        }
    };

    const toggleSelectAll = () => {
        if (selectedAssessments.length === filteredAssessments.length) {
            setSelectedAssessments([]);
        } else {
            setSelectedAssessments(filteredAssessments.map(a => a.id));
        }
    };

    // Build workbook using shared flatteners (covers all form fields)
    const buildWorkbookForAssessments = (assessmentList) => {
        const wb = XLSX.utils.book_new();

        const introData = assessmentList.map(flattenIntroData);
        if (introData.length > 0) {
            const introSheet = XLSX.utils.json_to_sheet(introData);
            XLSX.utils.book_append_sheet(wb, introSheet, 'Introduction');
        }

        const cropData = assessmentList.flatMap(flattenCropData);
        if (cropData.length > 0) {
            const cropSheet = XLSX.utils.json_to_sheet(cropData);
            XLSX.utils.book_append_sheet(wb, cropSheet, 'Crop Production');
        }

        const livestockData = assessmentList.flatMap(flattenLivestockData);
        if (livestockData.length > 0) {
            const livestockSheet = XLSX.utils.json_to_sheet(livestockData);
            XLSX.utils.book_append_sheet(wb, livestockSheet, 'Livestock');
        }

        const fisheriesData = assessmentList.flatMap(flattenFisheriesData);
        if (fisheriesData.length > 0) {
            const fisheriesSheet = XLSX.utils.json_to_sheet(fisheriesData);
            XLSX.utils.book_append_sheet(wb, fisheriesSheet, 'Fisheries');
        }

        const marketsData = assessmentList.flatMap(flattenMarketsData);
        if (marketsData.length > 0) {
            const marketsSheet = XLSX.utils.json_to_sheet(marketsData);
            XLSX.utils.book_append_sheet(wb, marketsSheet, 'Markets & Trade');
        }

        return wb;
    };

    const exportToExcel = async () => {
        setExporting(true);
        try {
            // If specific assessments are selected, export only those; otherwise export all filtered
            const exportList = selectedAssessments.length > 0
                ? filteredAssessments.filter(a => selectedAssessments.includes(a.id))
                : [...filteredAssessments];

            if (exportList.length === 0) {
                alert('No assessments to export. Adjust your filters or selection.');
                return;
            }

            const zip = new JSZip();
            const timestamp = new Date().toISOString().split('T')[0];

            exportList.forEach((assessment) => {
                const wb = buildWorkbookForAssessments([assessment]);
                const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

                const district = (assessment.submission_data?.district || 'District').toString();
                const safeDistrict = district.replace(/[^a-z0-9]/gi, '_') || 'District';
                const filename = `${safeDistrict}_Assessment_${assessment.id}_${timestamp}.xlsx`;

                zip.file(filename, excelBuffer);
            });

            const zipBlob = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 6 }
            });

            const zipFilename = `Food_Security_Assessments_${timestamp}.zip`;
            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipBlob);
            link.download = zipFilename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

            alert(`Successfully exported ${exportList.length} assessment file(s) in a ZIP archive.\n\nFile: ${zipFilename}`);
        } catch (err) {
            console.error('Export error:', err);
            alert('Error exporting to Excel: ' + err.message);
        } finally {
            setExporting(false);
        }
    };

    // Filter assessments
    const filteredAssessments = assessments.filter(a => {
        const data = a.submission_data || {};

        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            if (!data.district?.toLowerCase().includes(search) &&
                !data.subCounty?.toLowerCase().includes(search) &&
                !data.officialName?.toLowerCase().includes(search)) {
                return false;
            }
        }

        if (filters.district && !data.district?.toLowerCase().includes(filters.district.toLowerCase())) {
            return false;
        }

        if (filters.region && !data.statisticalRegion?.toLowerCase().includes(filters.region.toLowerCase())) {
            return false;
        }

        if (filters.startDate && new Date(a.created_at) < new Date(filters.startDate)) {
            return false;
        }

        if (filters.endDate && new Date(a.created_at) > new Date(filters.endDate)) {
            return false;
        }

        return true;
    });

    // Statistics
    const stats = {
        total: assessments.length,
        thisMonth: assessments.filter(a => {
            const date = new Date(a.created_at);
            const now = new Date();
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length,
        districts: new Set(assessments.map(a => a.submission_data?.district).filter(Boolean)).size,
        regions: new Set(assessments.map(a => a.submission_data?.statisticalRegion).filter(Boolean)).size
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                <Shield className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">Admin Panel</h1>
                                <p className="text-purple-100">Food Security Assessment Management</p>
                            </div>
                        </div>
                        <button
                            onClick={onExit}
                            className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors backdrop-blur-sm"
                        >
                            Exit Admin
                        </button>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex gap-1 overflow-x-auto">
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                            { id: 'assessments', label: 'Assessments', icon: Database },
                            { id: 'districts', label: 'District DPOs', icon: MapPin },
                            { id: 'export', label: 'Export Data', icon: Download }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 ${activeTab === tab.id
                                        ? 'border-purple-600 text-purple-600 bg-purple-50'
                                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid md:grid-cols-4 gap-6">
                            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Total Assessments</p>
                                        <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <TrendingUp className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">This Month</p>
                                        <p className="text-3xl font-bold text-gray-900">{stats.thisMonth}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-purple-100 rounded-lg">
                                        <MapPin className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Districts</p>
                                        <p className="text-3xl font-bold text-gray-900">{stats.districts}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-orange-100 rounded-lg">
                                        <Users className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Regions</p>
                                        <p className="text-3xl font-bold text-gray-900">{stats.regions}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                <button
                                    onClick={() => setActiveTab('export')}
                                    className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                                >
                                    <Download className="w-6 h-6 text-green-600" />
                                    <div className="text-left">
                                        <p className="font-bold text-gray-900">Export Data</p>
                                        <p className="text-sm text-gray-600">Download as Excel</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setActiveTab('assessments')}
                                    className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                                >
                                    <Database className="w-6 h-6 text-blue-600" />
                                    <div className="text-left">
                                        <p className="font-bold text-gray-900">Manage Assessments</p>
                                        <p className="text-sm text-gray-600">View and delete</p>
                                    </div>
                                </button>

                                <button
                                    onClick={fetchData}
                                    className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200"
                                >
                                    <RefreshCw className="w-6 h-6 text-purple-600" />
                                    <div className="text-left">
                                        <p className="font-bold text-gray-900">Refresh Data</p>
                                        <p className="text-sm text-gray-600">Reload from database</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900">Recent Assessments</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">District</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Official</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {assessments.slice(0, 5).map((assessment) => (
                                            <tr key={assessment.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(assessment.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {assessment.submission_data?.district || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {assessment.submission_data?.officialName || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                                        Submitted
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Assessments Tab */}
                {activeTab === 'assessments' && (
                    <div className="space-y-6">
                        {/* Search and Filters */}
                        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                            <div className="flex items-center gap-4 mb-4">
                                <Search className="w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by district, sub-county, or official name..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setFilters({ startDate: '', endDate: '', district: '', region: '' });
                                    }}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Clear
                                </button>
                            </div>

                            <div className="grid md:grid-cols-4 gap-4">
                                <input
                                    type="text"
                                    placeholder="District"
                                    className="px-4 py-2 border border-gray-300 rounded-lg"
                                    value={filters.district}
                                    onChange={(e) => setFilters({ ...filters, district: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Region"
                                    className="px-4 py-2 border border-gray-300 rounded-lg"
                                    value={filters.region}
                                    onChange={(e) => setFilters({ ...filters, region: e.target.value })}
                                />
                                <input
                                    type="date"
                                    className="px-4 py-2 border border-gray-300 rounded-lg"
                                    value={filters.startDate}
                                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                />
                                <input
                                    type="date"
                                    className="px-4 py-2 border border-gray-300 rounded-lg"
                                    value={filters.endDate}
                                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Bulk Actions */}
                        {selectedAssessments.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                    <span className="font-medium text-red-900">
                                        {selectedAssessments.length} assessment(s) selected
                                    </span>
                                </div>
                                <button
                                    onClick={deleteBulkAssessments}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Selected
                                </button>
                            </div>
                        )}

                        {/* Assessments Table */}
                        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-900">
                                    All Assessments ({filteredAssessments.length})
                                </h3>
                                <button
                                    onClick={toggleSelectAll}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    {selectedAssessments.length === filteredAssessments.length ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedAssessments.length === filteredAssessments.length && filteredAssessments.length > 0}
                                                    onChange={toggleSelectAll}
                                                    className="w-4 h-4 rounded"
                                                />
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">District</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sub County</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Official</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredAssessments.map((assessment) => (
                                            <tr key={assessment.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedAssessments.includes(assessment.id)}
                                                        onChange={() => toggleSelectAssessment(assessment.id)}
                                                        className="w-4 h-4 rounded"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(assessment.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {assessment.submission_data?.district || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {assessment.submission_data?.subCounty || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {assessment.submission_data?.officialName || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {assessment.reporting_period || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => setDeleteConfirm(assessment.id)}
                                                        className="text-red-600 hover:text-red-900 ml-4"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* District DPO Directory */}
                {activeTab === 'districts' && (
                    <DistrictDpoDirectory />
                )}

                {/* Export Tab */}
                {activeTab === 'export' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Export Filters</h3>

                            <div className="grid md:grid-cols-4 gap-4 mb-6">
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

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setFilters({ startDate: '', endDate: '', district: '', region: '' })}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Export to Excel (ZIP)</h3>
                            <p className="text-sm text-gray-600 mb-6">
                                Download each assessment as its own Excel file (with sheets for Introduction, Crop Production, Livestock, Fisheries, Markets &amp; Trade), bundled together in a single ZIP.
                                All fields from the form are flattened, following the same structure as the offline Python export, and optimized for Power BI analysis.
                            </p>

                            <button
                                onClick={exportToExcel}
                                disabled={exporting || filteredAssessments.length === 0}
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
                                        {selectedAssessments.length > 0
                                            ? `Export ${selectedAssessments.length} Selected Assessment(s)`
                                            : `Export ${filteredAssessments.length} Assessment(s) to Excel`}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-red-100 rounded-lg">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Delete Assessment</h3>
                        </div>

                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this assessment? This action cannot be undone.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => deleteAssessment(deleteConfirm)}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
