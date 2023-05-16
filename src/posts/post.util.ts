export function calculateSkip(page: number, limit: number) {
    let skip = (page - 1) * limit;
    skip = Math.max(0, skip);
    return skip;
}