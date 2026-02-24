import { SECTION_FIELDS } from './constants';

export const flattenCropData = (assessment) => {
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

    SECTION_FIELDS.crop.forEach((sectionName) => {
        const sectionValue = data[sectionName];

        if (sectionValue === undefined || sectionValue === null || sectionValue === '') return;

        const categoryLabel = sectionName.replace(/([A-Z])/g, ' $1').trim()
            .replace(/^./, str => str.toUpperCase());

        if (typeof sectionValue === 'object' && !Array.isArray(sectionValue)) {
            Object.entries(sectionValue).forEach(([key, value]) => {
                if (value === '' || value === null || value === undefined) return;

                rows.push({
                    ...base,
                    category: categoryLabel,
                    item: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    value: typeof value === 'object' ? JSON.stringify(value) : value,
                });
            });
        } else {
            rows.push({
                ...base,
                category: categoryLabel,
                item: 'Value',
                value: Array.isArray(sectionValue) ? sectionValue.join(', ') : sectionValue
            });
        }
    });

    return rows;
};
