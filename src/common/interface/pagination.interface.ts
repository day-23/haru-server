export interface Pagination {
    totalItems: number,
    itemsPerPage: number,
    currentPage: number,
    totalPages: number
}

export interface PaginationByDate {
    totalItems: number,
    startDate: string,
    endDate: string
}