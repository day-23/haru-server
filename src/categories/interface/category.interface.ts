
export interface BaseCategory{
    id: string,
    content: string,
    color : string
    categoryOrder : number,
    isSelected : boolean
}

export interface BaseCategoryForScheduleResponse{
    id: string,
    content: string,
    color : string
}