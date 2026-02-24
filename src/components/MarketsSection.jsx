import React, { useState, useEffect } from 'react';
import useTableNavigation from '../hooks/useTableNavigation';

const MarketsSection = ({ formData, updateFormData }) => {
    // Initialize markets array - ensure at least 2 markets
    const [markets, setMarkets] = useState(() => {
        const existingMarkets = formData.markets || [];
        if (existingMarkets.length === 0) {
            return [
                { id: 1, name: 'Market 1', data: {} },
                { id: 2, name: 'Market 2', data: {} }
            ];
        }
        return existingMarkets;
    });

    const [activeMarketIndex, setActiveMarketIndex] = useState(0);

    // Navigation refs
    const table1Ref = useTableNavigation(); // Commodity Supply/Prices
    const table2Ref = useTableNavigation(); // Commodity Direction
    const table3Ref = useTableNavigation(); // Livestock Supply/Prices
    const table4Ref = useTableNavigation(); // Livestock Direction
    const table5Ref = useTableNavigation(); // Market Access
    const table6Ref = useTableNavigation(); // Transport

    // Sync from formData when it loads from database
    useEffect(() => {
        if (formData.markets && formData.markets.length > 0) {
            setMarkets(formData.markets);
        }
    }, [formData.markets]);

    // Sync markets to formData whenever internal state changes
    useEffect(() => {
        updateFormData('markets', markets);
    }, [markets]);

    // Helper to get value for current market
    const getVal = (key, defaultVal = '') => {
        return markets[activeMarketIndex]?.data?.[key] ?? defaultVal;
    };

    // Helper to update value for current market
    const handleChange = (key, value) => {
        const updatedMarkets = [...markets];
        updatedMarkets[activeMarketIndex] = {
            ...updatedMarkets[activeMarketIndex],
            data: {
                ...updatedMarkets[activeMarketIndex].data,
                [key]: value
            }
        };
        setMarkets(updatedMarkets);
    };

    // Add a new market
    const addMarket = () => {
        const newMarket = {
            id: Date.now(),
            name: `Market ${markets.length + 1}`,
            data: {}
        };
        setMarkets([...markets, newMarket]);
        setActiveMarketIndex(markets.length);
    };

    // Remove a market (minimum 2 required)
    const removeMarket = (index) => {
        if (markets.length <= 2) {
            alert('At least 2 markets are required for this section.');
            return;
        }
        const updatedMarkets = markets.filter((_, i) => i !== index);
        setMarkets(updatedMarkets);
        if (activeMarketIndex >= updatedMarkets.length) {
            setActiveMarketIndex(updatedMarkets.length - 1);
        }
    };

    // Update market name
    const updateMarketName = (index, name) => {
        const updatedMarkets = [...markets];
        updatedMarkets[index] = { ...updatedMarkets[index], name };
        setMarkets(updatedMarkets);
    };

    return (
        <div className="space-y-8">
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4">
                <h3 className="font-semibold text-purple-900 uppercase text-2xl">Section 4: Food Prices, Trade and Markets</h3>
                <p className="text-sm text-purple-800 mt-1">To be administered to Commercial Officer (at least 2 markets)</p>
            </div>

            {/* Market Tabs */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 p-2 bg-gray-50 border-b border-gray-200 overflow-x-auto">
                    {markets.map((market, index) => (
                        <div key={market.id} className="flex items-center gap-1 flex-shrink-0">
                            <button
                                onClick={() => setActiveMarketIndex(index)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${activeMarketIndex === index
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {market.name}
                            </button>
                            {markets.length > 2 && (
                                <button
                                    onClick={() => removeMarket(index)}
                                    className="w-6 h-6 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                    title="Remove market"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={addMarket}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex-shrink-0"
                    >
                        + Add Market
                    </button>
                </div>

                {/* Market Form Content */}
                <div className="p-6 space-y-8">
                    {/* Market Name (Editable) */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                        <label className="block text-sm font-medium text-blue-900 mb-2">Market Name</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-blue-300 rounded-lg bg-white"
                            value={markets[activeMarketIndex]?.name || ''}
                            onChange={(e) => updateMarketName(activeMarketIndex, e.target.value)}
                            placeholder="Enter market name"
                        />
                    </div>

                    {/* Basic Market Info */}
                    <div className="grid md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Parish</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                value={getVal('parish')}
                                onChange={(e) => handleChange('parish', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Market Type</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name={`marketType_${activeMarketIndex}`}
                                        value="urban"
                                        checked={getVal('marketType') === 'urban'}
                                        onChange={(e) => handleChange('marketType', e.target.value)}
                                        className="w-4 h-4"
                                    /> Urban
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name={`marketType_${activeMarketIndex}`}
                                        value="rural"
                                        checked={getVal('marketType') === 'rural'}
                                        onChange={(e) => handleChange('marketType', e.target.value)}
                                        className="w-4 h-4"
                                    /> Rural
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name={`frequency_${activeMarketIndex}`}
                                        value="weekly"
                                        checked={getVal('frequency') === 'weekly'}
                                        onChange={(e) => handleChange('frequency', e.target.value)}
                                        className="w-4 h-4"
                                    /> Weekly
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name={`frequency_${activeMarketIndex}`}
                                        value="daily"
                                        checked={getVal('frequency') === 'daily'}
                                        onChange={(e) => handleChange('frequency', e.target.value)}
                                        className="w-4 h-4"
                                    /> Daily
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Name of Respondent</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                value={getVal('respondent')}
                                onChange={(e) => handleChange('respondent', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* 4.1 & 4.2 Range and Origin */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">4.1 Range of items available</label>
                            <textarea
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                rows="2"
                                value={getVal('itemsRange')}
                                onChange={(e) => handleChange('itemsRange', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">4.2 Origin of market supplies</label>
                            <textarea
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                rows="2"
                                value={getVal('itemsOrigin')}
                                onChange={(e) => handleChange('itemsOrigin', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* 4.3a Commodity Prices */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">4.3a Commodity Supply and Prices</h4>
                        <div className="overflow-x-auto">
                            <table className="min-w-full border border-gray-300 text-sm" ref={table1Ref}>
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-300 px-2 py-2 text-left w-32" rowSpan="2">Item</th>
                                        <th className="border border-gray-300 px-2 py-2 text-center" rowSpan="2">Source (1-3)</th>
                                        <th className="border border-gray-300 px-2 py-2 text-center" rowSpan="2">Avail (1-3)</th>
                                        <th className="border border-gray-300 px-2 py-2 text-center" colSpan="3">Price (UGX)</th>
                                        <th className="border border-gray-300 px-2 py-2 text-center" colSpan="3">Projected Trend (0-2)</th>
                                    </tr>
                                    <tr className="bg-gray-50">
                                        <th className="border border-gray-300 px-1 py-1 text-xs">2024</th>
                                        <th className="border border-gray-300 px-1 py-1 text-xs">Curr</th>
                                        <th className="border border-gray-300 px-1 py-1 text-xs">Proj</th>
                                        <th className="border border-gray-300 px-1 py-1 text-xs">2024</th>
                                        <th className="border border-gray-300 px-1 py-1 text-xs">Curr</th>
                                        <th className="border border-gray-300 px-1 py-1 text-xs">Proj</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        'Maize (fresh)', 'Maize (grain)', 'Maize (flour)', 'Millet (grain)', 'Millet (flour)',
                                        'Sorghum', 'Cassava (fresh)', 'Cassava (chips)', 'Cassava (flour)', 'S. Potatoes (fresh)',
                                        'S. Potatoes (chips)', 'Rice', 'Beans', 'Cowpeas', 'Groundnuts', 'Simsim', 'Beef',
                                        'Pork', 'Goat meat', 'Poultry', 'Chicken', 'Fish (tilapia)', 'Fish (mukene)',
                                        'Cooking oil', 'Paraffin', 'Soap', 'Salt', 'Sugar', 'Tea leaves'
                                    ].map((item, rowIndex) => (
                                        <tr key={item}>
                                            <td className="border border-gray-300 px-2 py-1 font-medium text-xs">{item}</td>
                                            {['source', 'avail', 'price_2024', 'price_curr', 'price_proj', 'trend_2024', 'trend_curr', 'trend_proj'].map((field, colIndex) => (
                                                <td key={field} className="border border-gray-300 px-1 py-1">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        data-row={rowIndex}
                                                        data-col={colIndex}
                                                        className="w-full border-gray-200 rounded text-center text-xs p-1"
                                                        value={getVal(`commodity_${item.replace(/\s+/g, '_')}_${field}`)}
                                                        onChange={(e) => handleChange(`commodity_${item.replace(/\s+/g, '_')}_${field}`, e.target.value)}
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 4.3b Change Direction (Commodities) */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">4.3b Direction of Change (Commodities)</h4>
                        <div className="overflow-x-auto">
                            <table className="min-w-full border border-gray-300 text-sm" ref={table2Ref}>
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-300 px-4 py-2 text-left">Item</th>
                                        <th className="border border-gray-300 px-4 py-2">Direction (0=Stable, 1=Decr, 2=Incr)</th>
                                        <th className="border border-gray-300 px-4 py-2">Reason/Cause</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        'Sorghum', 'Maize grain', 'Maize flour', 'Beans',
                                        'Millet', 'Cassava flour', 'Banana bunch'
                                    ].map((item, rowIndex) => (
                                        <tr key={item}>
                                            <td className="border border-gray-300 px-4 py-2 font-medium">{item}</td>
                                            <td className="border border-gray-300 px-4 py-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="2"
                                                    data-row={rowIndex}
                                                    data-col={0}
                                                    className="w-full border-gray-200 rounded"
                                                    value={getVal(`change_${item.replace(/\s+/g, '_')}_dir`)}
                                                    onChange={(e) => handleChange(`change_${item.replace(/\s+/g, '_')}_dir`, e.target.value)}
                                                />
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2">
                                                <input
                                                    type="text"
                                                    data-row={rowIndex}
                                                    data-col={1}
                                                    className="w-full border-gray-200 rounded"
                                                    value={getVal(`change_${item.replace(/\s+/g, '_')}_reason`)}
                                                    onChange={(e) => handleChange(`change_${item.replace(/\s+/g, '_')}_reason`, e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 4.4a Livestock Prices */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">4.4a Livestock Supply and Prices</h4>
                        <div className="overflow-x-auto">
                            <table className="min-w-full border border-gray-300 text-sm" ref={table3Ref}>
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-300 px-2 py-2 text-left w-32" rowSpan="2">Item</th>
                                        <th className="border border-gray-300 px-2 py-2 text-center" rowSpan="2">Source (1-3)</th>
                                        <th className="border border-gray-300 px-2 py-2 text-center" rowSpan="2">Avail (1-3)</th>
                                        <th className="border border-gray-300 px-2 py-2 text-center" colSpan="3">Price (UGX)</th>
                                        <th className="border border-gray-300 px-2 py-2 text-center" colSpan="3">Projected Trend (0-2)</th>
                                    </tr>
                                    <tr className="bg-gray-50">
                                        <th className="border border-gray-300 px-1 py-1 text-xs">2024</th>
                                        <th className="border border-gray-300 px-1 py-1 text-xs">Curr</th>
                                        <th className="border border-gray-300 px-1 py-1 text-xs">Proj</th>
                                        <th className="border border-gray-300 px-1 py-1 text-xs">2024</th>
                                        <th className="border border-gray-300 px-1 py-1 text-xs">Curr</th>
                                        <th className="border border-gray-300 px-1 py-1 text-xs">Proj</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        'Bull (Medium)', 'Cow (Medium)', 'Goat (Medium)',
                                        'Sheep (Medium)', 'Pig (Medium)', 'Chicken (Medium)'
                                    ].map((item, rowIndex) => (
                                        <tr key={item}>
                                            <td className="border border-gray-300 px-2 py-1 font-medium text-xs">{item}</td>
                                            {['source', 'avail', 'price_2024', 'price_curr', 'price_proj', 'trend_2024', 'trend_curr', 'trend_proj'].map((field, colIndex) => (
                                                <td key={field} className="border border-gray-300 px-1 py-1">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        data-row={rowIndex}
                                                        data-col={colIndex}
                                                        className="w-full border-gray-200 rounded text-center text-xs p-1"
                                                        value={getVal(`livestock_${item.replace(/\s+/g, '_')}_${field}`)}
                                                        onChange={(e) => handleChange(`livestock_${item.replace(/\s+/g, '_')}_${field}`, e.target.value)}
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 4.4b Change Direction (Livestock) */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">4.4b Direction of Change (Livestock)</h4>
                        <div className="overflow-x-auto">
                            <table className="min-w-full border border-gray-300 text-sm" ref={table4Ref}>
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-300 px-4 py-2 text-left">Item (Price/Supply)</th>
                                        <th className="border border-gray-300 px-4 py-2">Direction (0=Stable, 1=Decr, 2=Incr)</th>
                                        <th className="border border-gray-300 px-4 py-2">Reason/Cause</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        'Price - Bull (Med)', 'Price - Cow (Med)', 'Price - Goat (Med)',
                                        'Price - Sheep (Med)', 'Price - Pig (Med)', 'Price - Chicken (Med)',
                                        'Supply - Bull (Med)', 'Supply - Cow (Med)', 'Supply - Goat (Med)',
                                        'Supply - Sheep (Med)', 'Supply - Chicken (Med)'
                                    ].map((item, rowIndex) => (
                                        <tr key={item}>
                                            <td className="border border-gray-300 px-4 py-2 font-medium">{item}</td>
                                            <td className="border border-gray-300 px-4 py-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="2"
                                                    data-row={rowIndex}
                                                    data-col={0}
                                                    className="w-full border-gray-200 rounded"
                                                    value={getVal(`change_ls_${item.replace(/\s+/g, '_')}_dir`)}
                                                    onChange={(e) => handleChange(`change_ls_${item.replace(/\s+/g, '_')}_dir`, e.target.value)}
                                                />
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2">
                                                <input
                                                    type="text"
                                                    data-row={rowIndex}
                                                    data-col={1}
                                                    className="w-full border-gray-200 rounded"
                                                    value={getVal(`change_ls_${item.replace(/\s+/g, '_')}_reason`)}
                                                    onChange={(e) => handleChange(`change_ls_${item.replace(/\s+/g, '_')}_reason`, e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 4.5a Market Access */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">4.5a Market Access & Infrastructure</h4>
                        <div className="overflow-x-auto">
                            <table className="min-w-full border border-gray-300 text-sm" ref={table5Ref}>
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-300 px-4 py-2 text-left">Indicator</th>
                                        <th className="border border-gray-300 px-4 py-2">Status (1=Poor, 2=Avg, 3=Good)</th>
                                        <th className="border border-gray-300 px-4 py-2">Comment</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        'Market infrastructure', 'Roads within district',
                                        'Roads to/from neighboring', 'Security'
                                    ].map((item, rowIndex) => (
                                        <tr key={item}>
                                            <td className="border border-gray-300 px-4 py-2 font-medium">{item}</td>
                                            <td className="border border-gray-300 px-4 py-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="3"
                                                    data-row={rowIndex}
                                                    data-col={0}
                                                    className="w-full border-gray-200 rounded text-center"
                                                    value={getVal(`access_${item.replace(/\s+/g, '_')}_status`)}
                                                    onChange={(e) => handleChange(`access_${item.replace(/\s+/g, '_')}_status`, e.target.value)}
                                                />
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2">
                                                <input
                                                    type="text"
                                                    data-row={rowIndex}
                                                    data-col={1}
                                                    className="w-full border-gray-200 rounded"
                                                    value={getVal(`access_${item.replace(/\s+/g, '_')}_comment`)}
                                                    onChange={(e) => handleChange(`access_${item.replace(/\s+/g, '_')}_comment`, e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 4.5b Transport Availability */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">4.5b Transport Availability</h4>
                        <div className="overflow-x-auto">
                            <table className="min-w-full border border-gray-300 text-sm" ref={table6Ref}>
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-300 px-4 py-2 text-left">Category</th>
                                        <th className="border border-gray-300 px-4 py-2">Availability (1=Easy, 2=Scarce, 3=Unavail)</th>
                                        <th className="border border-gray-300 px-4 py-2">Comments (Type of transport, etc)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        'Commodities from outside', 'Commodity distribution within'
                                    ].map((item, rowIndex) => (
                                        <tr key={item}>
                                            <td className="border border-gray-300 px-4 py-2 font-medium">{item}</td>
                                            <td className="border border-gray-300 px-4 py-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="3"
                                                    data-row={rowIndex}
                                                    data-col={0}
                                                    className="w-full border-gray-200 rounded text-center"
                                                    value={getVal(`transport_${item.replace(/\s+/g, '_')}_avail`)}
                                                    onChange={(e) => handleChange(`transport_${item.replace(/\s+/g, '_')}_avail`, e.target.value)}
                                                />
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2">
                                                <input
                                                    type="text"
                                                    data-row={rowIndex}
                                                    data-col={1}
                                                    className="w-full border-gray-200 rounded"
                                                    value={getVal(`transport_${item.replace(/\s+/g, '_')}_comment`)}
                                                    onChange={(e) => handleChange(`transport_${item.replace(/\s+/g, '_')}_comment`, e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 4.6 Labour Market */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">4.6 Labour Market Conditions</h4>
                        <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Daily wage rate (unskilled)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        value={getVal('labour_wage')}
                                        onChange={(e) => handleChange('labour_wage', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Days laborers find work/month</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="31"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        value={getVal('labour_days')}
                                        onChange={(e) => handleChange('labour_days', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Where are laborers coming from?</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        value={getVal('labour_origin')}
                                        onChange={(e) => handleChange('labour_origin', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Are laborers migrating out?</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        placeholder="Yes/No and Reason"
                                        value={getVal('labour_migration')}
                                        onChange={(e) => handleChange('labour_migration', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">General changes compared to previous year & reasons</label>
                                <textarea
                                    rows="2"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Describe..."
                                    value={getVal('labour_changes')}
                                    onChange={(e) => handleChange('labour_changes', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketsSection;
