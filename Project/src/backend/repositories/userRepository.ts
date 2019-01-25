import { User } from "../entities/user";
import { getConnection } from "typeorm";

export function getUserRepository(){
    const connection = getConnection();
    const userRepository = connection.getRepository(User);
    return userRepository;
}