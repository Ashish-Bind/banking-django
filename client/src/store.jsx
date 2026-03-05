import { configureStore } from "@reduxjs/toolkit";
import userReducer from './store/userSlice'
import authReducer from  './store/authSlice'
import customerSlice from  './store/customerSlice'
import employeeSlice from './store/employeeSlice'
import notificationSlice from './store/notificationSlice'
import { authApi } from "./api/authApi";
import { customerApi } from "./api/customerApi";
import { employeeApi } from "./api/employeeApi";
import { notificationsApi } from "./api/notificationsApi";

export const store  = configureStore({
    reducer:{
        auth:authReducer,
        customer: customerSlice,
        employee: employeeSlice,
        notifications: notificationSlice,
        [authApi.reducerPath]: authApi.reducer,
        [customerApi.reducerPath]: customerApi.reducer,
        [employeeApi.reducerPath]: employeeApi.reducer,
        [notificationsApi.reducerPath]: notificationsApi.reducer,
    },
    middleware:(getDefaultMiddleware) => 
        getDefaultMiddleware().concat(authApi.middleware, customerApi.middleware, employeeApi.middleware, notificationsApi.middleware)
})

