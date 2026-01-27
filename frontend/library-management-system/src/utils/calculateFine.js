export const calculateFine = (dueDate, returnDate = null) => {
  const due = new Date(dueDate);
  const returned = returnDate ? new Date(returnDate) : new Date();
  
  if (returned <= due) return 0;
  
  const daysOverdue = Math.ceil((returned - due) / (1000 * 60 * 60 * 24));
  const finePerDay = 1.00; // $1.00 per day
  return (daysOverdue * finePerDay).toFixed(2);
};

export const getDaysUntilDue = (dueDate) => {
  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};
