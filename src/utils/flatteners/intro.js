import { SECTION_FIELDS } from './constants';

export const flattenIntroData = (assessment) => {
    const data = assessment.submission_data || {};
    const result = {
        assessment_id: assessment.id,
        user_id: assessment.user_id,
        created_at: assessment.created_at,
        updated_at: assessment.updated_at,
        reporting_year: assessment.reporting_year,
        reporting_period: assessment.reporting_period,
    };

    SECTION_FIELDS.intro.forEach(field => {
        result[field] = data[field] || '';
    });

    return result;
};
