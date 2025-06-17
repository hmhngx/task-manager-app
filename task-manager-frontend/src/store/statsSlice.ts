import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getWeeklyStats, getMonthlyStats } from '../services/taskService';
import { TaskStats } from '../types/Task';

interface StatsState {
  weekly: TaskStats | null;
  monthly: TaskStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: StatsState = {
  weekly: null,
  monthly: null,
  loading: false,
  error: null,
};

export const fetchStats = createAsyncThunk('stats/fetchStats', async (_, thunkAPI) => {
  try {
    const [weekly, monthly] = await Promise.all([getWeeklyStats(), getMonthlyStats()]);
    return { weekly, monthly };
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.weekly = action.payload.weekly;
        state.monthly = action.payload.monthly;
        state.loading = false;
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default statsSlice.reducer; 