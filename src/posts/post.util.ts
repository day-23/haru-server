export function calculateSkip(page: number, limit: number) {
    let skip = (page - 1) * limit - 1;
    
    skip = Math.max(0, skip);
    return skip;
}