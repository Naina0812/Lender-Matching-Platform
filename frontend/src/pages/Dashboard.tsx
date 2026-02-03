import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApplications, deleteApplication } from '../services/api';
import { Link } from 'react-router-dom';
import { FileText, Calendar, DollarSign, CheckCircle, XCircle, Trash2 } from 'lucide-react';

const Dashboard: React.FC = () => {
    const queryClient = useQueryClient();

    const { data: applications, isLoading } = useQuery({ 
        queryKey: ['applications'], 
        queryFn: getApplications 
    });

    const deleteMutation = useMutation({
        mutationFn: deleteApplication,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
        }
    });

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this application?")) {
            deleteMutation.mutate(id);
        }
    };

    if (isLoading) return <div className="p-10 text-center">Loading applications...</div>;

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Application Dashboard</h1>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matches</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {applications?.map((app: any) => (
                            <tr key={app.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                            <FileText size={20} />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{app.business.name}</div>
                                            <div className="text-sm text-gray-500">{app.business.state}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{app.business.industry}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 flex items-center">
                                        <DollarSign size={14} className="mr-1" />
                                        {app.loan_request?.amount?.toLocaleString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col space-y-1">
                                         <div className="text-green-600 text-sm">
                                             <div className="flex items-center font-medium">
                                                 <CheckCircle size={14} className="mr-1" />
                                                 {app.matches?.filter((m: any) => m.eligible).length || 0} Eligible
                                             </div>
                                             {app.matches?.some((m: any) => m.eligible) && (
                                                 <div className="text-xs text-gray-500 ml-5 truncate max-w-[150px]" title={app.matches.filter((m: any) => m.eligible).map((m: any) => m.lender_name).join(", ")}>
                                                     {app.matches.filter((m: any) => m.eligible).map((m: any) => m.lender_name).join(", ")}
                                                 </div>
                                             )}
                                         </div>
                                         <div className="flex items-center text-red-500 text-sm">
                                             <XCircle size={14} className="mr-1" />
                                             <span className="font-medium">{app.matches?.filter((m: any) => !m.eligible).length || 0} Ineligible</span>
                                         </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500 flex items-center">
                                        <Calendar size={14} className="mr-1" />
                                        {new Date(app.created_at).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-3">
                                        <Link to={`/applications/${app.id}`} className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-full">
                                            View Details
                                        </Link>
                                        <button 
                                            onClick={() => handleDelete(app.id)}
                                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                            title="Delete Application"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {applications?.length === 0 && (
                    <div className="p-10 text-center text-gray-500">
                        No applications found. <Link to="/" className="text-blue-600 hover:underline">Start a new application</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
