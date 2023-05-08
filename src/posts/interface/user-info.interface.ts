export interface UserInfoResponse{
    id: string,
    name: string,
    introduction : string,
    profileImage: string,
    isFollowing: boolean,
    postCount: number,
    followerCount: number,
    followingCount: number,
}