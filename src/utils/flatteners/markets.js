export const flattenMarketsData = (assessment) => {
    const data = assessment.submission_data || {};
    const rows = [];

    const base = {
        assessment_id: assessment.id,
        district: data.district || '',
        sub_county: data.subCounty || '',
        region: data.statisticalRegion || '',
        official_name: data.officialName || '',
        official_title: data.officialTitle || '',
        submitted_at: data.submittedAt || assessment.created_at
    };

    if (data.markets && Array.isArray(data.markets)) {
        data.markets.forEach((market, index) => {
            const marketName = market.name || `Market ${index + 1}`;
            const marketData = market.data || {};

            Object.entries(marketData).forEach(([key, value]) => {
                if (value === '' || value === null || value === undefined) return;

                rows.push({
                    ...base,
                    market_name: marketName,
                    category: 'Market Details',
                    item: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    value: typeof value === 'object' ? JSON.stringify(value) : value,
                });
            });
        });
    }

    return rows;
};
