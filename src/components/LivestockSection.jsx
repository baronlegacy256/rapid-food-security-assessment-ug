import React from 'react';
import useTableNavigation from '../hooks/useTableNavigation';

const LivestockSection = ({ formData, updateFormData }) => {
    // Navigation refs
    const table21Ref = useTableNavigation(); // 2.1 Current condition
    const table22Ref = useTableNavigation(); // 2.2 Livestock numbers
    const table25Ref = useTableNavigation(); // 2.5 Outbreaks
    const table26Ref = useTableNavigation(); // 2.6 Interventions
    const table28Ref = useTableNavigation(); // 2.8 Milk
    const table29Ref = useTableNavigation(); // 2.9 Water sources

    // Helper to safely get nested values or defaults
    const getVal = (field, key, defaultVal = '') => {
        return formData[field]?.[key] ?? defaultVal;
    };

    const handleObjectChange = (field, key, value) => {
        updateFormData(field, prevObj => ({
            ...(prevObj || {}),
            [key]: value
        }));
    };

    const conditionRows = [
        'Water for livestock',
        'Pasture',
        'Cattle health condition',
        'Sheep and goats health condition',
        'Poultry health  condition'
    ];

    const livestockTypes = [
        'Cows',
        'Bulls',
        'Oxen (including steer)',
        'Sheep',
        'Goat',
        'Pigs',
        'Rabbits',
        'Poultry',
        'Donkeys',
        'Bees (No.of bee hives)',
        'Camels',
        'Other (specify)'
    ];

    const waterSourceTypes = [
        'Dam',
        'Valley tank',
        'Pond',
        'Well / spring',
        'River',
        'Stream',
        'Lake',
        'Borehole'
    ];

    const milkBreeds = [
        'Indigenous',
        'Exotic',
        'Cross'
    ];

    return (
        <div className="space-y-8">
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4">
                <h3 className="font-semibold text-orange-900 uppercase text-2xl">Section 2: Livestock Production</h3>
                <p className="text-sm text-orange-800 mt-1">To be administered to District Production Officers / District Veterinary Officers</p>
            </div>

            {/* 2.1 Current conditions */}
            <div>
                <h4 className="text-lg font-semibold mb-4">2.1 What is the current condition of the following compared to a normal year in the district?</h4>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 text-sm" ref={table21Ref}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2 text-left">Item</th>
                                <th className="border border-gray-300 px-4 py-2 text-center">Normal</th>
                                <th className="border border-gray-300 px-4 py-2 text-center">Worse than normal</th>
                                <th className="border border-gray-300 px-4 py-2 text-center">Better than normal</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Areas most affected (Sub-Counties)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {conditionRows.map((row, rowIndex) => (
                                <tr key={row}>
                                    <td className="border border-gray-300 px-4 py-2 font-medium">{row}</td>
                                    {['normal', 'worse', 'better'].map((type, colIndex) => (
                                        <td key={type} className="border border-gray-300 px-4 py-2 text-center">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4"
                                                checked={getVal('livestockConditions', `${row}_status`) === type}
                                                onChange={() => handleObjectChange('livestockConditions', `${row}_status`, type)}
                                                data-row={rowIndex}
                                                data-col={colIndex}
                                            />
                                        </td>
                                    ))}
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input
                                            type="text"
                                            className="w-full border-gray-200 rounded p-1"
                                            value={getVal('livestockConditions', `${row}_locations`)}
                                            onChange={(e) => handleObjectChange('livestockConditions', `${row}_locations`, e.target.value)}
                                            data-row={rowIndex}
                                            data-col={3}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 2.2 Estimated numbers */}
            <div>
                <h4 className="text-lg font-semibold mb-4">2.2 Indicate the estimated numbers of the following livestock if kept in your district</h4>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 text-sm" ref={table22Ref}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2 text-left">Type of livestock</th>
                                <th className="border border-gray-300 px-4 py-2 text-center">No. of animals currently</th>
                                <th className="border border-gray-300 px-4 py-2 text-center">No. of animals 6 months ago</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Main reason for change in number</th>
                            </tr>
                        </thead>
                        <tbody>
                            {livestockTypes.map((type, rowIndex) => (
                                <tr key={type}>
                                    <td className="border border-gray-300 px-4 py-2 font-medium">{type}</td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input
                                            type="number"
                                            className="w-full border-gray-200 rounded text-center"
                                            value={getVal('livestockNumbers', `${type}_current`)}
                                            onChange={(e) => handleObjectChange('livestockNumbers', `${type}_current`, e.target.value)}
                                            data-row={rowIndex}
                                            data-col={0}
                                        />
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input
                                            type="number"
                                            className="w-full border-gray-200 rounded text-center"
                                            value={getVal('livestockNumbers', `${type}_previously`)}
                                            onChange={(e) => handleObjectChange('livestockNumbers', `${type}_previously`, e.target.value)}
                                            data-row={rowIndex}
                                            data-col={1}
                                        />
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input
                                            type="text"
                                            className="w-full border-gray-200 rounded"
                                            value={getVal('livestockNumbers', `${type}_reason`)}
                                            onChange={(e) => handleObjectChange('livestockNumbers', `${type}_reason`, e.target.value)}
                                            data-row={rowIndex}
                                            data-col={2}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 2.3 Migration */}
            <div className="space-y-6">
                <h4 className="text-lg font-semibold mb-4 text-orange-900 border-b border-orange-200 pb-2 flex items-center gap-2">
                    <span className="bg-orange-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs">2.3</span>
                    Livestock Migration (Last 6 Months)
                </h4>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* IN DISTRICT */}
                    <div className="space-y-4">
                        <div className="bg-white border-2 border-orange-100 rounded-xl p-4 shadow-sm">
                            <span className="font-bold text-gray-800 block mb-3 uppercase text-xs tracking-wider">Migration INTO the district</span>
                            <div className="flex gap-6 mb-4">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="radio" name="migration_in" className="w-4 h-4 text-orange-600 focus:ring-orange-500" checked={getVal('livestockMigration', 'in_status') === 'Yes'} onChange={() => handleObjectChange('livestockMigration', 'in_status', 'Yes')} />
                                    <span className="text-sm font-medium group-hover:text-orange-600 transition-colors">Yes</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="radio" name="migration_in" className="w-4 h-4 text-orange-600 focus:ring-orange-500" checked={getVal('livestockMigration', 'in_status') === 'No'} onChange={() => handleObjectChange('livestockMigration', 'in_status', 'No')} />
                                    <span className="text-sm font-medium group-hover:text-orange-600 transition-colors">No</span>
                                </label>
                            </div>

                            {/* Conditional logic for INTO */}
                            {getVal('livestockMigration', 'in_status') === 'Yes' && (
                                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                                    <p className="text-[10px] font-bold text-orange-600 uppercase">Details for Migration In:</p>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500">Reason for migration in:</label>
                                        <input type="text" className="w-full border-gray-200 rounded text-sm mt-1 focus:border-orange-500 focus:ring-orange-500" value={getVal('livestockMigration', 'in_reason_yes')} onChange={(e) => handleObjectChange('livestockMigration', 'in_reason_yes', e.target.value)} placeholder="Reason..." />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500">Where from? (Origin):</label>
                                        <input type="text" className="w-full border-gray-200 rounded text-sm mt-1 focus:border-orange-500 focus:ring-orange-500" value={getVal('livestockMigration', 'in_origin')} onChange={(e) => handleObjectChange('livestockMigration', 'in_origin', e.target.value)} placeholder="Origin district/country..." />
                                    </div>
                                </div>
                            )}
                            {getVal('livestockMigration', 'in_status') === 'No' && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <label className="text-xs font-medium text-gray-500 italic">Reason for NO migration in:</label>
                                    <input type="text" className="w-full border-gray-200 rounded text-sm mt-1 focus:border-orange-500 focus:ring-orange-500" value={getVal('livestockMigration', 'in_reason_no')} onChange={(e) => handleObjectChange('livestockMigration', 'in_reason_no', e.target.value)} placeholder="Reason for no movement..." />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* OUT DISTRICT */}
                    <div className="space-y-4">
                        <div className="bg-white border-2 border-orange-100 rounded-xl p-4 shadow-sm">
                            <span className="font-bold text-gray-800 block mb-3 uppercase text-xs tracking-wider">Migration OUT of the district</span>
                            <div className="flex gap-6 mb-4">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="radio" name="migration_out" className="w-4 h-4 text-orange-600 focus:ring-orange-500" checked={getVal('livestockMigration', 'out_status') === 'Yes'} onChange={() => handleObjectChange('livestockMigration', 'out_status', 'Yes')} />
                                    <span className="text-sm font-medium group-hover:text-orange-600 transition-colors">Yes</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="radio" name="migration_out" className="w-4 h-4 text-orange-600 focus:ring-orange-500" checked={getVal('livestockMigration', 'out_status') === 'No'} onChange={() => handleObjectChange('livestockMigration', 'out_status', 'No')} />
                                    <span className="text-sm font-medium group-hover:text-orange-600 transition-colors">No</span>
                                </label>
                            </div>

                            {/* Conditional logic for OUT */}
                            {getVal('livestockMigration', 'out_status') === 'Yes' && (
                                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                                    <p className="text-[10px] font-bold text-orange-600 uppercase">Details for Migration Out:</p>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500">Reason for migration out:</label>
                                        <input type="text" className="w-full border-gray-200 rounded text-sm mt-1 focus:border-orange-500 focus:ring-orange-500" value={getVal('livestockMigration', 'out_reason_yes')} onChange={(e) => handleObjectChange('livestockMigration', 'out_reason_yes', e.target.value)} placeholder="Reason..." />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500">Where to? (Destination):</label>
                                        <input type="text" className="w-full border-gray-200 rounded text-sm mt-1 focus:border-orange-500 focus:ring-orange-500" value={getVal('livestockMigration', 'out_destination')} onChange={(e) => handleObjectChange('livestockMigration', 'out_destination', e.target.value)} placeholder="Destination district/country..." />
                                    </div>
                                </div>
                            )}
                            {getVal('livestockMigration', 'out_status') === 'No' && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <label className="text-xs font-medium text-gray-500 italic">Reason for NO migration out:</label>
                                    <input type="text" className="w-full border-gray-200 rounded text-sm mt-1 focus:border-orange-500 focus:ring-orange-500" value={getVal('livestockMigration', 'out_reason_no')} onChange={(e) => handleObjectChange('livestockMigration', 'out_reason_no', e.target.value)} placeholder="Reason for no movement..." />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2.4 Market Conditions */}
            <div>
                <h4 className="text-lg font-semibold mb-4">2.4 Livestock market conditions (market observation)</h4>
                <div className="space-y-4 bg-gray-50 p-4 border border-gray-200 rounded">
                    <div>
                        <label className="block text-sm font-medium">Market location:</label>
                        <input
                            type="text"
                            className="w-full border-gray-300 rounded mt-1"
                            value={getVal('livestockMarketConditions', 'location')}
                            onChange={(e) => handleObjectChange('livestockMarketConditions', 'location', e.target.value)}
                        />
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                        <p className="text-sm font-bold text-gray-700 mb-4 uppercase">Current situation compared to last year</p>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Average Number of animals being offered for sale every week:</label>
                                <input
                                    type="text"
                                    className="w-full border-gray-300 rounded mt-1"
                                    value={getVal('livestockMarketConditions', 'weekly_numbers')}
                                    onChange={(e) => handleObjectChange('livestockMarketConditions', 'weekly_numbers', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Health conditions of animals brought for sale:</label>
                                <input
                                    type="text"
                                    placeholder="Healthier or less than usual at this season?"
                                    className="w-full border-gray-300 rounded mt-1 placeholder:text-gray-400 placeholder:italic"
                                    value={getVal('livestockMarketConditions', 'health_status')}
                                    onChange={(e) => handleObjectChange('livestockMarketConditions', 'health_status', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Types and sex of animal on sale:</label>
                            <textarea
                                rows="2"
                                placeholder="More or fewer young animal, steers or bulls, dry/ milking animals, more/fewer female animals/more/fewer drought oxen?"
                                className="w-full border-gray-300 rounded mt-1 placeholder:text-gray-400 placeholder:italic text-sm"
                                value={getVal('livestockMarketConditions', 'types_on_sale')}
                                onChange={(e) => handleObjectChange('livestockMarketConditions', 'types_on_sale', e.target.value)}
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Exchange for main staple cereal (kg per healthy animal):</label>
                                <input
                                    type="text"
                                    className="w-full border-gray-300 rounded mt-1"
                                    value={getVal('livestockMarketConditions', 'exchange_value')}
                                    onChange={(e) => handleObjectChange('livestockMarketConditions', 'exchange_value', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Reasons why sellers bring animals to the market:</label>
                                <input
                                    type="text"
                                    className="w-full border-gray-300 rounded mt-1"
                                    value={getVal('livestockMarketConditions', 'sale_reasons')}
                                    onChange={(e) => handleObjectChange('livestockMarketConditions', 'sale_reasons', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="bg-white p-3 border border-gray-200 rounded mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Are number of traders and buyers/week increasing/decreasing/constant?</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 uppercase font-bold">Traders</label>
                                    <select
                                        className="w-full border-gray-300 rounded mt-1 text-sm text-gray-700"
                                        value={getVal('livestockMarketConditions', 'traders_trend')}
                                        onChange={(e) => handleObjectChange('livestockMarketConditions', 'traders_trend', e.target.value)}
                                    >
                                        <option value="">Select...</option>
                                        <option value="Increasing">Increasing</option>
                                        <option value="Decreasing">Decreasing</option>
                                        <option value="Constant">Constant</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 uppercase font-bold">Buyers</label>
                                    <select
                                        className="w-full border-gray-300 rounded mt-1 text-sm text-gray-700"
                                        value={getVal('livestockMarketConditions', 'buyers_trend')}
                                        onChange={(e) => handleObjectChange('livestockMarketConditions', 'buyers_trend', e.target.value)}
                                    >
                                        <option value="">Select...</option>
                                        <option value="Increasing">Increasing</option>
                                        <option value="Decreasing">Decreasing</option>
                                        <option value="Constant">Constant</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">How are prices and numbers expected to change in the coming months?</label>
                            <textarea
                                rows="2"
                                className="w-full border-gray-300 rounded mt-1 text-sm"
                                value={getVal('livestockMarketConditions', 'expectations')}
                                onChange={(e) => handleObjectChange('livestockMarketConditions', 'expectations', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* 2.5 Outbreaks */}
            <div>
                <div className="flex items-center gap-4 mb-4">
                    <h4 className="text-lg font-semibold">2.5 Have there been any livestock and/or poultry disease outbreaks in the last six months?</h4>
                    <label className="flex items-center gap-1">
                        <input type="radio" checked={getVal('livestockOutbreaks', 'any') === 'Yes'} onChange={() => handleObjectChange('livestockOutbreaks', 'any', 'Yes')} /> Yes
                    </label>
                    <label className="flex items-center gap-1">
                        <input type="radio" checked={getVal('livestockOutbreaks', 'any') === 'No'} onChange={() => handleObjectChange('livestockOutbreaks', 'any', 'No')} /> No
                    </label>
                </div>
                {getVal('livestockOutbreaks', 'any') === 'Yes' && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-300 text-sm" ref={table25Ref}>
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 px-4 py-2 text-left">Type of livestock affected</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Name of Pest/ disease</th>
                                    <th className="border border-gray-300 px-4 py-2 text-center">Deaths? (Yes/No)</th>
                                    <th className="border border-gray-300 px-4 py-2 text-center">No. of deaths reported</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[1, 2, 3, 4].map((i, rowIndex) => (
                                    <tr key={i}>
                                        <td className="border border-gray-300 px-2 py-1">
                                            <input type="text" className="w-full border-gray-200 rounded" value={getVal('livestockOutbreaks', `type_${i}`)} onChange={(e) => handleObjectChange('livestockOutbreaks', `type_${i}`, e.target.value)} data-row={rowIndex} data-col={0} />
                                        </td>
                                        <td className="border border-gray-300 px-2 py-1">
                                            <input type="text" className="w-full border-gray-200 rounded" value={getVal('livestockOutbreaks', `disease_${i}`)} onChange={(e) => handleObjectChange('livestockOutbreaks', `disease_${i}`, e.target.value)} data-row={rowIndex} data-col={1} />
                                        </td>
                                        <td className="border border-gray-300 px-2 py-1 text-center">
                                            <select className="border border-gray-200 rounded text-xs" value={getVal('livestockOutbreaks', `deaths_any_${i}`)} onChange={(e) => handleObjectChange('livestockOutbreaks', `deaths_any_${i}`, e.target.value)} data-row={rowIndex} data-col={2}>
                                                <option value="">Select...</option>
                                                <option value="Yes">Yes</option>
                                                <option value="No">No</option>
                                            </select>
                                        </td>
                                        <td className="border border-gray-300 px-2 py-1">
                                            <input type="number" className="w-full border-gray-200 rounded text-center" value={getVal('livestockOutbreaks', `death_count_${i}`)} onChange={(e) => handleObjectChange('livestockOutbreaks', `death_count_${i}`, e.target.value)} data-row={rowIndex} data-col={3} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* 2.6 Interventions */}
            <div>
                <div className="flex items-center gap-4 mb-4">
                    <h4 className="text-lg font-semibold">2.6 Has there been any intervention (vaccinations, quarantine…etc) to counter the threat?</h4>
                    <label className="flex items-center gap-1">
                        <input type="radio" checked={getVal('livestockInterventions', 'any') === 'Yes'} onChange={() => handleObjectChange('livestockInterventions', 'any', 'Yes')} /> Yes
                    </label>
                    <label className="flex items-center gap-1">
                        <input type="radio" checked={getVal('livestockInterventions', 'any') === 'No'} onChange={() => handleObjectChange('livestockInterventions', 'any', 'No')} /> No
                    </label>
                </div>
                {getVal('livestockInterventions', 'any') === 'Yes' && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-300 text-sm" ref={table26Ref}>
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 px-4 py-2 text-left">Livestock</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Intervention</th>
                                    <th className="border border-gray-300 px-4 py-2 text-center">Number of livestock affected</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[1, 2, 3, 4].map((i, rowIndex) => (
                                    <tr key={i}>
                                        <td className="border border-gray-300 px-2 py-1">
                                            <input type="text" className="w-full border-gray-200 rounded" value={getVal('livestockInterventions', `type_${i}`)} onChange={(e) => handleObjectChange('livestockInterventions', `type_${i}`, e.target.value)} data-row={rowIndex} data-col={0} />
                                        </td>
                                        <td className="border border-gray-300 px-2 py-1">
                                            <input type="text" className="w-full border-gray-200 rounded" value={getVal('livestockInterventions', `intervention_${i}`)} onChange={(e) => handleObjectChange('livestockInterventions', `intervention_${i}`, e.target.value)} data-row={rowIndex} data-col={1} />
                                        </td>
                                        <td className="border border-gray-300 px-2 py-1">
                                            <input type="number" className="w-full border-gray-200 rounded text-center" value={getVal('livestockInterventions', `count_${i}`)} onChange={(e) => handleObjectChange('livestockInterventions', `count_${i}`, e.target.value)} data-row={rowIndex} data-col={2} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* 2.7 Drugs */}
            <div>
                <div className="flex items-center gap-4 mb-4">
                    <h4 className="text-lg font-semibold">2.7 Are livestock drugs available at the nearest local market/ farm supply shop?</h4>
                    <label className="flex items-center gap-1">
                        <input type="radio" checked={getVal('drugAvailability', 'status') === 'Yes'} onChange={() => handleObjectChange('drugAvailability', 'status', 'Yes')} /> Yes
                    </label>
                    <label className="flex items-center gap-1">
                        <input type="radio" checked={getVal('drugAvailability', 'status') === 'No'} onChange={() => handleObjectChange('drugAvailability', 'status', 'No')} /> No
                    </label>
                </div>
                {getVal('drugAvailability', 'status') === 'No' && (
                    <div>
                        <label className="block text-sm font-medium">If no, why?</label>
                        <input type="text" className="w-full border-gray-300 rounded mt-1" value={getVal('drugAvailability', 'reason')} onChange={(e) => handleObjectChange('drugAvailability', 'reason', e.target.value)} />
                    </div>
                )}
            </div>

            {/* 2.8 Milk Production */}
            <div>
                <h4 className="text-lg font-semibold mb-4">2.8 How is the Cattle milk production quantities this year compared to a normal year?</h4>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 text-sm" ref={table28Ref}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2 text-left">Type of breed</th>
                                <th className="border border-gray-300 px-4 py-2 text-center">Normal qty/animal (litres)</th>
                                <th className="border border-gray-300 px-4 py-2 text-center">Current quantity/animal (litres)</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Status (Worse, Normal, Better)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {milkBreeds.map((breed, rowIndex) => (
                                <tr key={breed}>
                                    <td className="border border-gray-300 px-4 py-2 font-medium">{breed}</td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input type="number" step="0.1" className="w-full border-gray-200 rounded text-center" value={getVal('milkProduction', `${breed}_normal`)} onChange={(e) => handleObjectChange('milkProduction', `${breed}_normal`, e.target.value)} data-row={rowIndex} data-col={0} />
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input type="number" step="0.1" className="w-full border-gray-200 rounded text-center" value={getVal('milkProduction', `${breed}_current`)} onChange={(e) => handleObjectChange('milkProduction', `${breed}_current`, e.target.value)} data-row={rowIndex} data-col={1} />
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <select className="w-full border-gray-200 rounded" value={getVal('milkProduction', `${breed}_status`)} onChange={(e) => handleObjectChange('milkProduction', `${breed}_status`, e.target.value)} data-row={rowIndex} data-col={2}>
                                            <option value="">Select...</option>
                                            <option value="Normal">Normal</option>
                                            <option value="Worse than normal">Worse than normal</option>
                                            <option value="Better than normal">Better than normal</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 2.9 Water Sources */}
            <div>
                <h4 className="text-lg font-semibold mb-4">2.9 What are the available water sources for livestock and what is their current condition compared to 6 months ago?</h4>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 text-[10px]" ref={table29Ref}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-2 py-1 text-left" rowSpan="2">Water Source type</th>
                                <th className="border border-gray-300 px-2 py-1 text-center" colSpan="2">Number Accessible</th>
                                <th className="border border-gray-300 px-2 py-1 text-center" colSpan="2">Condition (1,2,3)</th>
                                <th className="border border-gray-300 px-2 py-1 text-center" colSpan="2">Quality (1,2,3)</th>
                                <th className="border border-gray-300 px-2 py-1 text-center" rowSpan="2">Avg distance (km)</th>
                            </tr>
                            <tr className="bg-gray-50 text-[9px]">
                                <th className="border border-gray-300 text-center">Now</th>
                                <th className="border border-gray-300 text-center">6m ago</th>
                                <th className="border border-gray-300 text-center">Now</th>
                                <th className="border border-gray-300 text-center">6m ago</th>
                                <th className="border border-gray-300 text-center">Now</th>
                                <th className="border border-gray-300 text-center">6m ago</th>
                            </tr>
                        </thead>
                        <tbody>
                            {waterSourceTypes.map((source, rowIndex) => (
                                <tr key={source}>
                                    <td className="border border-gray-300 px-2 py-1 font-medium bg-gray-50">{source}</td>
                                    <td className="border border-gray-300 px-1 py-1">
                                        <input type="number" className="w-full border-gray-100 rounded text-center p-0.5" value={getVal('waterSources', `${source}_count_now`)} onChange={(e) => handleObjectChange('waterSources', `${source}_count_now`, e.target.value)} data-row={rowIndex} data-col={0} />
                                    </td>
                                    <td className="border border-gray-300 px-1 py-1">
                                        <input type="number" className="w-full border-gray-100 rounded text-center p-0.5" value={getVal('waterSources', `${source}_count_then`)} onChange={(e) => handleObjectChange('waterSources', `${source}_count_then`, e.target.value)} data-row={rowIndex} data-col={1} />
                                    </td>
                                    <td className="border border-gray-300 px-1 py-1">
                                        <input type="number" className="w-full border-gray-100 rounded text-center p-0.5" value={getVal('waterSources', `${source}_cond_now`)} onChange={(e) => handleObjectChange('waterSources', `${source}_cond_now`, e.target.value)} data-row={rowIndex} data-col={2} />
                                    </td>
                                    <td className="border border-gray-300 px-1 py-1">
                                        <input type="number" className="w-full border-gray-100 rounded text-center p-0.5" value={getVal('waterSources', `${source}_cond_then`)} onChange={(e) => handleObjectChange('waterSources', `${source}_cond_then`, e.target.value)} data-row={rowIndex} data-col={3} />
                                    </td>
                                    <td className="border border-gray-300 px-1 py-1">
                                        <input type="number" className="w-full border-gray-100 rounded text-center p-0.5" value={getVal('waterSources', `${source}_qual_now`)} onChange={(e) => handleObjectChange('waterSources', `${source}_qual_now`, e.target.value)} data-row={rowIndex} data-col={4} />
                                    </td>
                                    <td className="border border-gray-300 px-1 py-1">
                                        <input type="number" className="w-full border-gray-100 rounded text-center p-0.5" value={getVal('waterSources', `${source}_qual_then`)} onChange={(e) => handleObjectChange('waterSources', `${source}_qual_then`, e.target.value)} data-row={rowIndex} data-col={5} />
                                    </td>
                                    <td className="border border-gray-300 px-1 py-1">
                                        <input type="number" step="0.1" className="w-full border-gray-100 rounded text-center p-0.5" value={getVal('waterSources', `${source}_distance`)} onChange={(e) => handleObjectChange('waterSources', `${source}_distance`, e.target.value)} data-row={rowIndex} data-col={6} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="text-[9px] text-gray-500 mt-2 italic">
                    Condition: 1=Functional, 2=Functional w/ faults, 3=Non functional | Quality: 1=Good, 2=Fair, 3=Bad
                </p>
            </div>
        </div>
    );
};

export default LivestockSection;
