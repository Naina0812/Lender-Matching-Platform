import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { getApplication, getApplicationMatches } from '../services/api';
import { CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';

const ApplicationDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    
    const { data: app, isLoading: appLoading } = useQuery({ 
        queryKey: ['application', id], 
        queryFn: () => getApplication(id!)
    });

    const { data: matches, isLoading: matchesLoading } = useQuery({ 
        queryKey: ['matches', id], 
        queryFn: () => getApplicationMatches(id!)
    });

    if (appLoading || matchesLoading) return <div className="p-10 text-center">Loading details...</div>;
    if (!app) return <div className="p-10 text-center text-red-500">Application not found</div>;

    return (
        <div className="max-w-6xl mx-auto p-6">
            <Link to="/dashboard" className="flex items-center text-gray-500 hover:text-gray-900 mb-6">
                <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Application Details */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Application Profile</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 uppercase">Business</h3>
                                <p className="font-semibold">{app.business.name}</p>
                                <p className="text-sm">{app.business.industry} • {app.business.state}</p>
                                <p className="text-sm">{app.business.years_in_business} Years in Business</p>
                                <p className="text-sm">Rev: ${app.business.annual_revenue?.toLocaleString()}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 uppercase">Credit Profile</h3>
                                <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                    <span className="text-sm">FICO Score</span>
                                    <span className="font-bold text-blue-700">{app.guarantor?.fico_score}</span>
                                </div>
                                <div className="flex justify-between items-center bg-gray-50 p-2 rounded mt-1">
                                    <span className="text-sm">PayNet Score</span>
                                    <span className="font-bold text-blue-700">{app.business_credit?.paynet_score || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center bg-gray-50 p-2 rounded mt-1">
                                    <span className="text-sm">Bankruptcy</span>
                                    <span className={`font-bold ${app.guarantor?.bankruptcy_flag ? 'text-red-600' : 'text-green-600'}`}>
                                        {app.guarantor?.bankruptcy_flag ? 'YES' : 'NO'}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 uppercase">Loan Request</h3>
                                <p className="text-2xl font-bold text-green-700">${app.loan_request?.amount?.toLocaleString()}</p>
                                <p className="text-sm">{app.loan_request?.term_months} Months</p>
                                <p className="text-sm">Equipment: {app.loan_request?.equipment_type || 'General'} ({app.loan_request?.equipment_year || 'N/A'})</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Match Results */}
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Matching Results</h2>
                    
                    <div className="space-y-4">
                        {matches?.length === 0 && <p className="text-gray-500">No matching analysis found.</p>}
                        
                        {matches?.map((result: any, idx: number) => (
                            <div key={idx} className={`bg-white rounded-lg shadow border-l-4 p-6 ${result.eligible ? 'border-l-green-500' : 'border-l-red-500'}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{result.lender_name}</h3>
                                        <p className="text-sm text-gray-500">{result.program_name}</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        {result.eligible ? (
                                            <span className="flex items-center text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full">
                                                <CheckCircle size={18} className="mr-2" /> Eligible
                                            </span>
                                        ) : (
                                            <span className="flex items-center text-red-600 font-bold bg-red-50 px-3 py-1 rounded-full">
                                                <XCircle size={18} className="mr-2" /> Ineligible
                                            </span>
                                        )}
                                        {result.eligible && (
                                            <span className="text-xs text-gray-500 mt-1">Fit Score: {result.fit_score}/100</span>
                                        )}
                                    </div>
                                </div>

                                {!result.eligible && (
                                    <div className="mt-4 bg-red-50 p-4 rounded border border-red-100">
                                        <h4 className="text-sm font-semibold text-red-800 flex items-center mb-2">
                                            <AlertCircle size={14} className="mr-2" /> Rejection Reasons:
                                        </h4>
                                        <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                                            {result.rejection_reasons.map((reason: string, i: number) => (
                                                <li key={i}>{reason}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationDetail;
