


export interface RawPost{
    id: string,
    content: string,
    template_id: string | null,
    template_text_color : string | null,
    created_at: Date,
    updated_at: Date,
    deleted_at: Date | null,
    user_id: string,
    name: string,
    email: string,
    profile_image_url: string | null,
    is_allow_feed_like : number,
    is_allow_feed_comment : number,
    friend_status : number,
}

export interface RawHashTag{
    post_id: string,
    hashtag_id: string,
    content: string,
    post_tags_created_at: Date
}

export interface RawImage{
    post_id: string,
    image_id: string,
    image_original_name: string,
    image_url: string,
    image_mime_type: string,
    image_created_at: Date
}