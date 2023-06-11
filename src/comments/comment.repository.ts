import { HttpException, HttpStatus } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateCommentDto, CreateImageCommentDto, UpdateCommentDto, UpdateCommentsByWriterDto } from "src/comments/dto/create.comment.dto";
import { ImageCommentCreateResponse, GetCommentsPaginationResponse, CommentCreateResponse } from "src/comments/interface/comment.interface";
import { PaginationDto, PostPaginationDto } from "src/common/dto/pagination.dto";
import { Comment } from "src/entity/comment.entity";
import { Post } from "src/entity/post.entity";
import { SnsBaseUser } from "src/posts/interface/post.interface";
import { calculateSkip } from "src/posts/post.util";
import { In, Repository } from "typeorm";

export class CommentRepository {
    constructor(@InjectRepository(Comment) private readonly repository: Repository<Comment>,
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
        private readonly configService: ConfigService) {
    }

    async createComment(userId: string, postId: string, createCommentDto: CreateCommentDto): Promise<CommentCreateResponse> {    
        const { content } = createCommentDto
        // Fetch the post from the database first
        const post = await this.postRepository.findOne({ where: { id: postId } });
        if (!post) {
            // If the post doesn't exist, throw an error
            throw new HttpException('해당 게시글을 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
        }

        const comment = this.repository.create({ user: { id: userId }, post: { id: postId }, content})

        const savedComment = await this.repository.save(comment)
        
        const ret = {
            id: savedComment.id,
            content: savedComment.content,
            createdAt: savedComment.createdAt,
            updatedAt: savedComment.updatedAt
        }
        return ret
    }

    async createImageComment(userId: string, postId: string, postImageId: string, createCommentDto: CreateImageCommentDto): Promise<ImageCommentCreateResponse> {    
        const { content, x, y } = createCommentDto
        
        // Fetch the post from the database first
        const post = await this.postRepository.findOne({ where: { id: postId } });
        if (!post) {
            // If the post doesn't exist, throw an error
            throw new HttpException('해당 게시글을 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
        }
        
        const comment = this.repository.create({ user: { id: userId }, post: { id: postId }, postImage: postImageId ? { id: postImageId } : null, content, x, y })
        const savedComment = await this.repository.save(comment)
        
        const ret = {
            id: savedComment.id,
            content: savedComment.content,
            x,
            y,
            isPublic : true,
            createdAt: savedComment.createdAt,
            updatedAt: savedComment.updatedAt
        }
        return ret
    }

    async getCommentsByPagination(userId: string, postId : string, paginationDto: PostPaginationDto): Promise<GetCommentsPaginationResponse> {
        const { page, limit, lastCreatedAt } = paginationDto;
        const skip = calculateSkip(page, limit)

        console.log(postId)
        const rawResult = await this.repository.manager.query(`
            SELECT 
            comment.id, 
            comment.content, 
            comment.x, 
            comment.y,
            comment.post_id,
            comment.is_public isPublic, 
            comment.created_at createdAt, 
            comment.updated_at updatedAt, 
            user.id AS userId, 
            user.name,
            user.profile_image_url AS profileImage
            FROM 
                comment
                LEFT JOIN user ON comment.user_id = user.id
            WHERE post_id = ?
            AND comment.created_at < ?
            ORDER BY
                comment.created_at DESC
            LIMIT ?, ?;
        `, [postId, lastCreatedAt, skip, limit]);

        const comments = rawResult.map(row => {
            return {
                id: row.id,
                user: {
                    id: row.userId,
                    name: row.name,
                    profileImage: row.profileImage,
                },
                content: row.content,
                x: row.x,
                y: row.y,
                isPublic : row.isPublic,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
            };
        });

        const rawCount = await this.repository.manager.query(`
            SELECT COUNT(*) as count FROM comment
            WHERE post_id = ?
        `, [postId]);
        const count = Number(rawCount[0].count)

        const totalPages = Math.ceil(count / limit);
        return {
            data: comments.map(comment => ({
                id: comment.id,
                user: comment.user,
                content: comment.content,
                x: comment.x,
                y: comment.y,
                isPublic : comment.isPublic ? true : false,
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt
            })),
            pagination: {
                totalItems: count,
                itemsPerPage: limit,
                currentPage: page,
                totalPages: totalPages,
            },
        };
    }


    async getRecentCommentsByPagination(userId: string, postId : string, postImageId : string): Promise<GetCommentsPaginationResponse> {
        const post = await this.postRepository.findOne({ where: { id: postId } })
        if(!post){
            throw new HttpException('해당 게시글을 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
        }

        console.log(post)
        let rawResult;
        if (post.templateTextColor) {
            rawResult = await this.repository.query(`
                SELECT ranked_comments.*, user.id user_id, user.name user_name, user.profile_image_url user_profile_image_url
                FROM (
                SELECT
                    comment.*,
                    ROW_NUMBER() OVER (PARTITION BY post_id ORDER BY created_at DESC) as row_num
                FROM comment
                WHERE is_public = true
                ) ranked_comments
                JOIN user ON ranked_comments.user_id = user.id
                WHERE (ranked_comments.row_num <= 10 OR ranked_comments.user_id = ?)
                AND post_id = ?
        `, [userId, postId]);
        } else {
            rawResult = await this.repository.query(`
                SELECT ranked_comments.*, user.id user_id, user.name user_name, user.profile_image_url user_profile_image_url
                FROM (
                SELECT
                    comment.*,
                    ROW_NUMBER() OVER (PARTITION BY post_image_id ORDER BY created_at DESC) as row_num
                FROM comment
                WHERE x IS NOT NULL AND is_public = true
                ) ranked_comments
                JOIN user ON ranked_comments.user_id = user.id
                WHERE (ranked_comments.row_num <= 10 OR ranked_comments.user_id = ?)
                AND post_image_id = ?
        `, [userId, postImageId]);
        }

        return rawResult.map((commentRow: any) => {
            const user: SnsBaseUser = {
                id: commentRow.user_id,
                name: commentRow.user_name,
                email: commentRow.user_email,
                profileImage: commentRow.user_profile_image_url
            };

            const comment = {
                id: commentRow.id,
                content: commentRow.content,
                x: commentRow.x,
                y: commentRow.y,
                user,
                createdAt: commentRow.created_at,
                updatedAt: commentRow.updated_at,
                deletedAt: commentRow.deleted_at
            }
            return comment;
        })
    }

    async getCommentsPerImageByPagination(userId: string, postId : string, postImageId : string, paginationDto: PostPaginationDto): Promise<GetCommentsPaginationResponse> {
        const { page, limit, lastCreatedAt } = paginationDto;
        const skip = calculateSkip(page, limit)
        
        const rawResult = await this.repository.manager.query(`
            SELECT 
            comment.id, 
            comment.content, 
            comment.x, 
            comment.y,
            comment.post_id,
            comment.is_public isPublic, 
            comment.created_at createdAt, 
            comment.updated_at updatedAt, 
            user.id AS userId, 
            user.name,
            user.profile_image_url AS profileImage
            FROM 
                comment
                LEFT JOIN user ON comment.user_id = user.id
            WHERE post_image_id = ?
            AND comment.created_at < ?
            ORDER BY
                comment.created_at DESC
            LIMIT ?, ?;
        `, [postImageId, lastCreatedAt, skip, limit]);

        const comments = rawResult.map(row => {
            return {
                id: row.id,
                user: {
                    id: row.userId,
                    name: row.name,
                    profileImage: row.profileImage,
                },
                content: row.content,
                x: row.x,
                y: row.y,
                isPublic : row.isPublic,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
            };
        });

        const rawCount = await this.repository.manager.query(`
            SELECT COUNT(*) as count FROM comment
            WHERE post_image_id = ?
        `, [postImageId]);
        const count = Number(rawCount[0].count)

        const totalPages = Math.ceil(count / limit);
        return {
            data: comments.map(comment => ({
                id: comment.id,
                user: comment.user,
                content: comment.content,
                x: comment.x,
                y: comment.y,
                isPublic : comment.isPublic ? true : false,
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt
            })),
            pagination: {
                totalItems: count,
                itemsPerPage: limit,
                currentPage: page,
                totalPages: totalPages,
            },
        };
    }

    async updateComment(userId: string, commentId: string, updateCommentDto: UpdateCommentDto): Promise<void> {
        const updatedComment = await this.repository.update({ id: commentId, user: { id: userId } }, { ...updateCommentDto })

        console.log(updatedComment)
        if (updatedComment.affected == 0) {
            throw new HttpException(
                'Comment not found',
                HttpStatus.NOT_FOUND
            );
        }
    }

    async updateCommentsByWriter(userId: string, postId: string, updateCommentDto: UpdateCommentsByWriterDto): Promise<void>{
        const {commentIds} = updateCommentDto

        const comments = await this.repository.find({where : {id : In(commentIds), post : {id : postId}}})

        commentIds.forEach((commentId, index) => {
            const comment = comments.find(comment => comment.id == commentId)
            if(comment){
                comment.x = updateCommentDto.x[index]
                comment.y = updateCommentDto.y[index]
            }
        })

        await this.repository.save(comments)
    }

    async deleteComment(userId: string, commentId: string): Promise<void> {
        const deleted = await this.repository.delete({ id: commentId, user: { id: userId } })

        if (deleted.affected == 0) {
            throw new HttpException(
                'Comment not found',
                HttpStatus.NOT_FOUND
            );
        }
    }
}