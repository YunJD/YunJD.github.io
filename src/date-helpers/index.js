import { isMonday, previousMonday, parseISO, formatISO } from 'date-fns'

export const holidays = {
  ca: {
    on: [
      ['2023-01-02', "New Year's Day"],
      ['2023-02-20', 'Family Day'],
      ['2023-04-07', 'Good Friday'],
      ['2023-05-22', 'Victoria Day'],
      ['2023-07-03', 'Canada Day'],
      ['2023-08-07', 'Civic Holiday'],
      ['2023-09-04', 'Labour Day'],
      ['2023-10-09', 'Thanksgiving Day'],
      ['2023-11-13', 'Remembrance Day'],
      ['2023-12-25', 'Christmas Day'],
      ['2023-12-26', 'Boxing Day'],
      ['2024-01-01', "New Year's Day"],
      ['2024-02-19', 'Family Day'],
      ['2024-04-29', 'Good Friday'],
      ['2024-05-20', 'Victoria Day'],
      ['2024-07-01', 'Canada Day'],
      ['2024-08-05', 'Civic Holiday'],
      ['2024-09-02', 'Labour Day'],
      ['2024-10-14', 'Thanksgiving Day'],
      ['2024-11-11', 'Remembrance Day'],
      ['2024-12-25', 'Christmas Day'],
      ['2024-12-26', 'Boxing Day'],
      ['2025-01-01', "New Year's Day"],
      ['2025-02-17', 'Family Day'],
      ['2025-04-18', 'Good Friday'],
      ['2025-05-19', 'Victoria Day'],
      ['2025-07-01', 'Canada Day'],
      ['2025-08-04', 'Civic Holiday'],
      ['2025-09-01', 'Labour Day'],
      ['2025-10-13', 'Thanksgiving Day'],
      ['2025-11-11', 'Remembrance Day'],
      ['2025-12-25', 'Christmas Day'],
      ['2025-12-26', 'Boxing Day'],
    ],
  },
}

export const holidaysByWeek = {
  ca: {
    on: holidays.ca.on.reduce((accDateMap, [dateStr, holiday]) => {
      const weekDate = parseISO(dateStr)

      const weekDateStr = !isMonday(weekDate)
        ? formatISO(previousMonday(parseISO(dateStr)), { representation: 'date' })
        : dateStr

      accDateMap[weekDateStr] = accDateMap[weekDateStr] || []
      accDateMap[weekDateStr].push([dateStr, holiday])
      return accDateMap
    }, {}),
  },
}
