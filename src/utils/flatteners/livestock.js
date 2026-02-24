import { SECTION_FIELDS } from './constants';

export const flattenLivestockData = (assessment) => {
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

    // Flatten livestock specific sections
    const livestockSections = SECTION_FIELDS.livestock;

    livestockSections.forEach(sectionName => {
        const sectionValue = data[sectionName];
        if (!sectionValue) return;

        if (typeof sectionValue === 'object') {
            Object.entries(sectionValue).forEach(([key, value]) => {
                // Skip empty values to keep the export clean
                if (value === '' || value === null || value === undefined) return;

                rows.push({
                    ...base,
                    category: sectionName.replace(/([A-Z])/g, ' $1').trim()
                        .replace(/^./, str => str.toUpperCase()), // Convert camelCase to Space Case
                    item: key.replace(/_/g, ' ')
                        .replace(/\b\w/g, l => l.toUpperCase()), // Human readable keys (e.g. in_status -> In Status)
                    value: value
                });
            });
        }
    });

    return rows;
};
