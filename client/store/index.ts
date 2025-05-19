import { configureStore } from '@reduxjs/toolkit';
import { libraryApi } from './api/libraryApi';

const store = configureStore({
  reducer: {
    [libraryApi.reducerPath]: libraryApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    })
    .concat(libraryApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;