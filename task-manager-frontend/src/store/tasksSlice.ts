import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as taskService from '../services/taskService';
import { Task } from '../types/Task';

interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  filters: any;
  sortConfig: { key: keyof Task; direction: 'asc' | 'desc' } | null;
  page: number;
  rowsPerPage: number;
}

const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
  filters: {},
  sortConfig: null,
  page: 0,
  rowsPerPage: 10,
};

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async (_, thunkAPI) => {
  try {
    return await taskService.getAllTasks();
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<any>) {
      state.filters = action.payload;
    },
    setSortConfig(state, action: PayloadAction<{ key: keyof Task; direction: 'asc' | 'desc' } | null>) {
      state.sortConfig = action.payload;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setRowsPerPage(state, action: PayloadAction<number>) {
      state.rowsPerPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.tasks = action.payload;
        state.loading = false;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, setSortConfig, setPage, setRowsPerPage } = tasksSlice.actions;
export default tasksSlice.reducer; 