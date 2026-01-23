import React from 'react';
import useTableNavigation from '../hooks/useTableNavigation';
import TagInput from './TagInput';

const FisheriesSection = ({ formData, updateFormData }) => {
    // Navigation refs
    const table1Ref = useTableNavigation(); // Catch Data
    const table2Ref = useTableNavigation(); // Utilization
    const table3Ref = useTableNavigation(); // Aquaculture Harvest

    // Helper to safely get nested values or defaults
    const getVal = (field, key, defaultVal = '') => {
        return formData[field]?.[key] ?? defaultVal;
    };

    const handleObjectChange = (field, key, value) => {
        updateFormData(field, { ...formData[field], [key]: value });
    };

    return (
        <div className="space-y-8">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <h3 className="font-semibold text-blue-900 uppercase text-2xl">Section 3: Fisheries</h3>
                <p className="text-sm text-blue-800 mt-1">To be administered to District Fisheries Officer</p>
            </div>

            {/* 3.1 & 3.2 Basic Info */}
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        3.1 Proportion of households relying on fishing (%)
                    </label>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.fishingHouseholds}
                        onChange={(e) => updateFormData('fishingHouseholds', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="%"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        3.2 Change in # of fishing households (Last 6 months)
                    </label>
                    <div className="flex gap-2">
                        <select
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                            value={getVal('fishingActivityChange', 'trend')}
                            onChange={(e) => handleObjectChange('fishingActivityChange', 'trend', e.target.value)}
                        >
                            <option value="">Select Trend...</option>
                            <option value="increase">Increase</option>
                            <option value="decrease">Decrease</option>
                            <option value="constant">Constant</option>
                        </select>
                        <input
                            type="number"
                            min="0"
                            className="w-24 px-4 py-2 border border-gray-300 rounded-lg"
                            placeholder="%"
                            value={getVal('fishingActivityChange', 'percent')}
                            onChange={(e) => handleObjectChange('fishingActivityChange', 'percent', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* 3.3 Reason for Change */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    3.3 Major reason for the change
                </label>
                <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Reason..."
                    value={getVal('fishingActivityChange', 'reason')}
                    onChange={(e) => handleObjectChange('fishingActivityChange', 'reason', e.target.value)}
                />
            </div>

            {/* 3.4 Water Bodies */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    3.4 Are there water bodies in the district?
                </label>
                <div className="flex gap-4 items-center">
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="waterBodies"
                            value="yes"
                            checked={formData.waterBodies === 'yes'}
                            onChange={(e) => updateFormData('waterBodies', e.target.value)}
                            className="w-4 h-4"
                        />
                        <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="waterBodies"
                            value="no"
                            checked={formData.waterBodies === 'no'}
                            onChange={(e) => updateFormData('waterBodies', e.target.value)}
                            className="w-4 h-4"
                        />
                        <span>No</span>
                    </label>
                </div>
            </div>

            {formData.waterBodies === 'yes' && (
                <>
                    {/* 3.5 Fish Catch Data */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">3.5 Estimate of Total Monthly and Annual Catch (MT)</h4>
                        <div className="overflow-x-auto">
                            <table className="min-w-full border border-gray-300 text-sm" ref={table1Ref}>
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-300 px-4 py-2 text-left">Fish Species</th>
                                        <th className="border border-gray-300 px-4 py-2">Last Month (MT)</th>
                                        <th className="border border-gray-300 px-4 py-2">6 Months Ago (Monthly MT)</th>
                                        <th className="border border-gray-300 px-4 py-2">Last 12 Months (MT)</th>
                                        <th className="border border-gray-300 px-4 py-2">Previous 12 Months (MT)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {['Nile perch', 'Tilapia', 'Silver fish', 'Mud fish', 'Cat fish', 'Lung fish', 'Other'].map((species, rowIndex) => (
                                        <tr key={species}>
                                            <td className="border border-gray-300 px-4 py-2 font-medium">
                                                {species === 'Other' ? (
                                                    <input
                                                        type="text"
                                                        placeholder="Other (specify)"
                                                        data-row={rowIndex}
                                                        data-col={0}
                                                        className="w-full border-none p-0 focus:ring-0 text-sm font-medium"
                                                        value={getVal('fishCatch', 'other_name')}
                                                        onChange={(e) => handleObjectChange('fishCatch', 'other_name', e.target.value)}
                                                    />
                                                ) : species}
                                            </td>
                                            {['last_month', 'six_months_ago', 'last_year', 'prev_year'].map((period, colIndex) => (
                                                <td key={period} className="border border-gray-300 px-2 py-1">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.1"
                                                        data-row={rowIndex}
                                                        data-col={colIndex + 1}
                                                        className="w-full border-gray-200 rounded text-center"
                                                        value={getVal('fishCatch', `${species.toLowerCase().replace(' ', '_')}_${period}`)}
                                                        onChange={(e) => handleObjectChange('fishCatch', `${species.toLowerCase().replace(' ', '_')}_${period}`, e.target.value)}
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 3.6 Fish Utilization */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">3.6 Utilization of Fish Caught (%)</h4>
                        <div className="overflow-x-auto">
                            <table className="min-w-full border border-gray-300 text-sm" ref={table2Ref}>
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-300 px-4 py-2 text-left">Fish Species</th>
                                        <th className="border border-gray-300 px-4 py-2">% Consumed Locally</th>
                                        <th className="border border-gray-300 px-4 py-2">% Processed</th>
                                        <th className="border border-gray-300 px-4 py-2">% Sold Outside District</th>
                                        <th className="border border-gray-300 px-4 py-2">% Lost After Catch</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {['Nile perch', 'Tilapia', 'Silver fish', 'Mud fish', 'Cat fish', 'Lung fish', 'Other'].map((species, rowIndex) => (
                                        <tr key={species}>
                                            <td className="border border-gray-300 px-4 py-2 font-medium">
                                                {species === 'Other' ? (
                                                    <span className="text-gray-500">Other types</span>
                                                ) : species}
                                            </td>
                                            {['consumed', 'processed', 'sold_out', 'lost'].map((type, colIndex) => (
                                                <td key={type} className="border border-gray-300 px-2 py-1">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        data-row={rowIndex}
                                                        data-col={colIndex + 1}
                                                        className="w-full border-gray-200 rounded text-center"
                                                        value={getVal('fishUtilization', `${species.toLowerCase().replace(' ', '_')}_${type}`)}
                                                        onChange={(e) => handleObjectChange('fishUtilization', `${species.toLowerCase().replace(' ', '_')}_${type}`, e.target.value)}
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Aquaculture Section */}
            <div className="pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-blue-900 uppercase text-xl mb-4">Aquaculture</h3>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            3.7 Number of fish ponds in district
                        </label>
                        <input
                            type="number"
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            value={getVal('fishPonds', 'count')}
                            onChange={(e) => handleObjectChange('fishPonds', 'count', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Average pond size (acres)
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.1"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            value={getVal('fishPonds', 'avg_size')}
                            onChange={(e) => handleObjectChange('fishPonds', 'avg_size', e.target.value)}
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        3.8 Number of fully stocked ponds
                    </label>
                    <input
                        type="number"
                        min="0"
                        className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg"
                        value={formData.stockedPonds}
                        onChange={(e) => updateFormData('stockedPonds', e.target.value)}
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        3.9 List fish species stocked (Order of importance)
                    </label>
                    <TagInput
                        className="w-full"
                        placeholder="Type species and press Enter..."
                        value={getVal('fishSpecies', 'species_list', [])}
                        onChange={(tags) => handleObjectChange('fishSpecies', 'species_list', tags)}
                    />
                </div>

                <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-4">3.10 Fish Harvested in Last 30 Days</h4>
                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-300 text-sm" ref={table3Ref}>
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 px-4 py-2 text-left">Fish Species</th>
                                    <th className="border border-gray-300 px-4 py-2">Harvested (kg)</th>
                                    <th className="border border-gray-300 px-4 py-2">Consumed by farmers (kg)</th>
                                    <th className="border border-gray-300 px-4 py-2">Sold outside district (kg)</th>
                                    <th className="border border-gray-300 px-4 py-2">Processed (kg)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[1, 2, 3, 4].map((i, rowIndex) => (
                                    <tr key={i}>
                                        <td className="border border-gray-300 px-2 py-1">
                                            <input
                                                type="text"
                                                data-row={rowIndex}
                                                data-col={0}
                                                className="w-full border-gray-200 rounded"
                                                placeholder={`Species ${i}`}
                                                value={getVal('aquacultureHarvest', `species_${i}`)}
                                                onChange={(e) => handleObjectChange('aquacultureHarvest', `species_${i}`, e.target.value)}
                                            />
                                        </td>
                                        {['harvested', 'consumed', 'sold', 'processed'].map((field, colIndex) => (
                                            <td key={field} className="border border-gray-300 px-2 py-1">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    data-row={rowIndex}
                                                    data-col={colIndex + 1}
                                                    className="w-full border-gray-200 rounded text-center"
                                                    value={getVal('aquacultureHarvest', `${field}_${i}`)}
                                                    onChange={(e) => handleObjectChange('aquacultureHarvest', `${field}_${i}`, e.target.value)}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        3.11 Fish Farming Challenges
                    </label>
                    <TagInput
                        className="w-full"
                        placeholder="Type challenge and press Enter..."
                        value={Array.isArray(formData.fishingChallenges) ? formData.fishingChallenges : (formData.fishingChallenges ? [formData.fishingChallenges] : [])}
                        onChange={(tags) => updateFormData('fishingChallenges', tags)}
                    />
                </div>
            </div>
        </div>
    );
};

export default FisheriesSection;
