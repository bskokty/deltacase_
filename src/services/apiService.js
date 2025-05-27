import axios from 'axios';

const apiClient = axios.create({
	                               baseURL: import.meta.env.VITE_API_BASE_URL,
	                               headers: {
		                               'Content-Type': 'application/json',
	                               },
                               });

export const get = async (endpoint, params = {}) => {
	try {
		const response = await apiClient.get(endpoint, { params });
		return response.data;
	} catch (error) {
		console.error(`GET ${endpoint} isteği başarısız:`, error);
		throw error;
	}
};

export const post = async (endpoint, data) => {
	try {
		const response = await apiClient.post(endpoint, data);
		return response.data;
	} catch (error) {
		console.error(`POST ${endpoint} isteği başarısız:`, error);
		throw error;
	}
};

export const put = async (endpoint, data) => {
	try {
		const response = await apiClient.put(endpoint, data);
		return response.data;
	} catch (error) {
		console.error(`PUT ${endpoint} isteği başarısız:`, error);
		throw error;
	}
};

export const del = async (endpoint) => {
	try {
		const response = await apiClient.delete(endpoint);
		return response.data;
	} catch (error) {
		console.error(`DELETE ${endpoint} isteği başarısız:`, error);
		throw error;
	}
};
