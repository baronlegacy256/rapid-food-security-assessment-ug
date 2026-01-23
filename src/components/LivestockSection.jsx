import React from 'react';
import useTableNavigation from '../hooks/useTableNavigation';

const LivestockSection = ({ formData, updateFormData }) => {
    // Navigation refs
    const table1Ref = useTableNavigation(); // Current Conditions
    const table2Ref = useTableNavigation(); // Livestock Numbers
    const table3Ref = useTableNavigation(); // Market Prices
    const table4Ref = useTableNavigation(); // Outbreaks
    const table5Ref = useTableNavigation(); // Interventions
    const table6Ref = useTableNavigation(); // Milk
    const table7Ref = useTableNavigation(); // Water

    // Helper to safely get nested values or defaults
    const getVal = (field, key, defaultVal = '') => {
        return formData[field]?.[key] ?? defaultVal;
    };

    const handleObjectChange = (field, key, value) => {
        updateFormData(field, { ...formData[field], [key]: value });
    };

    const livestockTypes = ['Cattle', 'Goats', 'Sheep', 'Pigs', 'Poultry'];

    return (
        <div className="space-y-8">
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4">
                <h3 className="font-semibold text-orange-900 uppercase text-2xl">Section 2: Livestock Production Data</h3>
                <p className="text-sm text-orange-800 mt-1">To be administered to District Production Officers / District Veterinary Officers</p>
            </div>

            {/* 2.1 Current Conditions */}
            <div>
                <h4 className="text-lg font-semibold mb-4">2.1 Current Conditions (Pasture, Water, Body Condition)</h4>
                <p className="text-sm text-gray-600 mb-3">Rate: 1 (Very Poor) to 5 (Very Good). Change: + (Improving), - (Worsening), = (Stable)</p>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 text-sm" ref={table1Ref}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2 text-left">Category</th>
                                <th className="border border-gray-300 px-4 py-2">Condition (1-5)</th>
                                <th className="border border-gray-300 px-4 py-2">Change (+/-/=)</th>
                                <th className="border border-gray-300 px-4 py-2">Comment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {['Pasture availability', 'Pasture quality', 'Water availability', 'Water quality', 'Livestock Body Condition'].map((item, rowIndex) => (
                                <tr key={item}>
                                    <td className="border border-gray-300 px-4 py-2 font-medium">{item}</td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input
                                            type="number"
                                            min="1" // Rated 1-5
                                            max="5"
                                            data-row={rowIndex}
                                            data-col={0}
                                            className="w-full border-gray-200 rounded text-center"
                                            value={getVal('livestockConditions', `${item}_score`)}
                                            onChange={(e) => handleObjectChange('livestockConditions', `${item}_score`, e.target.value)}
                                        />
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1 text-center">
                                        <select
                                            data-row={rowIndex}
                                            data-col={1}
                                            className="w-full border-gray-200 rounded text-center"
                                            value={getVal('livestockConditions', `${item}_trend`)}
                                            onChange={(e) => handleObjectChange('livestockConditions', `${item}_trend`, e.target.value)}
                                        >
                                            <option value="">Select...</option>
                                            <option value="+">Improving (+)</option>
                                            <option value="-">Worsening (-)</option>
                                            <option value="=">Stable (=)</option>
                                        </select>
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input
                                            type="text"
                                            data-row={rowIndex}
                                            data-col={2}
                                            className="w-full border-gray-200 rounded"
                                            value={getVal('livestockConditions', `${item}_comment`)}
                                            onChange={(e) => handleObjectChange('livestockConditions', `${item}_comment`, e.target.value)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 2.2 Livestock Numbers */}
            <div>
                <h4 className="text-lg font-semibold mb-4">2.2 Livestock Numbers & Trends (Compared to Normal)</h4>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 text-sm" ref={table2Ref}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2 text-left">Livestock Type</th>
                                <th className="border border-gray-300 px-4 py-2">Total Number (Est)</th>
                                <th className="border border-gray-300 px-4 py-2">% Change vs Normal</th>
                                <th className="border border-gray-300 px-4 py-2">Reason for Change</th>
                            </tr>
                        </thead>
                        <tbody>
                            {livestockTypes.map((type, rowIndex) => (
                                <tr key={type}>
                                    <td className="border border-gray-300 px-4 py-2 font-medium">{type}</td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input
                                            type="number"
                                            min="0" // Added min 0
                                            data-row={rowIndex}
                                            data-col={0}
                                            className="w-full border-gray-200 rounded text-center"
                                            value={getVal('livestockNumbers', `${type}_count`)}
                                            onChange={(e) => handleObjectChange('livestockNumbers', `${type}_count`, e.target.value)}
                                        />
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input
                                            type="number"
                                            data-row={rowIndex}
                                            data-col={1}
                                            className="w-full border-gray-200 rounded text-center"
                                            placeholder="+/- %" // % Change can be negative (e.g., -10%)
                                            value={getVal('livestockNumbers', `${type}_change`)}
                                            onChange={(e) => handleObjectChange('livestockNumbers', `${type}_change`, e.target.value)}
                                        />
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input
                                            type="text"
                                            data-row={rowIndex}
                                            data-col={2}
                                            className="w-full border-gray-200 rounded"
                                            value={getVal('livestockNumbers', `${type}_reason`)}
                                            onChange={(e) => handleObjectChange('livestockNumbers', `${type}_reason`, e.target.value)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 2.3 Market Data */}
            <div>
                <h4 className="text-lg font-semibold mb-4">2.3 Livestock Ownership</h4>
                <div className="grid md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Average livestock holding per household (TLU)</label>
                        <input
                            type="number"
                            min="0" // Added min 0
                            step="0.1"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            value={getVal('livestockMarket', 'avg_holding')}
                            onChange={(e) => handleObjectChange('livestockMarket', 'avg_holding', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4">Average Animals Sold/Month in Main Markets</h4>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 text-sm" ref={table3Ref}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                                <th className="border border-gray-300 px-4 py-2">Normal Year (Number)</th>
                                <th className="border border-gray-300 px-4 py-2">Current Year (Number)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {livestockTypes.map((type, rowIndex) => (
                                <tr key={type}>
                                    <td className="border border-gray-300 px-4 py-2 font-medium">{type}</td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input
                                            type="number"
                                            min="0" // Added min 0
                                            data-row={rowIndex}
                                            data-col={0}
                                            className="w-full border-gray-200 rounded text-center"
                                            value={getVal('livestockSales', `${type}_normal`)}
                                            onChange={(e) => handleObjectChange('livestockSales', `${type}_normal`, e.target.value)}
                                        />
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input
                                            type="number"
                                            min="0" // Added min 0
                                            data-row={rowIndex}
                                            data-col={1}
                                            className="w-full border-gray-200 rounded text-center"
                                            value={getVal('livestockSales', `${type}_current`)}
                                            onChange={(e) => handleObjectChange('livestockSales', `${type}_current`, e.target.value)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 2.4 Disease Outbreaks (Livestock) */}
            <div className="pt-6">
                <h4 className="text-lg font-semibold mb-4">2.4 Major Livestock Disease Outbreaks (Last 6 Months)</h4>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 text-sm" ref={table4Ref}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2 w-10">No.</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Disease</th>
                                <th className="border border-gray-300 px-4 py-2">Livestock Affected</th>
                                <th className="border border-gray-300 px-4 py-2">Sub-counties Affected</th>
                                <th className="border border-gray-300 px-4 py-2">Est. Deaths</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3].map((i, rowIndex) => (
                                <tr key={i}>
                                    <td className="border border-gray-300 px-2 py-1 text-center font-bold">{i}</td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input
                                            type="text"
                                            data-row={rowIndex}
                                            data-col={0}
                                            className="w-full border-gray-200 rounded"
                                            value={getVal('livestockDiseases', `name_${i}`)}
                                            onChange={(e) => handleObjectChange('livestockDiseases', `name_${i}`, e.target.value)}
                                        />
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input
                                            type="text"
                                            data-row={rowIndex}
                                            data-col={1}
                                            className="w-full border-gray-200 rounded"
                                            value={getVal('livestockDiseases', `affected_${i}`)}
                                            onChange={(e) => handleObjectChange('livestockDiseases', `affected_${i}`, e.target.value)}
                                        />
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input
                                            type="text"
                                            data-row={rowIndex}
                                            data-col={2}
                                            className="w-full border-gray-200 rounded"
                                            value={getVal('livestockDiseases', `subcounties_${i}`)}
                                            onChange={(e) => handleObjectChange('livestockDiseases', `subcounties_${i}`, e.target.value)}
                                        />
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input
                                            type="number"
                                            min="0" // Added min 0
                                            data-row={rowIndex}
                                            data-col={3}
                                            className="w-full border-gray-200 rounded text-center"
                                            value={getVal('livestockDiseases', `deaths_${i}`)}
                                            onChange={(e) => handleObjectChange('livestockDiseases', `deaths_${i}`, e.target.value)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 2.5 Interventions NOT working */}
            <div className="pt-6">
                <h4 className="text-lg font-semibold mb-4">2.5 Interventions undertaken but NOT working properly?</h4>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 text-sm" ref={table5Ref}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2 w-10">No.</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Intervention Type</th>
                                <th className="border border-gray-300 px-4 py-2">Where (Sub-counties)</th>
                                <th className="border border-gray-300 px-4 py-2">Implemented By Whom?</th>
                                <th className="border border-gray-300 px-4 py-2">Why not effective?</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3].map((i, rowIndex) => (
                                <tr key={i}>
                                    <td className="border border-gray-300 px-2 py-1 text-center font-bold">{i}</td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input
                                            type="text"
                                            data-row={rowIndex}
                                            data-col={0}
                                            className="w-full border-gray-200 rounded"
                                            value={getVal('livestockInterventions', `type_${i}`)}
                                            onChange={(e) => handleObjectChange('livestockInterventions', `type_${i}`, e.target.value)}
                                        />
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input
                                            type="text"
                                            data-row={rowIndex}
                                            data-col={1}
                                            className="w-full border-gray-200 rounded"
                                            value={getVal('livestockInterventions', `where_${i}`)}
                                            onChange={(e) => handleObjectChange('livestockInterventions', `where_${i}`, e.target.value)}
                                        />
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input
                                            type="text"
                                            data-row={rowIndex}
                                            data-col={2}
                                            className="w-full border-gray-200 rounded"
                                            value={getVal('livestockInterventions', `who_${i}`)}
                                            onChange={(e) => handleObjectChange('livestockInterventions', `who_${i}`, e.target.value)}
                                        />
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input
                                            type="text"
                                            data-row={rowIndex}
                                            data-col={3}
                                            className="w-full border-gray-200 rounded"
                                            value={getVal('livestockInterventions', `why_${i}`)}
                                            onChange={(e) => handleObjectChange('livestockInterventions', `why_${i}`, e.target.value)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 2.6 Milk Production */}
            <div className="pt-6">
                <h4 className="text-lg font-semibold mb-4">2.6 Daily Milk Production & Consumption</h4>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 text-sm" ref={table6Ref}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2 text-left">Animal</th>
                                <th className="border border-gray-300 px-4 py-2">Avg Litres / Animal / Day</th>
                                <th className="border border-gray-300 px-4 py-2">Avg Selling Price / Litre</th>
                            </tr>
                        </thead>
                        <tbody>
                            {['Indigenous Cattle', 'Exotic Cattle', 'Goats', 'Camels'].map((type, rowIndex) => (
                                <tr key={type}>
                                    <td className="border border-gray-300 px-4 py-2 font-medium">{type}</td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input
                                            type="number"
                                            min="0" // Added min 0
                                            step="0.1"
                                            data-row={rowIndex}
                                            data-col={0}
                                            className="w-full border-gray-200 rounded text-center"
                                            value={getVal('milkProduction', `${type}_litres`)}
                                            onChange={(e) => handleObjectChange('milkProduction', `${type}_litres`, e.target.value)}
                                        />
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input
                                            type="number"
                                            min="0" // Added min 0
                                            step="50"
                                            data-row={rowIndex}
                                            data-col={1}
                                            className="w-full border-gray-200 rounded text-center"
                                            value={getVal('milkProduction', `${type}_price`)}
                                            onChange={(e) => handleObjectChange('milkProduction', `${type}_price`, e.target.value)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 2.7 Water Sources */}
            <div className="pt-6">
                <h4 className="text-lg font-semibold mb-4">2.7 Main water sources for livestock</h4>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 text-sm" ref={table7Ref}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2 text-left" rowSpan="2">Water Source</th>
                                <th className="border border-gray-300 px-4 py-2 text-center" colSpan="2">Distance to Source (km)</th>
                                <th className="border border-gray-300 px-4 py-2 text-center" colSpan="2">Waiting Time (mins)</th>
                                <th className="border border-gray-300 px-4 py-2 text-center" colSpan="2">Cost (UGX / 20L)</th>
                            </tr>
                            <tr className="bg-gray-50">
                                <th className="border border-gray-300 px-2 py-1 text-xs">Normal</th>
                                <th className="border border-gray-300 px-2 py-1 text-xs">Current</th>
                                <th className="border border-gray-300 px-2 py-1 text-xs">Normal</th>
                                <th className="border border-gray-300 px-2 py-1 text-xs">Current</th>
                                <th className="border border-gray-300 px-2 py-1 text-xs">Normal</th>
                                <th className="border border-gray-300 px-2 py-1 text-xs">Current</th>
                            </tr>
                        </thead>
                        <tbody>
                            {['Borehole', 'Valley Tank / Dam', 'Protected Spring', 'Stream / River / Lake'].map((source, rowIndex) => (
                                <tr key={source}>
                                    <td className="border border-gray-300 px-4 py-2 font-medium">{source}</td>
                                    {['dist_normal', 'dist_curr', 'wait_normal', 'wait_curr', 'cost_normal', 'cost_curr'].map((field, colIndex) => (
                                        <td key={field} className="border border-gray-300 px-2 py-1">
                                            <input
                                                type="number"
                                                min="0" // Added min 0
                                                step="0.1"
                                                data-row={rowIndex}
                                                data-col={colIndex}
                                                className="w-full border-gray-200 rounded text-center"
                                                value={getVal('waterSources', `${source}_${field}`)}
                                                onChange={(e) => handleObjectChange('waterSources', `${source}_${field}`, e.target.value)}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LivestockSection;
