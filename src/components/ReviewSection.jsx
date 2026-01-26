import React from 'react';
import { Save, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

const ReviewSection = ({ formData, sections }) => {
    const getMissingSections = () => {
        const missing = [];
        // Intro Check
        if (!formData.district || !formData.subCounty) {
            missing.push({ id: 'intro', name: 'Introduction', reason: 'Missing District or Sub-county' });
        }

        // Crop Check (Proxy: Normal Year Events or Crop Performance)
        const hasCropData = Object.keys(formData.normalYearEvents).length > 0 || Object.keys(formData.cropPerformance).length > 0;
        // Check if diseaseOutbreaks is properly filled (either 'no' or 'yes' with data)
        const hasOutbreakData = formData.diseaseOutbreaks?.hasOutbreak === 'no' ||
            (formData.diseaseOutbreaks?.hasOutbreak === 'yes' && Object.keys(formData.diseaseOutbreaks).length > 1);

        if (!hasCropData) {
            missing.push({ id: 'crop', name: 'Crop Production', reason: 'No data entered' });
        }

        // Livestock Check
        const hasLivestockData = Object.keys(formData.livestockConditions).length > 0 || Object.keys(formData.livestockNumbers).length > 0;
        if (!hasLivestockData) {
            missing.push({ id: 'livestock', name: 'Livestock', reason: 'No data entered' });
        }

        // Fisheries Check
        const hasFisheriesData = formData.fishingHouseholds || formData.waterBodies !== '';
        // If waterBodies is 'no', we don't need fishCatch/fishUtilization data
        const needsWaterBodyData = formData.waterBodies === 'yes';
        const hasWaterBodyData = needsWaterBodyData ?
            (Object.keys(formData.fishCatch).length > 0 || Object.keys(formData.fishUtilization).length > 0) :
            true; // Not needed if no water bodies

        if (!hasFisheriesData || !hasWaterBodyData) {
            missing.push({ id: 'fisheries', name: 'Fisheries', reason: 'No data entered' });
        }

        // Markets Check
        const hasMarketData = Object.keys(formData.marketAssessments).length > 0;
        if (!hasMarketData) {
            missing.push({ id: 'markets', name: 'Markets', reason: 'No data entered' });
        }

        return missing;
    };

    const missingSections = getMissingSections();
    const isComplete = missingSections.length === 0;

    return (
        <div className="space-y-6">
            <div className={`border-l-4 p-4 ${isComplete ? 'bg-green-50 border-green-500' : 'bg-yellow-50 border-yellow-500'}`}>
                <h3 className={`font-semibold uppercase text-2xl ${isComplete ? 'text-green-900' : 'text-yellow-900'}`}>
                    {isComplete ? 'Ready to Submit' : 'Review Incomplete Sections'}
                </h3>
                <p className={`text-sm mt-1 ${isComplete ? 'text-green-800' : 'text-yellow-800'}`}>
                    {isComplete
                        ? 'All sections appear to have data. You can now export.'
                        : 'Some sections are missing data. You can still export to save progress, but please complete them before final submission.'}
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-lg">
                <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Assessment Details</h4>
                    <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-gray-600">District:</dt>
                            <dd className="font-medium">{formData.district || <span className="text-red-500">Missing</span>}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-600">Sub County:</dt>
                            <dd className="font-medium">{formData.subCounty || <span className="text-red-500">Missing</span>}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-600">Official:</dt>
                            <dd className="font-medium">{formData.officialName || 'Not provided'}</dd>
                        </div>
                    </dl>
                </div>

                <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Section Status</h4>
                    <div className="space-y-2">
                        {sections.slice(0, -1).map((section) => {
                            const isMissing = missingSections.find(m => m.id === section.id);
                            return (
                                <div key={section.id} className="flex items-center justify-between p-2 bg-white rounded border border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <span>{section.icon}</span>
                                        <span className="text-sm font-medium text-gray-700">{section.title}</span>
                                    </div>
                                    {isMissing ? (
                                        <span className="flex items-center gap-1 text-xs text-yellow-600 font-medium px-2 py-1 bg-yellow-50 rounded">
                                            <AlertCircle className="w-3 h-3" /> Incomplete
                                        </span>
                                    ) : (
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {missingSections.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-900 flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5" />
                        Missing Required Information
                    </h4>
                    <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
                        {missingSections.map((m, idx) => (
                            <li key={idx}>{m.name}: {m.reason}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Removed JSON Export and Data Management info based on user feedback */}
        </div>
    );
};

export default ReviewSection;
