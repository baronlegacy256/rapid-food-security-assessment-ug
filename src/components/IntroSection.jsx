import React from 'react';
import { ugandaDistricts } from '../data/districts';
import { districtSubcounties } from '../data/subcounties';
import SearchableSelect from './SearchableSelect';

const IntroSection = ({ formData, updateFormData }) => {
    const districts = formData.statisticalRegion ? ugandaDistricts[formData.statisticalRegion] : [];

    // Normalize district name to match the subcounties keys (e.g. strict matching or trim)
    // The keys in subcounties.js are Capitalized. formData.district comes from districts.js which are also Capitalized.
    const subCounties = formData.district ? (districtSubcounties[formData.district] || []) : [];

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">About This Assessment</h3>
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
                            updateFormData('statisticalRegion', e.target.value);
                            updateFormData('district', '');
                            updateFormData('subCounty', '');
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        value={formData.district}
                        onChange={(value) => {
                            updateFormData('district', value);
                            updateFormData('subCounty', '');
                        }}
                        placeholder="Select a district"
                        disabled={!formData.statisticalRegion}
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
