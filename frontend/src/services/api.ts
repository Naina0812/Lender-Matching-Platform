import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const submitApplication = async (data: any) => {
    const response = await api.post('/applications/submit', data);
    return response.data;
};

export const getApplications = async () => {
    const response = await api.get('/applications/');
    return response.data;
};

export const getApplication = async (id: string) => {
    const response = await api.get(`/applications/${id}`);
    return response.data;
};

export const deleteApplication = async (id: string) => {
    await api.delete(`/applications/${id}`);
};

export const getApplicationMatches = async (id: string) => {
    const response = await api.get(`/applications/${id}/matches`);
    return response.data;
};

export const getLenders = async () => {
    const response = await api.get('/lenders/');
    return response.data;
};

export const createLender = async (data: any) => {
    const response = await api.post('/lenders/', data);
    return response.data;
};

export const createProgram = async (lenderId: string, data: any) => {
    const response = await api.post(`/lenders/${lenderId}/programs`, data);
    return response.data;
};
