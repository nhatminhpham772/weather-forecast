import { BaseEntity, Column, PrimaryColumn } from "typeorm";

export abstract class GenericEntity {
    @PrimaryColumn()
    id: any

    @Column({ default: false })
    isDelete: boolean;

    @Column({ type: 'timestamp', name: 'createdAt', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', name: 'updatedAt', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}