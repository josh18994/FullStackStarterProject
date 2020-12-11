import { ORMContext } from "src/common/types";
import { Post } from "../entities/Post";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver {

    @Query(() => [Post], {nullable: true})
    getPosts(@Ctx() { em }: ORMContext): Promise<Post[]> {
        return em.find(Post, {});
    }

   
    @Query(() => Post, {nullable: true})
    getPostById(@Ctx() { em }: ORMContext, @Arg('id') id: number): Promise<Post | null>{
        return em.findOne(Post, {id});
    }

    @Mutation(() => Post)
    async createPost(@Ctx() { em }: ORMContext, @Arg('title') title: string): Promise<Post> {
        const post = em.create(Post, {title});
        try {
            await em.persistAndFlush(post);
            return post;
        } catch(err) {
            return err;
        }
    }
}