import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import TaskList from '../components/TaskList';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const TaskListPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { isAdmin } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Task Management</h1>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Filter by date"
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue)}
            slotProps={{
              textField: {
                fullWidth: true,
                className: 'bg-white',
              },
            }}
          />
        </LocalizationProvider>
      </div>
      <TaskList selectedDate={selectedDate} isAdmin={isAdmin} />
    </div>
  );
};

export default TaskListPage;
