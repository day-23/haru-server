export function fromYYYYMMDDToDate(dateString: string): Date {
    const year = parseInt(dateString.substring(0, 4));
    const month = parseInt(dateString.substring(4, 6)) - 1; // January is 0
    const day = parseInt(dateString.substring(6, 8));

    const date = new Date(Date.UTC(year, month, day));
    date.setTime(date.getTime() - 86400000); // subtract one day in milliseconds (86400000 ms = 1 day)
    return date;
}


export function fromYYYYMMDDAddOneDayToDate(dateString: string): Date {
    const year = parseInt(dateString.substring(0, 4));
    const month = parseInt(dateString.substring(4, 6)) - 1; // January is 0
    const day = parseInt(dateString.substring(6, 8));

    const date = new Date(Date.UTC(year, month, day));
    date.setDate(date.getDate() + 1);

    return date;
}


export function getDatePlusMinusOneDay(date: Date): {minusOneDay:Date, plusOneDay:Date }{
    //minuse one day from changedDate and return to another variable , and changeDate has original date
    const minusOneDay = new Date(date)
    minusOneDay.setDate(minusOneDay.getDate() - 1)
    //add One Day to changedDate and return to another variable, and changedDate has original date
    const plusOneDay = new Date(date)
    plusOneDay.setDate(plusOneDay.getDate() + 1)
    return {minusOneDay, plusOneDay};
}