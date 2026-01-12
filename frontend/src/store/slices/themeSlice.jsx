import { createSlice } from "@reduxjs/toolkit";

const themeSlice = createSlice({
  name: "theme",
  initialState: {
    theme: localStorage.getItem("chat-theme") || "night",
  },
  reducers: {
    setTheme: (state, action) => {
      const newTheme = action.payload;

      // Update State
      state.theme = newTheme;

      // Persist to LocalStorage
      localStorage.setItem("chat-theme", newTheme);

      document.documentElement.setAttribute("data-theme", newTheme);
    },
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;