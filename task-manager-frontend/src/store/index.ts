import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from './tasksSlice';
import statsReducer from './statsSlice';
import { useDispatch } from 'react-redux';

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    stats: statsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch; 