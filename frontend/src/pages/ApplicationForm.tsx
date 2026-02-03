import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { submitApplication } from '../services/api';
import { useNavigate } from 'react-router-dom';

const ApplicationForm: React.FC = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, control, formState: { errors } } = useForm({
        defaultValues: {
            business: {
                name: '',
                industry: '',
                state: '',
                years_in_business: 0,
                annual_revenue: 0
            },
            business_credit: {
                paynet_score: 0,
                trade_lines: 0
            },
            guarantor: {
                fico_score: 700,
                bankruptcy_flag: false,
                collections_flag: false
            },
            loan_request: {
                amount: 0,
                term_months: 12,
                equipment_type: '',
                equipment_year: new Date().getFullYear()
            }
        }
    });

    const mutation = useMutation({
        mutationFn: submitApplication,
        onSuccess: (data) => {
            navigate('/results', { state: { results: data } });
        },
        onError: (error) => {
            console.error("Submission failed", error);
            alert("Submission failed. Please check your connection.");
        }
    });

    // Watch bankruptcy flag to conditionally show date field
    const hasBankruptcy = useWatch({
        control,
        name: "guarantor.bankruptcy_flag"
    });

    const onSubmit = (data: any) => {
        // Convert strings to numbers where necessary
        const formattedData = {
            ...data,
            business: {
                ...data.business,
                years_in_business: Number(data.business.years_in_business),
                annual_revenue: Number(data.business.annual_revenue)
            },
            business_credit: {
                paynet_score: Number(data.business_credit.paynet_score),
                trade_lines: Number(data.business_credit.trade_lines)
            },
            guarantor: {
                ...data.guarantor,
                fico_score: Number(data.guarantor.fico_score)
            },
            loan_request: {
                ...data.loan_request,
                amount: Number(data.loan_request.amount),
                term_months: Number(data.loan_request.term_months),
                equipment_year: Number(data.loan_request.equipment_year)
            }
        };
        mutation.mutate(formattedData);
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Business Loan Application</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Business Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Business Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Business Name</label>
                            <input {...register("business.name", { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                            {errors.business?.name && <span className="text-red-500 text-sm">Required</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Industry</label>
                            <input {...register("business.industry", { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">State (2 letter code)</label>
                            <input {...register("business.state", { required: true, minLength: 2, maxLength: 2 })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" placeholder="e.g. CA" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Years in Business</label>
                            <input type="number" {...register("business.years_in_business", { required: true, min: 0 })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Annual Revenue ($)</label>
                            <input type="number" {...register("business.annual_revenue", { required: true, min: 0 })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                        </div>
                    </div>
                </div>

                {/* Business Credit Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Business Credit</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">PayNet Score</label>
                            <input type="number" {...register("business_credit.paynet_score", { min: 0 })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Trade Lines</label>
                            <input type="number" {...register("business_credit.trade_lines", { min: 0 })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                        </div>
                    </div>
                </div>

                {/* Guarantor Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Personal Guarantor</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">FICO Score</label>
                            <input type="number" {...register("guarantor.fico_score", { required: true, min: 300, max: 850 })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                        </div>
                        <div className="flex items-center space-x-2">
                            <input type="checkbox" {...register("guarantor.bankruptcy_flag")} className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                            <label className="text-sm font-medium text-gray-700">History of Bankruptcy?</label>
                        </div>
                        
                        {/* Conditional Date Field */}
                        {hasBankruptcy && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Bankruptcy Date</label>
                                <input type="date" {...register("guarantor.bankruptcy_date" as any, { required: hasBankruptcy })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Loan Request */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Loan Request</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Amount Requested ($)</label>
                            <input type="number" {...register("loan_request.amount", { required: true, min: 1 })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Term (Months)</label>
                            <input type="number" {...register("loan_request.term_months", { required: true, min: 1 })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Equipment Type (Optional)</label>
                            <input {...register("loan_request.equipment_type")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Equipment Year (Optional)</label>
                            <input type="number" {...register("loan_request.equipment_year")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <button 
                        type="submit" 
                        disabled={mutation.isPending}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {mutation.isPending ? 'Processing...' : 'Submit Application'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ApplicationForm;
