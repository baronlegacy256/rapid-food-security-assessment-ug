import React from 'react';
import useTableNavigation from '../hooks/useTableNavigation';

const CropSection = ({ formData, updateFormData }) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Navigation refs for tables
    const table1Ref = useTableNavigation();
    const table2Ref = useTableNavigation();
    const table3Ref = useTableNavigation();
    const table4Ref = useTableNavigation();
    const table5Ref = useTableNavigation();
    const table6Ref = useTableNavigation(); // Yields
    const table7Ref = useTableNavigation(); // Utilization
    const table8Ref = useTableNavigation(); // Stocks
    const table9Ref = useTableNavigation(); // Staple
    const table10Ref = useTableNavigation(); // SC Ranking
    const table11Ref = useTableNavigation(); // Parishes
    const table12Ref = useTableNavigation(); // Security
    const table13Ref = useTableNavigation(); // Outbreaks

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

    return (
        <div className="space-y-8">
            <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <h3 className="font-semibold text-green-900 uppercase text-2xl">Section 1: Crop Production Data</h3>
                <p className="text-sm text-green-800 mt-1">To be administered to District Production Officers / District Agriculture Officers</p>
            </div>

            {/* 1.1 Agricultural Calendar - Normal Year events */}
            <div>
                <h4 className="text-lg font-semibold mb-4">1.1 Please indicate when the following happen in your district/ sub county in a normal year</h4>
                <p className="text-sm text-gray-600 mb-3">Tick when events occur in a normal year</p>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 text-sm" ref={table1Ref}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2 text-left">Event</th>
                                {months.map(month => (
                                    <th key={month} className="border border-gray-300 px-2 py-2 text-center text-xs">{month}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {['1st rains', '2nd rains', 'Bush clearing', 'Opening fields', 'Planting', 'Weeding', 'Harvesting'].map((event, rowIndex) => (
                                <tr key={event}>
                                    <td className="border border-gray-300 px-4 py-2 font-medium">{event}</td>
                                    {months.map((month, colIndex) => (
                                        <td key={month} className="border border-gray-300 px-2 py-2 text-center">
                                            <input
                                                type="checkbox"
                                                data-row={rowIndex}
                                                data-col={colIndex}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                                checked={getVal('normalYearEvents', `${event}-${month}`, false)}
                                                onChange={(e) => handleObjectChange('normalYearEvents', `${event}-${month}`, e.target.checked)}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 1.2 Agricultural Calendar - Last Season events */}
            <div>
                <h4 className="text-lg font-semibold mb-4">1.2 Please indicate when the following happened in your district/ sub county last season</h4>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 text-sm" ref={table2Ref}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2 text-left">Event</th>
                                {months.map(month => (
                                    <th key={month} className="border border-gray-300 px-2 py-2 text-center text-xs">{month}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {['1st rains', '2nd rains', 'Bush clearing', 'Opening fields', 'Planting', 'Weeding', 'Harvesting'].map((event, rowIndex) => (
                                <tr key={event}>
                                    <td className="border border-gray-300 px-4 py-2 font-medium">{event}</td>
                                    {months.map((month, colIndex) => (
                                        <td key={month} className="border border-gray-300 px-2 py-2 text-center">
                                            <input
                                                type="checkbox"
                                                data-row={rowIndex}
                                                data-col={colIndex}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                                checked={getVal('lastSeasonEvents', `${event}-${month}`, false)}
                                                onChange={(e) => handleObjectChange('lastSeasonEvents', `${event}-${month}`, e.target.checked)}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 1.3 Normal Year Levels */}
            <div>
                <h4 className="text-lg font-semibold mb-4">1.3 Please indicate the level of the following for each month of the year in a normal year</h4>
                <p className="text-sm text-gray-600 mb-3">Options: Rainfall (High, Avg, Low, None), Temp (High, Mild, Low), Food (Good, Avg, Low, Zero), Price (High, Low)</p>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 text-sm" ref={table3Ref}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2 text-left">Event</th>
                                {months.map(month => (
                                    <th key={month} className="border border-gray-300 px-2 py-2 text-center text-xs">{month}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {['Rain Fall levels', 'Temperature levels', 'Food Stock Levels', 'Overall Prices of Staple Foods'].map((event, rowIndex) => (
                                <tr key={event}>
                                    <td className="border border-gray-300 px-4 py-2 font-medium">{event}</td>
                                    {months.map((month, colIndex) => (
                                        <td key={month} className="border border-gray-300 px-2 py-2 text-center">
                                            <select
                                                data-row={rowIndex}
                                                data-col={colIndex}
                                                className="w-full min-w-[60px] p-1 border rounded text-xs"
                                                value={getVal('normalYearLevels', `${event}-${month}`)}
                                                onChange={(e) => handleObjectChange('normalYearLevels', `${event}-${month}`, e.target.value)}
                                            >
                                                <option value=""></option>
                                                <option value="high">High</option>
                                                <option value="avg">Avg</option>
                                                <option value="low">Low</option>
                                                <option value="none">None</option>
                                                <option value="mild">Mild</option>
                                                <option value="good">Good</option>
                                                <option value="zero">Zero</option>
                                            </select>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 1.4 Current Year Levels */}
            <div>
                <h4 className="text-lg font-semibold mb-4">1.4 Please indicate the level of the following in the current year</h4>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 text-sm" ref={table4Ref}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2 text-left">Event</th>
                                {months.map(month => (
                                    <th key={month} className="border border-gray-300 px-2 py-2 text-center text-xs">{month}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {['Rain Fall levels', 'Temperature levels', 'Food Stock Levels', 'Overall Prices of Staple Foods'].map((event, rowIndex) => (
                                <tr key={event}>
                                    <td className="border border-gray-300 px-4 py-2 font-medium">{event}</td>
                                    {months.map((month, colIndex) => (
                                        <td key={month} className="border border-gray-300 px-2 py-2 text-center">
                                            <select
                                                data-row={rowIndex}
                                                data-col={colIndex}
                                                className="w-full min-w-[60px] p-1 border rounded text-xs"
                                                value={getVal('currentYearLevels', `${event}-${month}`)}
                                                onChange={(e) => handleObjectChange('currentYearLevels', `${event}-${month}`, e.target.value)}
                                            >
                                                <option value=""></option>
                                                <option value="high">High</option>
                                                <option value="avg">Avg</option>
                                                <option value="low">Low</option>
                                                <option value="none">None</option>
                                                <option value="mild">Mild</option>
                                                <option value="good">Good</option>
                                                <option value="zero">Zero</option>
                                            </select>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 1.5 Crop Performance */}
            <div>
                <h4 className="text-lg font-semibold mb-4">1.5 Crop Performance/Yields 2023/2024</h4>
                <p className="text-sm text-gray-600 mb-3">Codes: 1=Yes, 2=No, 3=N/A. (A=Season A, B=Season B)</p>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 text-sm" ref={table5Ref}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2 text-left" rowSpan="2">Crop</th>
                                <th colSpan="2" className="border border-gray-300 text-center">Failure (&lt;40%)</th>
                                <th colSpan="2" className="border border-gray-300 text-center">Average (50-60%)</th>
                                <th colSpan="2" className="border border-gray-300 text-center">Normal (70-100%)</th>
                                <th colSpan="2" className="border border-gray-300 text-center">Better (&gt;100%)</th>
                            </tr>
                            <tr className="bg-gray-50">
                                {['2024', '2025', '2024', '2025', '2024', '2025', '2024', '2025'].map((yr, i) => (
                                    <th key={i} className="border border-gray-300 px-2 py-1 text-center text-xs">
                                        {yr} ({i % 2 === 0 ? 'A' : 'B'})
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4].map((i, rowIndex) => (
                                <tr key={i}>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input
                                            type="text"
                                            data-row={rowIndex}
                                            data-col={0} // Start index at 0
                                            placeholder={`Crop ${i}`}
                                            className="w-full border-none focus:ring-0 text-sm"
                                            value={getVal('cropPerformance', `crop_name_${i}`)}
                                            onChange={(e) => handleObjectChange('cropPerformance', `crop_name_${i}`, e.target.value)}
                                        />
                                    </td>
                                    {[...Array(8)].map((_, idx) => (
                                        <td key={idx} className="border border-gray-300 px-1 py-1">
                                            <input
                                                type="text"
                                                maxLength="1"
                                                data-row={rowIndex}
                                                data-col={idx + 1} // Shifted by 1 (Crop Input)
                                                className="w-full text-center border rounded p-1 text-xs"
                                                value={getVal('cropPerformance', `val_${i}_${idx}`)}
                                                onChange={(e) => handleObjectChange('cropPerformance', `val_${i}_${idx}`, e.target.value)}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 1.6 Average Land Size */}
            <div>
                <h4 className="text-lg font-semibold mb-4">1.6 Average Land Size per Household (acres)</h4>
                <div className="grid md:grid-cols-2 gap-4">
                    {['Very poor', 'Poor', 'Middle income', 'Better off / rich'].map((group, idx) => (
                        <div key={group}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{group}</label>
                            <input
                                type="number"
                                min="0" // Added min 0
                                step="0.1"
                                value={getVal('landSizeByHousehold', group)}
                                onChange={(e) => handleObjectChange('landSizeByHousehold', group, e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Acres"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* 1.7 Crop Yields (NEW) */}
            <div>
                <h4 className="text-lg font-semibold mb-4">1.7 Realized Yield (MT) per unit area</h4>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 text-sm" ref={table6Ref}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2 text-left" rowSpan="2">Crop</th>
                                <th className="border border-gray-300 px-4 py-2 text-center" colSpan="2">2024 (MT)</th>
                                <th className="border border-gray-300 px-4 py-2 text-center" colSpan="2">2025 (MT)</th>
                            </tr>
                            <tr className="bg-gray-50">
                                <th className="border border-gray-300 px-2 py-1 text-center font-normal">Season A</th>
                                <th className="border border-gray-300 px-2 py-1 text-center font-normal">Season B</th>
                                <th className="border border-gray-300 px-2 py-1 text-center font-normal">Season A</th>
                                <th className="border border-gray-300 px-2 py-1 text-center font-normal">Season B</th>
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
                                            placeholder={`Crop ${i}`}
                                            className="w-full border-gray-200 rounded text-sm"
                                            value={getVal('cropYields', `crop_${i}`)}
                                            onChange={(e) => handleObjectChange('cropYields', `crop_${i}`, e.target.value)}
                                        />
                                    </td>
                                    {['2024A', '2024B', '2025A', '2025B'].map((s, colIndex) => (
                                        <td key={s} className="border border-gray-300 px-2 py-1">
                                            <input
                                                type="number"
                                                min="0" // Added min 0
                                                step="0.1"
                                                data-row={rowIndex}
                                                data-col={colIndex + 1}
                                                className="w-full border-gray-200 rounded text-sm"
                                                placeholder="MT"
                                                value={getVal('cropYields', `val_${i}_${s}`)}
                                                onChange={(e) => handleObjectChange('cropYields', `val_${i}_${s}`, e.target.value)}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 1.8 Crop Utilization (NEW) */}
            <div>
                <h4 className="text-lg font-semibold mb-4">1.8 Crop Utilization Estimates (%)</h4>
                <p className="text-sm text-gray-600 mb-2">Total utilization must equal 100% per crop</p>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 text-sm" ref={table7Ref}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-3 py-2 text-left">Crop</th>
                                <th className="border border-gray-300 px-2 py-2">% Consumed (HH)</th>
                                <th className="border border-gray-300 px-2 py-2">% Sold (District)</th>
                                <th className="border border-gray-300 px-2 py-2">% Sold (Outside)</th>
                                <th className="border border-gray-300 px-2 py-2">% Animal Feed</th>
                                <th className="border border-gray-300 px-2 py-2">% Lost</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5].map((i, rowIndex) => (
                                <tr key={i}>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input
                                            type="text"
                                            data-row={rowIndex}
                                            data-col={0}
                                            className="w-full border-gray-200 rounded text-sm"
                                            placeholder={`Crop ${i}`}
                                            value={getVal('cropUtilization', `crop_${i}`)}
                                            onChange={(e) => handleObjectChange('cropUtilization', `crop_${i}`, e.target.value)}
                                        />
                                    </td>
                                    {['consumed', 'sold_in', 'sold_out', 'feed', 'lost'].map((field, colIndex) => (
                                        <td key={field} className="border border-gray-300 px-2 py-1">
                                            <input
                                                type="number"
                                                min="0" // Added min 0
                                                max="100"
                                                data-row={rowIndex}
                                                data-col={colIndex + 1}
                                                className="w-full border-gray-200 rounded text-sm text-center"
                                                value={getVal('cropUtilization', `${field}_${i}`)}
                                                onChange={(e) => handleObjectChange('cropUtilization', `${field}_${i}`, e.target.value)}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 1.9 Food Stocks (NEW) */}
            <div>
                <h4 className="text-lg font-semibold mb-4">1.9 Food Stocks Available per Household</h4>
                <div className="overflow-x-auto mb-4">
                    <table className="min-w-full border border-gray-300 text-sm" ref={table8Ref}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2 text-left">Food Crop</th>
                                <th className="border border-gray-300 px-4 py-2">Avg Amount (kg)</th>
                                <th className="border border-gray-300 px-4 py-2">Days to Last</th>
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
                                            placeholder="Crop Name"
                                            className="w-full border-gray-200 rounded"
                                            value={getVal('foodStocks', `crop_${i}`)}
                                            onChange={(e) => handleObjectChange('foodStocks', `crop_${i}`, e.target.value)}
                                        />
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input
                                            type="number"
                                            min="0" // Added min 0
                                            data-row={rowIndex}
                                            data-col={1}
                                            className="w-full border-gray-200 rounded"
                                            value={getVal('foodStocks', `kg_${i}`)}
                                            onChange={(e) => handleObjectChange('foodStocks', `kg_${i}`, e.target.value)}
                                        />
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input
                                            type="number"
                                            min="0" // Added min 0
                                            data-row={rowIndex}
                                            data-col={2}
                                            className="w-full border-gray-200 rounded"
                                            value={getVal('foodStocks', `days_${i}`)}
                                            onChange={(e) => handleObjectChange('foodStocks', `days_${i}`, e.target.value)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 1.10 Staple Availability (NEW) */}
            <div>
                <h4 className="text-lg font-semibold mb-4">1.10 Staple Food Availability</h4>
                <p className="text-sm text-gray-600 mb-2">
                    Availability: 0=Not avail, 1=Scarce, 2=Moderate, 3=Abundant<br />
                    Source: 1=Own, 2=Market, 3=Borrow, 4=Friends, 5=Exchange, 6=Relief
                </p>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 text-sm" ref={table9Ref}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2">Food Item</th>
                                <th className="border border-gray-300 px-4 py-2">Availability code</th>
                                <th className="border border-gray-300 px-4 py-2">Source code</th>
                                <th className="border border-gray-300 px-4 py-2">Times eaten/week</th>
                            </tr>
                        </thead>
                        <tbody>
                            {['Maize', 'Beans', 'Cassava', 'Sweet Potatoes', 'Bananas'].map((item, rowIndex) => (
                                <tr key={item}>
                                    <td className="border border-gray-300 px-4 py-2 font-medium">{item}</td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input
                                            type="number"
                                            min="0" // Added min 0 for codes
                                            max="3"
                                            data-row={rowIndex}
                                            data-col={0}
                                            className="w-full border-gray-200 rounded text-center"
                                            value={getVal('stapleAvailability', `${item}_avail`)}
                                            onChange={(e) => handleObjectChange('stapleAvailability', `${item}_avail`, e.target.value)}
                                        />
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input
                                            type="number"
                                            min="1" // Sources are 1-6
                                            max="6"
                                            data-row={rowIndex}
                                            data-col={1}
                                            className="w-full border-gray-200 rounded text-center"
                                            value={getVal('stapleAvailability', `${item}_source`)}
                                            onChange={(e) => handleObjectChange('stapleAvailability', `${item}_source`, e.target.value)}
                                        />
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input
                                            type="number"
                                            min="0"
                                            data-row={rowIndex}
                                            data-col={2}
                                            className="w-full border-gray-200 rounded text-center"
                                            value={getVal('stapleAvailability', `${item}_times`)}
                                            onChange={(e) => handleObjectChange('stapleAvailability', `${item}_times`, e.target.value)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 1.11 Meals per Day */}
            <div>
                <h4 className="text-lg font-semibold mb-4">1.11 Proportion of Households by Meals per Day (%)</h4>
                <div className="grid md:grid-cols-3 gap-4">
                    {['1 meal', '2 meals', '3 or more meals'].map(meals => (
                        <div key={meals}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{meals}</label>
                            <input
                                type="number"
                                min="0" // Added min 0
                                max="100"
                                value={getVal('mealsPerDay', meals)}
                                onChange={(e) => handleObjectChange('mealsPerDay', meals, e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="%"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* 1.12 Reasons for Poor Performance (NEW) */}
            <div>
                <h4 className="text-lg font-semibold mb-4">1.12 Reasons for Poor Crop Performance (Rank 1-12)</h4>
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-2">
                    {[
                        'Lack of enough seed', 'Pests and diseases', 'Lack of tool/implements', 'Lack of enough labour',
                        'Lack of rain (dry)', 'Flooding', 'Hail storms', 'Change in rain patterns',
                        'Wild animals', 'Domestic animals', 'Other (specify)', 'Other 2 (specify)'
                    ].map((reason, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <input
                                type="number"
                                min="1" // Ranks are 1+
                                max="12"
                                className="w-16 border-gray-300 rounded p-1"
                                placeholder="Rank"
                                value={getVal('poorPerformanceReasons', `rank_${idx}`)}
                                onChange={(e) => handleObjectChange('poorPerformanceReasons', `rank_${idx}`, e.target.value)}
                            />
                            <label className="text-sm text-gray-700">{reason}</label>
                        </div>
                    ))}
                </div>
            </div>

            {/* 1.13 Sub-county Ranking (Performance) (NEW) */}
            <div>
                <h4 className="text-lg font-semibold mb-4">1.13 Sub-county Ranking (Performance)</h4>
                <p className="text-sm text-gray-600 mb-2">Tick appropriate column</p>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 text-sm" ref={table10Ref}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-3 py-2">Sub County / Parish</th>
                                <th className="border border-gray-300 px-3 py-2">3 Main Crops</th>
                                <th className="border border-gray-300 px-2 py-2">Complete Failure</th>
                                <th className="border border-gray-300 px-2 py-2">Worse than normal</th>
                                <th className="border border-gray-300 px-2 py-2">Normal</th>
                                <th className="border border-gray-300 px-2 py-2">Better than normal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5].map((i, rowIndex) => (
                                <tr key={i}>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input
                                            type="text"
                                            data-row={rowIndex}
                                            data-col={0}
                                            className="w-full border-gray-200 rounded"
                                            placeholder="Name"
                                            value={getVal('subCountyRanking', `name_${i}`)}
                                            onChange={(e) => handleObjectChange('subCountyRanking', `name_${i}`, e.target.value)}
                                        />
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input
                                            type="text"
                                            data-row={rowIndex}
                                            data-col={1}
                                            className="w-full border-gray-200 rounded"
                                            placeholder="Crops"
                                            value={getVal('subCountyRanking', `crops_${i}`)}
                                            onChange={(e) => handleObjectChange('subCountyRanking', `crops_${i}`, e.target.value)}
                                        />
                                    </td>
                                    {['failure', 'worse', 'normal', 'better'].map((status, colIndex) => (
                                        <td key={status} className="border border-gray-300 px-2 py-1 text-center">
                                            <input
                                                type="radio"
                                                name={`sc_perf_${i}`}
                                                data-row={rowIndex}
                                                data-col={colIndex + 2}
                                                className="w-4 h-4"
                                                onChange={(e) => handleObjectChange('subCountyRanking', `status_${i}`, status)}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 1.14 Affected Parishes (NEW) */}
            <div>
                <h4 className="text-lg font-semibold mb-4">1.14 Worst Affected Parishes & Reasons</h4>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 text-sm" ref={table11Ref}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2 text-left">Sub County</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Affected Parish</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Reason for poor performance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3].map((i, rowIndex) => (
                                <tr key={i}>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input
                                            type="text"
                                            data-row={rowIndex}
                                            data-col={0}
                                            className="w-full border-gray-200 rounded"
                                            value={getVal('affectedParishes', `sc_${i}`)}
                                            onChange={(e) => handleObjectChange('affectedParishes', `sc_${i}`, e.target.value)}
                                        />
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input
                                            type="text"
                                            data-row={rowIndex}
                                            data-col={1}
                                            className="w-full border-gray-200 rounded"
                                            value={getVal('affectedParishes', `parish_${i}`)}
                                            onChange={(e) => handleObjectChange('affectedParishes', `parish_${i}`, e.target.value)}
                                        />
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input
                                            type="text"
                                            data-row={rowIndex}
                                            data-col={2}
                                            className="w-full border-gray-200 rounded"
                                            value={getVal('affectedParishes', `reason_${i}`)}
                                            onChange={(e) => handleObjectChange('affectedParishes', `reason_${i}`, e.target.value)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 1.15 Food Security Ranking (NEW) */}
            <div>
                <h4 className="text-lg font-semibold mb-4">1.15 Sub-county Food Security Ranking</h4>
                <p className="text-sm text-gray-600 mb-2">Most secure (1) to Least secure</p>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 text-sm" ref={table12Ref}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2 w-20">Rank</th>
                                <th className="border border-gray-300 px-4 py-2">Sub county</th>
                                <th className="border border-gray-300 px-4 py-2">Comment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5, 6].map((rank, rowIndex) => (
                                <tr key={rank}>
                                    <td className="border border-gray-300 px-4 py-2 text-center font-bold">{rank}</td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input
                                            type="text"
                                            data-row={rowIndex}
                                            data-col={0}
                                            className="w-full border-gray-200 rounded"
                                            value={getVal('foodSecurityRanking', `sc_${rank}`)}
                                            onChange={(e) => handleObjectChange('foodSecurityRanking', `sc_${rank}`, e.target.value)}
                                        />
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input
                                            type="text"
                                            data-row={rowIndex}
                                            data-col={1}
                                            className="w-full border-gray-200 rounded"
                                            value={getVal('foodSecurityRanking', `comment_${rank}`)}
                                            onChange={(e) => handleObjectChange('foodSecurityRanking', `comment_${rank}`, e.target.value)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 1.16 Production Constraints (NEW) */}
            <div>
                <h4 className="text-lg font-semibold mb-4">1.16 Production Constraints Ranking (1 to 12)</h4>
                <div className="grid md:grid-cols-3 gap-4">
                    {[
                        'Lack of enough seed', 'Lack of rain (dry)', 'Wild animals',
                        'Pests and diseases', 'Flooding', 'Domestic animals',
                        'Lack of tool/implements', 'Hail storms', 'Other (specify)',
                        'Lack of enough labour', 'Change in rain patterns', 'Other (specify)'
                    ].map((constraint, idx) => (
                        <div key={idx} className="p-3 border border-gray-200 rounded flex items-center justify-between">
                            <span className="text-sm mr-2">{constraint}</span>
                            <input
                                type="number"
                                min="1" // Ranks are 1+
                                max="12"
                                className="w-16 border-gray-300 rounded p-1 text-center"
                                placeholder="#"
                                value={getVal('productionConstraints', `rank_${idx}`)}
                                onChange={(e) => handleObjectChange('productionConstraints', `rank_${idx}`, e.target.value)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* 1.17 Disease/Pest Outbreaks (NEW) */}
            <div>
                <h4 className="text-lg font-semibold mb-4">1.17 Major Disease/Pest Outbreaks (Last 6 Months)</h4>
                <div className="mb-4">
                    <label className="mr-4 font-medium">Any outbreaks?</label>
                    <label className="inline-flex items-center mr-4">
                        <input
                            type="radio"
                            name="outbreak_exists"
                            className="w-4 h-4 mr-2"
                            onChange={() => handleObjectChange('diseaseOutbreaks', 'hasOutbreak', 'yes')}
                        /> Yes
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            name="outbreak_exists"
                            className="w-4 h-4 mr-2"
                            onChange={() => handleObjectChange('diseaseOutbreaks', 'hasOutbreak', 'no')}
                        /> No
                    </label>
                </div>
                {getVal('diseaseOutbreaks', 'hasOutbreak') === 'yes' && (
                    <table className="min-w-full border border-gray-300 text-sm" ref={table13Ref}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2">Pest / Disease</th>
                                <th className="border border-gray-300 px-4 py-2">Crop Affected</th>
                                <th className="border border-gray-300 px-4 py-2">Sub-county Affected</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3].map((i, rowIndex) => (
                                <tr key={i}>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input
                                            type="text"
                                            data-row={rowIndex}
                                            data-col={0}
                                            className="w-full border-gray-200 rounded"
                                            value={getVal('diseaseOutbreaks', `pest_${i}`)}
                                            onChange={(e) => handleObjectChange('diseaseOutbreaks', `pest_${i}`, e.target.value)}
                                        />
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input
                                            type="text"
                                            data-row={rowIndex}
                                            data-col={1}
                                            className="w-full border-gray-200 rounded"
                                            value={getVal('diseaseOutbreaks', `crop_${i}`)}
                                            onChange={(e) => handleObjectChange('diseaseOutbreaks', `crop_${i}`, e.target.value)}
                                        />
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <input
                                            type="text"
                                            data-row={rowIndex}
                                            data-col={2}
                                            className="w-full border-gray-200 rounded"
                                            value={getVal('diseaseOutbreaks', `sc_${i}`)}
                                            onChange={(e) => handleObjectChange('diseaseOutbreaks', `sc_${i}`, e.target.value)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* 1.18 Coping Strategies */}
            <div>
                <h4 className="text-lg font-semibold mb-4">1.18 Coping Strategies</h4>
                <p className="text-sm text-gray-600 mb-3">Rank the 10 most important coping strategies (1 = most applied)</p>
                <div className="space-y-3">
                    {[
                        'Relied on less preferred, less expensive food',
                        'Borrowed food or relied on help from friends or relatives',
                        'Reduced the number of meals eaten per day',
                        'Reduced portion size of meals',
                        'Reduction in quantities consumed by adults/mothers for young children',
                        'Sent household members to eat elsewhere',
                        'Went an entire day without eating',
                        'Sold household goods',
                        'Sold productive assets or means of transport',
                        'Reduced essential non-food expenditures',
                        'Spent savings',
                        'Borrowed money/food from formal lender',
                        'Sold house or land or animals',
                        'Withdrew children from school',
                        'Consume seed stock held for next season',
                        'Sent adult household member to seek work elsewhere',
                        'Illegal income activities',
                        'Begging',
                        'Other (describe)'
                    ].map((strategy, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                            <span className="flex-1 text-sm">{idx + 1}. {strategy}</span>
                            <input
                                type="number"
                                min="1" // Added min 1
                                max="10"
                                placeholder="Rank"
                                className="w-20 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                value={getVal('copingStrategies', `rank_${idx}`)}
                                onChange={(e) => handleObjectChange('copingStrategies', `rank_${idx}`, e.target.value)}
                            />
                            <input
                                type="number"
                                min="0" // Added min 0
                                max="100"
                                placeholder="% HHs"
                                className="w-24 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                value={getVal('copingStrategies', `percent_${idx}`)}
                                onChange={(e) => handleObjectChange('copingStrategies', `percent_${idx}`, e.target.value)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CropSection;
