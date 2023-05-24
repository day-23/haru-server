

export interface SnsBaseFriend{
    id: string,
    name: string,
    profileImage: string,
    friendStatus : number,
    createdAt : Date
}



export interface GetSnsBaseFriendsByPaginationDto{
    data: SnsBaseFriend[],
    pagination: {
        totalItems: number,
        itemsPerPage: number,
        currentPage: number,
        totalPages: number,
    },
}
