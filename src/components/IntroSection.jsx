import React, { useEffect } from 'react';
import { ugandaDistricts } from '../data/districts';
import { districtSubcounties } from '../data/subcounties';
import SearchableSelect from './SearchableSelect';

const IntroSection = ({ formData, updateFormData, reportingInfo, lockedDistrict }) => {
    // When the district is locked (opened via a district link), infer its region
    // and keep both region and district in sync with that lock.
    let lockedRegion = null;
    if (lockedDistrict) {
        for (const region of Object.keys(ugandaDistricts)) {
            const list = ugandaDistricts[region] || [];
            if (list.includes(lockedDistrict)) {
                lockedRegion = region;
                break;
            }
        }
    }

    useEffect(() => {
        if (lockedRegion && formData.statisticalRegion !== lockedRegion) {
            updateFormData('statisticalRegion', lockedRegion);
        }
        if (lockedDistrict && formData.district !== lockedDistrict) {
            updateFormData('district', lockedDistrict);
        }
        // We intentionally omit updateFormData from deps to avoid infinite loops.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lockedRegion, lockedDistrict, formData.statisticalRegion, formData.district]);

    const effectiveRegion = lockedRegion || formData.statisticalRegion;
    const districts = effectiveRegion ? ugandaDistricts[effectiveRegion] : [];

    // Normalize district name to match the subcounties keys (e.g. strict matching or trim)
    // The keys in subcounties.js are Capitalized. formData.district comes from districts.js which are also Capitalized.
    const subCounties = formData.district ? (districtSubcounties[formData.district] || []) : [];

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">About This Assessment</h3>
                {reportingInfo && (
                    <div className="mb-2 p-2 bg-blue-100 rounded border border-blue-200 text-blue-900 text-sm">
                        <strong>Reporting Period:</strong> {reportingInfo.year} - {reportingInfo.periodName}
                    </div>
                )}
                {lockedDistrict && (
                    <div className="mt-2 p-2 bg-green-100 rounded border border-green-200 text-green-900 text-sm">
                        <strong>District:</strong> {lockedDistrict} (fixed for this assessment link)
                    </div>
                )}
                <p className="text-sm text-blue-800">
                    This tool is for Rapid Food and Nutrition Security Assessment (RFSNA) developed by OPM, MAAIF, MoH, UBOS
                    with support from FAO, WFP, FEWSNET and Civil Society Organizations.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Statistical Region</label>
                    <select
                        value={formData.statisticalRegion}
                        onChange={(e) => {
                            if (lockedDistrict) return;
                            updateFormData('statisticalRegion', e.target.value);
                            updateFormData('district', '');
                            updateFormData('subCounty', '');
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={!!lockedDistrict}
                    >
                        <option value="">Select a region</option>
                        {Object.keys(ugandaDistricts).map(region => (
                            <option key={region} value={region}>{region}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                    <SearchableSelect
                        options={districts || []}
                        value={lockedDistrict || formData.district}
                        onChange={(value) => {
                            if (lockedDistrict) return;
                            updateFormData('district', value);
                            updateFormData('subCounty', '');
                        }}
                        placeholder="Select a district"
                        disabled={!!lockedDistrict || !formData.statisticalRegion}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sub County</label>
                    <SearchableSelect
                        options={subCounties}
                        value={formData.subCounty}
                        onChange={(value) => updateFormData('subCounty', value)}
                        placeholder="Select or type sub county"
                        disabled={!formData.district}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name of Official</label>
                    <input
                        type="text"
                        value={formData.officialName}
                        onChange={(e) => updateFormData('officialName', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Full name"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title of Official</label>
                    <input
                        type="text"
                        value={formData.officialTitle}
                        onChange={(e) => updateFormData('officialTitle', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., District Production Officer"
                    />
                </div>
            </div>
        </div>
    );
};

export default IntroSection;
