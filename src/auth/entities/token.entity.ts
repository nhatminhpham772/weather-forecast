import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./user.entity";
import { nanoid } from 'nanoid'

@Entity({ name: 'Tokens' })
export class Token {
    constructor() {
        this.refresh_token = nanoid()
    }

    @PrimaryColumn({ name: 'refresh_token' })
    refresh_token: string

    @ManyToOne(() => Token, token => token.refresh_token, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'parent' })
    parent: Token

    @ManyToOne(() => User, e => e.token, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User

    @Column({ default: true })
    check_valid: boolean
}