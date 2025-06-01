// import { createSlice } from "@reduxjs/toolkit";
// const getUserFromLocalStorage = () => {
//   const user = localStorage.getItem("user");
//   return user ? JSON.parse(user) : null;
// };
// const getTokenFromLocalStorage = () => {
//   return localStorage.getItem("token") || "";
// };
// const saveUserToLocalStorage = (user) => {
//   localStorage.setItem("user", JSON.stringify(user));
// };
// const saveTokenToLocalStorage = (token) => {
//   localStorage.setItem("token", token);
// };
// const removeAuthDataFromLocalStorage = () => {
//   localStorage.removeItem("user");
//   localStorage.removeItem("token");
// };
// const initialState = {
//   token: getTokenFromLocalStorage(),
//   user: getUserFromLocalStorage(),
//   isAuthenticated: !!getTokenFromLocalStorage(),
// };
// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     login: (state, action) => {
//       state.token = action.payload.token;
//       state.user = action.payload.user;
//       state.isAuthenticated = true;
//       saveUserToLocalStorage(action.payload.user);
//       saveTokenToLocalStorage(action.payload.token);
//     },
//     logout: (state) => {
//       state.token = "";
//       state.user = null;
//       state.isAuthenticated = false;
//       removeAuthDataFromLocalStorage();
//     },
//   },
// });
// export const { login, logout } = authSlice.actions;
// export default authSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

// Helper: Get user from localStorage
const getUserFromLocalStorage = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// Helper: Get token from localStorage
const getTokenFromLocalStorage = () => {
  return localStorage.getItem("token") || "";
};

// Helper: Get token expiry from localStorage
const getTokenExpiryFromLocalStorage = () => {
  const expiry = localStorage.getItem("tokenExpiry");
  return expiry ? parseInt(expiry, 10) : null;
};

// Helper: Save user to localStorage
const saveUserToLocalStorage = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

// Helper: Save token to localStorage
const saveTokenToLocalStorage = (token) => {
  localStorage.setItem("token", token);
};

// Helper: Save token expiry to localStorage
const saveTokenExpiryToLocalStorage = (expiry) => {
  localStorage.setItem("tokenExpiry", expiry.toString());
};

// Helper: Remove all auth data
const removeAuthDataFromLocalStorage = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("tokenExpiry");
};

// Initial state
const initialState = {
  token: getTokenFromLocalStorage(),
  user: getUserFromLocalStorage(),
  tokenExpiry: getTokenExpiryFromLocalStorage(),
  isAuthenticated: !!getTokenFromLocalStorage(),
};

// Redux slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      const { token, user } = action.payload;

      const thirtyDaysInMs = 30*24*60*1000;
      const expiry = Date.now() + thirtyDaysInMs;

      state.token = token;
      state.user = user;
      state.tokenExpiry = expiry;
      state.isAuthenticated = true;

      saveUserToLocalStorage(user);
      saveTokenToLocalStorage(token);
      saveTokenExpiryToLocalStorage(expiry);
    },
    logout: (state) => {
      state.token = "";
      state.user = null;
      state.tokenExpiry = null;
      state.isAuthenticated = false;
      removeAuthDataFromLocalStorage();
    },
  },
});

// Export actions
export const { login, logout } = authSlice.actions;

// Export helpers to use in other files
export {
  getUserFromLocalStorage,
  getTokenFromLocalStorage,
  getTokenExpiryFromLocalStorage,
  saveUserToLocalStorage,
  saveTokenToLocalStorage,
  saveTokenExpiryToLocalStorage,
  removeAuthDataFromLocalStorage,
};

// Export reducer
export default authSlice.reducer;
