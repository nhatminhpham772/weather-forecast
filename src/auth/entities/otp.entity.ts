import { Column, Entity, JoinColumn, ManyToOne } from "typeorm"
import { User } from "./user.entity"
import { GenericEntity } from "../../hooks/database/base.entity"

@Entity({ name: 'Otps' })
export class Otp extends GenericEntity{
    @ManyToOne(() => User, e => e.otp, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User

    @Column()
    code: string

    @Column({ type: 'bigint' })
    timestamp: number
}