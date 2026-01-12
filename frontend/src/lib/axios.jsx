import axios from "axios";


export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" 
    ? "http://localhost:8000/api" 
    : "/api",
  
  timeout: 10000, 
  
  withCredentials: true,
});


axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Session expired or unauthorized access.");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;