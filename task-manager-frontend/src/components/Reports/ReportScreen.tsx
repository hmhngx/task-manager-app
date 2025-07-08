import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  TablePagination,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Download as DownloadIcon, NavigateNext as NextIcon, NavigateBefore as PrevIcon } from '@mui/icons-material';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { Task } from '../../types/Task';
import AestheticSelect from '../ui/AestheticSelect';

const statusColors: Record<string, string> = {
  done: 'bg-green-100 text-green-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  late: 'bg-red-100 text-red-700',
  todo: 'bg-gray-200 text-gray-700',
  pending_approval: 'bg-orange-100 text-orange-700',
};

const priorityColors: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

// Icon helper functions
const getAllTypesIcon = () => (
  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
);

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'todo':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      );
    case 'pending_approval':
      return (
        <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'in_progress':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'done':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      );
    case 'late':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
    default:
      return null;
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'task':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      );
    case 'bug':
      return (
        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
    case 'feature':
      return (
        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    case 'subtask':
      return (
        <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      );
    default:
      return null;
  }
};

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'low':
      return (
        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case 'medium':
      return (
        <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case 'high':
      return (
        <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case 'urgent':
      return (
        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    default:
      return null;
  }
};

const ReportScreen: React.FC = () => {
  const [startDate, setStartDate] = useState(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState(dayjs());
  const [taskType, setTaskType] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/reports/tasks`, {
        params: {
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD'),
          type: taskType,
          status: status,
          priority: priority,
        },
      });
      setTasks(response.data);
    } catch (err) {
      setError('Failed to fetch tasks. Please try again.');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [startDate, endDate, taskType, status, priority]);

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(tasks);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tasks');
    XLSX.writeFile(workbook, `task_report_${dayjs().format('YYYY-MM-DD_HH-mm')}.xlsx`);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedTasks = tasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen py-8 px-2 md:px-4">
      <Container maxWidth="lg">
        <Paper className="shadow-xl rounded-2xl border border-blue-100" sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-extrabold mb-6">
            Task Reports
          </Typography>

          {/* Filters */}
          <Box className="mb-8 flex flex-wrap gap-4 items-center bg-white/80 backdrop-blur-md rounded-xl shadow px-6 py-4 border border-blue-100" sx={{ position: 'relative', zIndex: 10 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue || dayjs().subtract(30, 'day'))}
                className="w-40"
                slotProps={{
                  textField: {
                    size: 'small',
                    variant: 'outlined',
                    className: 'bg-white rounded-lg',
                  },
                }}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue || dayjs())}
                className="w-40"
                slotProps={{
                  textField: {
                    size: 'small',
                    variant: 'outlined',
                    className: 'bg-white rounded-lg',
                  },
                }}
              />
            </LocalizationProvider>

            <AestheticSelect
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'todo', label: 'Todo', icon: getStatusIcon('todo') },
                { value: 'pending_approval', label: 'Pending Approval', icon: getStatusIcon('pending_approval') },
                { value: 'in_progress', label: 'In Progress', icon: getStatusIcon('in_progress') },
                { value: 'done', label: 'Done', icon: getStatusIcon('done') },
                { value: 'late', label: 'Late', icon: getStatusIcon('late') }
              ]}
              value={status}
              onChange={setStatus}
              placeholder="All Statuses"
              size="sm"
              variant="filled"
              className="w-40"
            />
            
            <AestheticSelect
              options={[
                { value: '', label: 'All Priorities' },
                { value: 'low', label: 'Low', icon: getPriorityIcon('low') },
                { value: 'medium', label: 'Medium', icon: getPriorityIcon('medium') },
                { value: 'high', label: 'High', icon: getPriorityIcon('high') },
                { value: 'urgent', label: 'Urgent', icon: getPriorityIcon('urgent') }
              ]}
              value={priority}
              onChange={setPriority}
              placeholder="All Priorities"
              size="sm"
              variant="filled"
              className="w-40"
            />
            
            <AestheticSelect
              options={[
                { value: '', label: 'All Types' },
                { value: 'task', label: 'Task', icon: getTypeIcon('task') },
                { value: 'bug', label: 'Bug', icon: getTypeIcon('bug') },
                { value: 'feature', label: 'Feature', icon: getTypeIcon('feature') },
                { value: 'subtask', label: 'Subtask', icon: getTypeIcon('subtask') }
              ]}
                value={taskType}
              onChange={setTaskType}
              placeholder="All Types"
              size="sm"
              variant="filled"
              className="w-40"
            />

            <Button
              variant="contained"
              color="primary"
              onClick={handleExport}
              disabled={tasks.length === 0}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg py-3 px-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              startIcon={<DownloadIcon />}
            >
              Export to Excel
            </Button>
          </Box>

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <div className="overflow-x-auto">
              <TableContainer className="rounded-xl bg-white/90 backdrop-blur-sm border border-blue-100 shadow-lg" sx={{ position: 'relative', zIndex: 1 }}>
                <Table>
                  <TableHead>
                    <TableRow className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 z-0 border-b border-blue-200">
                      <TableCell className="text-center font-semibold py-3 text-indigo-700">No.</TableCell>
                      <TableCell className="font-semibold py-3 text-indigo-700">Title</TableCell>
                      <TableCell className="font-semibold py-3 text-indigo-700">Description</TableCell>
                      <TableCell className="font-semibold py-3 text-indigo-700">Status</TableCell>
                      <TableCell className="font-semibold py-3 text-indigo-700">Priority</TableCell>
                      <TableCell className="font-semibold py-3 text-indigo-700">Type</TableCell>
                      <TableCell className="text-right font-semibold py-3 text-indigo-700">Due Date</TableCell>
                      <TableCell className="text-right font-semibold py-3 text-indigo-700">Created At</TableCell>
                      <TableCell className="text-right font-semibold py-3 text-indigo-700">Updated At</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedTasks.map((task, idx) => (
                      <TableRow key={task._id} className={`${idx % 2 === 1 ? 'bg-blue-50/50' : 'bg-white'} hover:bg-blue-100/50 transition-colors duration-150 border-b border-blue-100`}>
                        <TableCell className="text-center py-1.5">{page * rowsPerPage + idx + 1}</TableCell>
                        <TableCell className="py-1.5">{task.title}</TableCell>
                        <TableCell className="py-1.5">{task.description}</TableCell>
                        <TableCell className="py-1.5">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(task.status)}
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[task.status] || 'bg-gray-200 text-gray-700'}`}>
                              {task.status.replace('_', ' ')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-1.5">
                          <div className="flex items-center space-x-2">
                            {getPriorityIcon(task.priority)}
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityColors[task.priority] || 'bg-gray-200 text-gray-700'}`}>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-1.5">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(task.type)}
                            <span className="text-sm font-medium">{task.type.charAt(0).toUpperCase() + task.type.slice(1)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right py-1.5">{task.deadline ? dayjs(task.deadline).format('YYYY-MM-DD') : '-'}</TableCell>
                        <TableCell className="text-right py-1.5">{dayjs(task.createdAt).format('YYYY-MM-DD HH:mm')}</TableCell>
                        <TableCell className="text-right py-1.5">{dayjs(task.updatedAt).format('YYYY-MM-DD HH:mm')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Box className="flex items-center justify-between p-4">
                  <span className="text-gray-600 font-bold">{tasks.length} tasks found</span>
                  <TablePagination
                    component="div"
                    count={tasks.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    labelDisplayedRows={() => ''}
                    ActionsComponent={({ count, page, rowsPerPage, onPageChange }) => (
                      <div className="flex items-center gap-2">
                        <Button 
                          onClick={(e) => onPageChange && onPageChange(e, page - 1)} 
                          disabled={page === 0} 
                          size="small"
                          className="min-w-0 p-1"
                        >
                          <PrevIcon />
                        </Button>
                        <Button 
                          onClick={(e) => onPageChange && onPageChange(e, page + 1)} 
                          disabled={page >= Math.ceil(count / rowsPerPage) - 1} 
                          size="small"
                          className="min-w-0 p-1"
                        >
                          <NextIcon />
                        </Button>
                      </div>
                    )}
                  />
                </Box>
              </TableContainer>
            </div>
          )}
        </Paper>
      </Container>
    </div>
  );
};

export default ReportScreen; 