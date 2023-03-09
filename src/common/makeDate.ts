export function fromYYYYMMDDToDate(dateString: string): Date {
    const year = parseInt(dateString.substring(0, 4));
    const month = parseInt(dateString.substring(4, 6)) - 1; // January is 0
    const day = parseInt(dateString.substring(6, 8));
  
    return new Date(Date.UTC(year, month, day));
  }
  

export function fromYYYYMMDDAddOneDayToDate(dateString: string): Date {
    const year = parseInt(dateString.substring(0, 4));
    const month = parseInt(dateString.substring(4, 6)) - 1; // January is 0
    const day = parseInt(dateString.substring(6, 8));
  
    const date = new Date(Date.UTC(year, month, day));
    date.setDate(date.getDate() + 1);
  
    return date;
  }