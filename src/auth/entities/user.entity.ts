import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Token } from "./token.entity";
import { nanoid } from "nanoid";
import { GenericEntity } from "../../hooks/database/base.entity";

@Entity({ name: 'Users' })
export class User extends GenericEntity{
    @Column()
    email: string

    @Column()
    password: string

    @Column({ name: 'email_notification', default: false })
    email_notification: boolean

    @Column({ default: true })
    isActive: boolean

    @OneToMany(() => Token, token => token.user)
    token: Token
}