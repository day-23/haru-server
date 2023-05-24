
export interface InitialUpdateProfileResponse{
    user : {
        id : string;
        name: string;
        introduction: string;
        profileImage: string;
        postCount: number;
        friendCount: number;
        friendStatus: number;
        isPublicAccount: boolean;
    }
    // 개인 설정
    haruId: string;
    email : string;
    socialAccountType: string;
    isPostBrowsingEnabled: boolean;
    isAllowFeedLike: number;
    isAllowFeedComment: number;
    isAllowSearch : boolean;
    createdAt: Date;
}