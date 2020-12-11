import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ID, ObjectType } from "type-graphql";

@Entity()
@ObjectType()
export class User {

    @Field(() => ID)
    @PrimaryKey()
    id!: number;

    @Field()
    @Property({ type: 'text', unique: true })
    username!: string;

    @Property({ type: 'text'})
    password!: string;

}