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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
import TextField from '@mui/material/TextField';

const statusColors: Record<string, string> = {
  done: 'bg-green-100 text-green-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  late: 'bg-red-100 text-red-700',
  todo: 'bg-gray-200 text-gray-700',
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

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/reports/tasks`, {
        params: {
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD'),
          type: taskType,
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
  }, [startDate, endDate, taskType]);

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
    <div className="bg-gray-100 min-h-screen py-8 px-2 md:px-4">
      <Container maxWidth="lg">
        <Paper className="shadow-md rounded-xl" sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom className="text-gray-800 font-extrabold">
            Task Reports
          </Typography>

          {/* Filters */}
          <Box className="mb-8 flex flex-wrap gap-4 items-end">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => newValue && setStartDate(newValue)}
                slotProps={{
                  textField: {
                    variant: 'outlined',
                    size: 'small',
                    className: 'shadow-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500',
                  },
                }}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => newValue && setEndDate(newValue)}
                slotProps={{
                  textField: {
                    variant: 'outlined',
                    size: 'small',
                    className: 'shadow-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500',
                  },
                }}
              />
            </LocalizationProvider>

            <FormControl sx={{ minWidth: 160 }} className="rounded-lg">
              <Select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                displayEmpty
                className="py-2 rounded-lg"
                renderValue={(selected) =>
                  selected
                    ? selected.charAt(0).toUpperCase() + selected.slice(1)
                    : <span className="text-gray-400">All types</span>
                }
              >
                <MenuItem value="">All types</MenuItem>
                <MenuItem value="bug">Bug</MenuItem>
                <MenuItem value="feature">Feature</MenuItem>
                <MenuItem value="task">Task</MenuItem>
                <MenuItem value="subtask">Subtask</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              color="primary"
              onClick={handleExport}
              disabled={tasks.length === 0}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 rounded-lg py-2 px-6 shadow"
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
              <TableContainer className="rounded-xl">
                <Table>
                  <TableHead>
                    <TableRow className="sticky top-0 bg-white z-10">
                      <TableCell className="text-center font-semibold py-2">No.</TableCell>
                      <TableCell className="font-semibold py-2">Title</TableCell>
                      <TableCell className="font-semibold py-2">Description</TableCell>
                      <TableCell className="font-semibold py-2">Status</TableCell>
                      <TableCell className="font-semibold py-2">Type</TableCell>
                      <TableCell className="text-right font-semibold py-2">Due Date</TableCell>
                      <TableCell className="text-right font-semibold py-2">Created At</TableCell>
                      <TableCell className="text-right font-semibold py-2">Updated At</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedTasks.map((task, idx) => (
                      <TableRow key={task._id} className={idx % 2 === 1 ? 'bg-gray-50' : ''}>
                        <TableCell className="text-center py-1.5">{page * rowsPerPage + idx + 1}</TableCell>
                        <TableCell className="py-1.5">{task.title}</TableCell>
                        <TableCell className="py-1.5">{task.description}</TableCell>
                        <TableCell className="py-1.5">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[task.status] || 'bg-gray-200 text-gray-700'}`}>
                            {task.status}
                          </span>
                        </TableCell>
                        <TableCell className="py-1.5">{task.type}</TableCell>
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