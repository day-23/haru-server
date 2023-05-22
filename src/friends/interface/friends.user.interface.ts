

export interface SnsBaseUser{
    id: string,
    name: string,
    email: string,
    profileImage: string,
}



export interface GetSnsBaseUserByPaginationDto{
    data: SnsBaseUser[],
    pagination: {
        totalItems: number,
        itemsPerPage: number,
        currentPage: number,
        totalPages: number,
    },
}
