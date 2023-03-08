/* 추후 수정해야함 */
export const makeDateApplyTimeZone = (date : string) => {
    // UTC + 9

    const utcOffsetInMinutes = 60 * 9;

    return new Date(new Date(date).getTime() + (utcOffsetInMinutes * 60000))
}