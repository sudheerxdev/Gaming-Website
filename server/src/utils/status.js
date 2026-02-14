const getTournamentStatus = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) {
    return 'Upcoming';
  }

  if (now >= start && now <= end) {
    return 'Live';
  }

  return 'Completed';
};

module.exports = { getTournamentStatus };
