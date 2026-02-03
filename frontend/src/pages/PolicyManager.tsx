import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLenders, createLender, createProgram } from '../services/api';
import { Plus, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';

const PolicyManager: React.FC = () => {
    const queryClient = useQueryClient();
    const [expandedLender, setExpandedLender] = useState<string | null>(null);
    const [showNewLenderForm, setShowNewLenderForm] = useState(false);
    const [showNewProgramForm, setShowNewProgramForm] = useState<string | null>(null);

    const { data: lenders, isLoading } = useQuery({ queryKey: ['lenders'], queryFn: getLenders });

    // New Lender Form
    const { register: regLender, handleSubmit: subLender, reset: resetLender } = useForm();
    const createLenderMutation = useMutation({
        mutationFn: createLender,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lenders'] });
            setShowNewLenderForm(false);
            resetLender();
        }
    });

    // New Program Form
    const { register: regProg, control: controlProg, handleSubmit: subProg, reset: resetProg } = useForm({
        defaultValues: {
            name: '',
            min_loan_amount: 0,
            max_loan_amount: 0,
            policies: [{ criteria_type: 'fico_score', operator: '>=', value: 0 }]
        }
    });
    
    const { fields, append, remove } = useFieldArray({
        control: controlProg,
        name: "policies"
    });

    const createProgramMutation = useMutation({
        mutationFn: ({ lenderId, data }: { lenderId: string, data: any }) => createProgram(lenderId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lenders'] });
            setShowNewProgramForm(null);
            resetProg();
        }
    });

    const onLenderSubmit = (data: any) => {
        createLenderMutation.mutate({ ...data, is_active: true });
    };

    const onProgramSubmit = (data: any) => {
        if (!showNewProgramForm) return;
        
        // Format values
        const formattedData = {
            ...data,
            min_loan_amount: Number(data.min_loan_amount),
            max_loan_amount: Number(data.max_loan_amount),
            policies: data.policies.map((p: any) => ({
                ...p,
                value: isNaN(Number(p.value)) ? p.value : Number(p.value)
            }))
        };
        
        createProgramMutation.mutate({ lenderId: showNewProgramForm, data: formattedData });
    };

    const toggleLender = (id: string) => {
        setExpandedLender(expandedLender === id ? null : id);
    };

    if (isLoading) return <div className="p-10 text-center">Loading lenders...</div>;

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Lender Policy Manager</h1>
                <button 
                    onClick={() => setShowNewLenderForm(!showNewLenderForm)}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    <Plus size={18} className="mr-2" /> Add Lender
                </button>
            </div>

            {/* New Lender Form */}
            {showNewLenderForm && (
                <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200">
                    <h3 className="font-bold mb-4">Add New Lender</h3>
                    <form onSubmit={subLender(onLenderSubmit)} className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Lender Name</label>
                            <input {...regLender("name", { required: true })} className="w-full p-2 border rounded" />
                        </div>
                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Save</button>
                    </form>
                </div>
            )}

            {/* Lenders List */}
            <div className="space-y-4">
                {lenders?.map((lender: any) => (
                    <div key={lender.id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                        <div 
                            className="p-4 bg-white flex justify-between items-center cursor-pointer hover:bg-gray-50"
                            onClick={() => toggleLender(lender.id)}
                        >
                            <div>
                                <h3 className="font-bold text-lg">{lender.name}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full ${lender.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {lender.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            {expandedLender === lender.id ? <ChevronUp /> : <ChevronDown />}
                        </div>

                        {expandedLender === lender.id && (
                            <div className="p-6 bg-gray-50 border-t">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-semibold text-gray-700">Programs & Policies</h4>
                                    <button 
                                        onClick={() => setShowNewProgramForm(lender.id)}
                                        className="text-sm text-blue-600 hover:underline flex items-center"
                                    >
                                        <Plus size={14} className="mr-1" /> Add Program
                                    </button>
                                </div>

                                {/* Programs List */}
                                <div className="space-y-4">
                                    {lender.programs?.map((prog: any) => (
                                        <div key={prog.id} className="bg-white p-4 rounded border border-gray-200">
                                            <div className="flex justify-between mb-2">
                                                <h5 className="font-bold">{prog.name}</h5>
                                                <span className="text-sm text-gray-500">${prog.min_loan_amount.toLocaleString()} - ${prog.max_loan_amount.toLocaleString()}</span>
                                            </div>
                                            
                                            <div className="mt-2">
                                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Rules:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {prog.policies?.map((policy: any, idx: number) => (
                                                        <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">
                                                            {policy.criteria_type} {policy.operator} {policy.value}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* New Program Form */}
                                {showNewProgramForm === lender.id && (
                                    <div className="mt-6 bg-white p-4 rounded border border-blue-200 shadow-sm">
                                        <h5 className="font-bold mb-3 text-blue-800">New Program Definition</h5>
                                        <form onSubmit={subProg(onProgramSubmit)} className="space-y-4">
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="col-span-1">
                                                    <label className="text-xs block font-medium">Program Name</label>
                                                    <input {...regProg("name", { required: true })} className="w-full p-2 border rounded text-sm" />
                                                </div>
                                                <div>
                                                    <label className="text-xs block font-medium">Min Amount</label>
                                                    <input type="number" {...regProg("min_loan_amount", { required: true })} className="w-full p-2 border rounded text-sm" />
                                                </div>
                                                <div>
                                                    <label className="text-xs block font-medium">Max Amount</label>
                                                    <input type="number" {...regProg("max_loan_amount", { required: true })} className="w-full p-2 border rounded text-sm" />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-xs block font-medium mb-2">Eligibility Rules</label>
                                                {fields.map((field, index) => (
                                                    <div key={field.id} className="flex gap-2 mb-2 items-center">
                                                        <select {...regProg(`policies.${index}.criteria_type` as const)} className="p-2 border rounded text-sm flex-1">
                                                            <option value="fico_score">FICO Score</option>
                                                            <option value="years_in_business">Years in Business</option>
                                                            <option value="annual_revenue">Annual Revenue</option>
                                                            <option value="state">State</option>
                                                            <option value="industry">Industry</option>
                                                        </select>
                                                        <select {...regProg(`policies.${index}.operator` as const)} className="p-2 border rounded text-sm w-20">
                                                            <option value=">=">&ge;</option>
                                                            <option value=">">&gt;</option>
                                                            <option value="<=">&le;</option>
                                                            <option value="<">&lt;</option>
                                                            <option value="==">=</option>
                                                            <option value="!=">&ne;</option>
                                                            <option value="in">in</option>
                                                        </select>
                                                        <input {...regProg(`policies.${index}.value` as const)} className="p-2 border rounded text-sm flex-1" placeholder="Value" />
                                                        <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                                                    </div>
                                                ))}
                                                <button type="button" onClick={() => append({ criteria_type: 'fico_score', operator: '>=', value: 0 })} className="text-xs text-blue-600 mt-1">+ Add Rule</button>
                                            </div>

                                            <div className="flex justify-end gap-2 pt-2">
                                                <button type="button" onClick={() => setShowNewProgramForm(null)} className="px-3 py-1 text-sm border rounded">Cancel</button>
                                                <button type="submit" className="px-3 py-1 text-sm bg-blue-600 text-white rounded flex items-center">
                                                    <Save size={14} className="mr-1" /> Save Program
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PolicyManager;
