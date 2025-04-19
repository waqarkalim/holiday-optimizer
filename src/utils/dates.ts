// Handles Safari bug `new Date()` doesn't work properly
export const convertToDateObject = (inputDate: string) => {
  const [date, time] = inputDate.split(' ');
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute, seconds] = time.split(':').map(Number);

  return new Date(year, month - 1, day, hour, minute, seconds)
};