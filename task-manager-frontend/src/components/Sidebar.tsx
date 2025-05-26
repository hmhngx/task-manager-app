import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

interface SidebarProps {
  selectedDate: Date | null;
  setSelectedDate: (date: Date) => void;
  tasksLeft: number;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedDate, setSelectedDate, tasksLeft }) => {
  return (
    <aside className="bg-white rounded-2xl shadow p-6 flex flex-col gap-6 min-w-[320px] max-w-xs">
      {/* Greeting */}
      <div className="flex items-center gap-4 bg-blue-50 rounded-xl p-4">
        {/* Placeholder for icon */}
        <div className="bg-blue-100 rounded-lg p-2">
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2l4 -4" /></svg>
        </div>
        <div>
          <div className="font-semibold text-gray-800">Hi, Karen!</div>
          <div className="text-xs text-gray-500">
            You have <span className="font-bold text-blue-600">{tasksLeft} tasks</span> left for today.<br />Already completed 3 Tasks today.
          </div>
        </div>
      </div>
      {/* Calendar */}
      <div className="bg-white rounded-xl p-2 shadow-sm">
        <Calendar
          onChange={date => setSelectedDate(date as Date)}
          value={selectedDate}
          className="mx-auto border-0"
          tileClassName={({ date }) =>
            date.toDateString() === (selectedDate ? selectedDate.toDateString() : '')
              ? 'bg-blue-100 text-blue-700 rounded-full' : ''
          }
        />
      </div>
    </aside>
  );
};

export default Sidebar; 