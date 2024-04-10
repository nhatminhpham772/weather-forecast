import { Repository } from "typeorm";
import * as bcrypt from 'bcrypt'
import { GenericEntity } from "./base.entity";

export abstract class BaseService<T extends GenericEntity> {
    constructor(private readonly baseRepository: Repository<T>) { }

    VNTime(n = 0) {
        const now = new Date()
        const time = new Date(Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate() + n,
            now.getUTCHours() + 7,
            now.getUTCMinutes(),
            now.getUTCSeconds(),
            now.getUTCMilliseconds()
        ))
        return time
    }

    async deleteObject(id: any) {
        const object = await this.baseRepository.findOne({
            where: { id: id },
        })

        if (!object || object.isDelete)
            return false;

        object.isDelete = true
        return await this.baseRepository.save(object)
    }

    async hashing(password: string): Promise<string> {
        const salt = await bcrypt.genSalt()
        const hash = await bcrypt.hash(password, salt)
        return hash
    }

    async isMatch(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash)
    }
}