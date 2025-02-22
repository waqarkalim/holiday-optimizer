import React, { useState } from 'react';
import { parse } from 'date-fns';
import MonthCalendarSelector from '../MonthCalendarSelector';

const OptimizerForm: React.FC = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const handleDateSelect = (date: Date) => {
    // Implementation of handleDateSelect
  };

  return (
    <div>
      <MonthCalendarSelector
        selectedDates={holidays.map(holiday => parse(holiday.date, 'yyyy-MM-dd', new Date()))}
        onDateSelect={handleDateSelect}
        month={currentMonth}
        year={currentYear}
      />
    </div>
  );
};

export default OptimizerForm; 