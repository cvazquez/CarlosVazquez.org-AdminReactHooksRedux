import rootReducer from "./reducer";
import { configureStore } from "@reduxjs/toolkit";

const 	store = configureStore({
    reducer: rootReducer,
    // eslint-disable-next-line
    devTools: process.env.NODE_ENV !== 'production',
});

export default store;