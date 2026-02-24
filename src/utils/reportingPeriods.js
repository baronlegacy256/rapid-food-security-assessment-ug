// Reporting Period Configuration and Utilities

// Configuration - Change this to switch between biannual and quarterly reporting
export const REPORTING_CONFIG = {
    // Default frequency: 'biannual' or 'quarterly'
    defaultFrequency: 'biannual', // Change to 'quarterly' when decision is made

    // Biannual periods (twice a year)
    biannualPeriods: [
        {
            code: 'H1',
            name: 'First Half (January - June)',
            startMonth: 0, // January (0-indexed)
            endMonth: 5,   // June
            displayName: 'H1'
        },
        {
            code: 'H2',
            name: 'Second Half (July - December)',
            startMonth: 6, // July
            endMonth: 11,  // December
            displayName: 'H2'
        }
    ],

    // Quarterly periods (four times a year)
    quarterlyPeriods: [
        {
            code: 'Q1',
            name: 'Quarter 1 (January - March)',
            startMonth: 0,
            endMonth: 2,
            displayName: 'Q1'
        },
        {
            code: 'Q2',
            name: 'Quarter 2 (April - June)',
            startMonth: 3,
            endMonth: 5,
            displayName: 'Q2'
        },
        {
            code: 'Q3',
            name: 'Quarter 3 (July - September)',
            startMonth: 6,
            endMonth: 8,
            displayName: 'Q3'
        },
        {
            code: 'Q4',
            name: 'Quarter 4 (October - December)',
            startMonth: 9,
            endMonth: 11,
            displayName: 'Q4'
        }
    ]
};

/**
 * Get the current reporting period based on the current date and frequency
 * @param {string} frequency - 'biannual' or 'quarterly'
 * @returns {object} - { year, period, periodName, startDate, endDate }
 */
export const getCurrentReportingPeriod = (frequency = REPORTING_CONFIG.defaultFrequency) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed

    const periods = frequency === 'biannual'
        ? REPORTING_CONFIG.biannualPeriods
        : REPORTING_CONFIG.quarterlyPeriods;

    const currentPeriod = periods.find(p => month >= p.startMonth && month <= p.endMonth);

    if (!currentPeriod) {
        // Fallback to first period if something goes wrong
        return {
            year,
            period: periods[0].code,
            periodName: periods[0].name,
            startDate: new Date(year, periods[0].startMonth, 1),
            endDate: new Date(year, periods[0].endMonth + 1, 0)
        };
    }

    return {
        year,
        period: currentPeriod.code,
        periodName: currentPeriod.name,
        startDate: new Date(year, currentPeriod.startMonth, 1),
        endDate: new Date(year, currentPeriod.endMonth + 1, 0) // Last day of the month
    };
};

/**
 * Get all available periods for a given frequency
 * @param {string} frequency - 'biannual' or 'quarterly'
 * @returns {array} - Array of period objects
 */
export const getAvailablePeriods = (frequency = REPORTING_CONFIG.defaultFrequency) => {
    return frequency === 'biannual'
        ? REPORTING_CONFIG.biannualPeriods
        : REPORTING_CONFIG.quarterlyPeriods;
};

/**
 * Get period details by code
 * @param {string} periodCode - 'H1', 'H2', 'Q1', etc.
 * @param {string} frequency - 'biannual' or 'quarterly'
 * @returns {object} - Period details
 */
export const getPeriodDetails = (periodCode, frequency = REPORTING_CONFIG.defaultFrequency) => {
    const periods = getAvailablePeriods(frequency);
    return periods.find(p => p.code === periodCode);
};

/**
 * Calculate period dates for a specific year and period
 * @param {number} year
 * @param {string} periodCode
 * @param {string} frequency
 * @returns {object} - { startDate, endDate }
 */
export const getPeriodDates = (year, periodCode, frequency = REPORTING_CONFIG.defaultFrequency) => {
    const period = getPeriodDetails(periodCode, frequency);

    if (!period) {
        return { startDate: null, endDate: null };
    }

    return {
        startDate: new Date(year, period.startMonth, 1),
        endDate: new Date(year, period.endMonth + 1, 0)
    };
};

/**
 * Format a reporting period for display
 * @param {number} year
 * @param {string} periodCode
 * @param {string} frequency
 * @returns {string} - Formatted string like "2026 H1 (January - June)"
 */
export const formatReportingPeriod = (year, periodCode, frequency = REPORTING_CONFIG.defaultFrequency) => {
    const period = getPeriodDetails(periodCode, frequency);

    if (!period) {
        return `${year} - Unknown Period`;
    }

    return `${year} ${period.displayName} (${period.name.split('(')[1].split(')')[0]})`;
};

/**
 * Get years available for selection (current year and previous years)
 * @param {number} yearsBack - How many years back to include
 * @returns {array} - Array of years
 */
export const getAvailableYears = (yearsBack = 5) => {
    const currentYear = new Date().getFullYear();
    const years = [];

    for (let i = 0; i <= yearsBack; i++) {
        years.push(currentYear - i);
    }

    return years;
};

/**
 * Validate if a reporting period is valid
 * @param {number} year
 * @param {string} periodCode
 * @param {string} frequency
 * @returns {boolean}
 */
export const isValidReportingPeriod = (year, periodCode, frequency = REPORTING_CONFIG.defaultFrequency) => {
    const period = getPeriodDetails(periodCode, frequency);
    return !!period && year >= 2020 && year <= new Date().getFullYear() + 1;
};
