import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface MatchResult {
    lender_name: string;
    program_name: string;
    eligible: boolean;
    fit_score: number;
    rejection_reasons: string[];
}

const ResultsPage: React.FC = () => {
    const location = useLocation();
    const results = location.state?.results as MatchResult[] || [];

    if (results.length === 0) {
        return (
            <div className="text-center mt-20">
                <h2 className="text-2xl font-bold text-gray-700">No results found.</h2>
                <Link to="/" className="text-blue-600 hover:underline mt-4 block">Go back to application</Link>
            </div>
        );
    }

    const eligibleMatches = results.filter(r => r.eligible).sort((a, b) => b.fit_score - a.fit_score);
    const ineligibleMatches = results.filter(r => !r.eligible);

    return (
        <div className="max-w-4xl mx-auto p-6 mt-10">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Application Results</h1>

            {/* Eligible Section */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold text-green-700 flex items-center mb-4">
                    <CheckCircle className="mr-2" /> Eligible Offers ({eligibleMatches.length})
                </h2>
                {eligibleMatches.length > 0 ? (
                    <div className="grid gap-4">
                        {eligibleMatches.map((match, idx) => (
                            <div key={idx} className="bg-white border border-green-200 rounded-lg p-6 shadow-sm hover:shadow-md transition">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{match.lender_name}</h3>
                                        <p className="text-gray-600">{match.program_name}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-green-600">{match.fit_score}%</div>
                                        <div className="text-xs text-gray-500 uppercase">Fit Score</div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <button className="text-sm bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                                        View Offer Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 italic">No eligible offers found at this time.</p>
                )}
            </div>

            {/* Ineligible Section */}
            <div>
                <h2 className="text-xl font-semibold text-red-700 flex items-center mb-4">
                    <XCircle className="mr-2" /> Ineligible ({ineligibleMatches.length})
                </h2>
                <div className="grid gap-4">
                    {ineligibleMatches.map((match, idx) => (
                        <div key={idx} className="bg-white border border-red-100 rounded-lg p-6 shadow-sm opacity-80">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">{match.lender_name}</h3>
                                    <p className="text-gray-600">{match.program_name}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold text-gray-400">0%</div>
                                    <div className="text-xs text-gray-400 uppercase">Fit Score</div>
                                </div>
                            </div>
                            <div className="mt-4 bg-red-50 p-3 rounded text-sm text-red-800">
                                <div className="font-semibold mb-1 flex items-center">
                                    <AlertCircle size={14} className="mr-1" /> Rejection Reasons:
                                </div>
                                <ul className="list-disc list-inside pl-1">
                                    {match.rejection_reasons.map((reason, i) => (
                                        <li key={i}>{reason}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-10 text-center">
                <Link to="/" className="text-blue-600 hover:underline">Start New Application</Link>
            </div>
        </div>
    );
};

export default ResultsPage;
