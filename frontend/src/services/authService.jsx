
import { axiosInstance } from "../lib/axios.js";

export const authService = {
    checkAuth: () => axiosInstance.get("/auth/check"),

    signup: (data) => axiosInstance.post("/auth/signup", data),

    login: (data) => axiosInstance.post("/auth/login", data),

    logout: () => axiosInstance.post("/auth/logout"),

 
    updateProfile: (data) => axiosInstance.put("/auth/update-profile", data),
};