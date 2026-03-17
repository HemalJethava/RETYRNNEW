import axios from "axios";
import { BASE_URL } from "../config/BaseUrl";
import { resetToLogin } from "./resetToLoginHelper";

const Api = axios.create({
	withCredentials: true,
	baseURL: BASE_URL,
	timeout: 30000,
});

const getUserToken = () => {
	return (token = global.userToken);
};

// Without token post method call
const getAuthPostHeader = () => {
	const authHeaders = {
		Accept: "application/json",
		"Content-Type": "application/json",
	};
	return authHeaders;
};

// With token post method call
const getPostHeader = () => {
	const token = getUserToken();
	const userHeader = {
		Authorization: `Bearer ${token}`,
		Accept: "application/json",
		"Content-Type": "application/json",
	};
	return userHeader;
};

// With token for form data header method call
const getPostFormDataHeader = () => {
	const token = getUserToken();
	const userHeader = {
		Authorization: `Bearer ${token}`,
		Accept: "application/json",
		"Content-Type": "multipart/form-data",
	};
	return userHeader;
};

// Without token get method call
const getAuthHeader = () => {
	const authHeaders = {
		Accept: "application/json",
		"Content-Type": "application/json",
	};
	return authHeaders;
};

// With token get method call
const getHeader = () => {
	const token = getUserToken();
	const userHeader = {
		Authorization: `Bearer ${token}`,
		Accept: "application/json",
		"Content-Type": "application/json",
	};
	return userHeader;
};

// Request interceptor for API calls

Api.interceptors.request.use(
	(request) => {
		console.log("---Request API--->", request.url);

		if (request.method === "get") {
			if (request.url === "") {
				request.headers = getAuthHeader();
			} else {
				request.headers = getHeader();
			}

			// Calling get method here
		} else if (request.method === "post") {
			if (
				request.url === "user/login" ||
				request.url === "user/send-otp" ||
				request.url === "user/register" ||
				request.url === "user/save-login-info"
			) {
				request.headers = getAuthPostHeader();
			}
			if (
				request.url === "user/create-pass" ||
				request.url === "user/report-incident" ||
				request.url === "user/claim-talk" ||
				request.url === "user/edit-profile" ||
				request.url === "user/add-trusted-contact"
			) {
				request.headers = getPostFormDataHeader();
			} else {
				request.headers = getPostHeader();
			}
		}

		return request;
	},
	(error) => {
		Promise.reject(error);
	}
);

// Response interceptor for API calls
Api.interceptors.response.use(
	(response) => {
		console.log("++++API Res ++++->", response.data);

		return response.data;
	},
	async (error) => {
		console.log("----API Error---->", JSON.stringify(error.message));
		if (error.response.status === 401) {
			await resetToLogin();
		} else if (error.response.status === 403) {
			return error.response;
		} else if (error.response.status === 404) {
			return error.response.data;
		} else if (error.response.status === 500) {
			return error;
		}
		return error.response;
	}
);

export default Api;
