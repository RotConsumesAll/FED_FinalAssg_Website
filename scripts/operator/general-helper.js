const dateFormatOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
};

export function getCurrentDate() {
  // see https://www.freecodecamp.org/news/javascript-get-current-date-todays-date-in-js/
  const date = new Date();

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `${year}-${month}-${day}`;
}

export function findValidRecord(inspectionRecords) {
  if (!inspectionRecords) {
    return null;
  }
  for (const record of Object.values(inspectionRecords)) {
    const expiryDate = Date.parse(record.gradeExpiry);
    const currentDate = getCurrentDate();
    if (Date.parse(currentDate) <= expiryDate) {
      return record;
    }
  }
}

export function isValid(expiryDateString) {
  const expiryDate = Date.parse(expiryDateString);
  const currentDate = getCurrentDate();
  return Date.parse(currentDate) <= expiryDate;
}

export function calculateAverage(list) {
  let sum = 0;
  for (const element of list) {
    sum += element;
  }
  return sum / list.length;
}

export function calcualteDifferenceInMonths(startDate, endDate) {
  let difference = (endDate.getTime() - startDate.getTime()) / 1000;
  difference /= 60 * 60 * 24 * 7 * 4;
  return Math.abs(Math.round(difference));
}

export function formateDateToLocal(date) {
  return date.toLocaleDateString("en-SG", dateFormatOptions);
}

export function roundTo2DecimalPlaces(number) {
  return Math.round(number * 10) / 10;
}

// from https://stackoverflow.com/questions/36787908/how-to-check-if-date-is-in-this-week-in-javascript
export function isDateInThisWeek(date) {
  const todayObj = new Date();
  const todayDate = todayObj.getDate();
  const todayDay = todayObj.getDay();

  // get first date of week
  const firstDayOfWeek = new Date(todayObj.setDate(todayDate - todayDay));

  // get last date of week
  const lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);

  // if date is equal or within the first and last dates of the week
  return date >= firstDayOfWeek && date <= lastDayOfWeek;
}
