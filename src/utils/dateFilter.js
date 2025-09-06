// utils/dateFilter.js
function getDateRange(start_date, end_date) {
  if (start_date && end_date) {
    return { start_date, end_date };
  }

  // default: current month
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    start_date: firstDay.toISOString().split("T")[0],
    end_date: lastDay.toISOString().split("T")[0],
  };
}

module.exports = getDateRange;