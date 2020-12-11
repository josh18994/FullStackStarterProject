import { ORMContext } from "../common/types";
import { User } from "../entities/User";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import argon2 from 'argon2';

@InputType()
class CreateType {
    @Field()
    username: string;
    @Field()
    password: string;
}

@ObjectType()
class FieldError {
    @Field()
    message: string;
}

@ObjectType()
class ResponseType {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];
    @Field(() => User, { nullable: true })
    user?: User;
}

@Resolver()
export class UserResolver {

    @Mutation(() => User)
    async userSignUp(
        @Ctx() { em }: ORMContext,
        @Arg('options') options: CreateType
    ): Promise<User> {
        const encryptedPassword = await argon2.hash(options.password);
        const user = em.create(User, { username: options.username, password: encryptedPassword });
        await em.persistAndFlush(user);
        return user;
    }

    @Mutation(() => ResponseType)
    async userLogin(
        @Ctx() { em, req }: ORMContext,
        @Arg('options') options: CreateType
    ): Promise<ResponseType> {
        console.log("reached here");
        const user = await em.findOne(User, { username: options.username });
        if (!user) {
            return {
                errors: [{
                    message: 'cannot find user'
                }]
            }
        }
        const verifyPassword = await argon2.verify(user.password, options.password);
        if (!verifyPassword) {
            return {
                errors: [{
                    message: 'Incorect password'
                }]
            }
        }
        req.session!.username = user.username;
        return {
            user
        }
    }

    @Query(() => User, {nullable: true})
    async whoIsLoggedIn(
        @Ctx() { em, req }: ORMContext,
    ) {
        if(!req.session?.username) {
            return null;
        }
        const user = await em.findOne(User, { username: req.session?.username });
        return user;
    }
}