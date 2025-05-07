import { createSlice } from "@reduxjs/toolkit";
const getUserFromLocalStorage = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};
const getTokenFromLocalStorage = () => {
  return localStorage.getItem("token") || "";
};
const saveUserToLocalStorage = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};
const saveTokenToLocalStorage = (token) => {
  localStorage.setItem("token", token);
};
const removeAuthDataFromLocalStorage = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
};
const initialState = {
  token: getTokenFromLocalStorage(),
  user: getUserFromLocalStorage(),
  isAuthenticated: !!getTokenFromLocalStorage(),
};
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      saveUserToLocalStorage(action.payload.user);
      saveTokenToLocalStorage(action.payload.token);
    },
    logout: (state) => {
      state.token = "";
      state.user = null;
      state.isAuthenticated = false;
      removeAuthDataFromLocalStorage();
    },
  },
});
export const { login, logout } = authSlice.actions;
export default authSlice.reducer;