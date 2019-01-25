import { getConnection } from "typeorm";
import { Comments } from "../entities/comments";



export function getCommentsRepository(){
    const connection = getConnection();
    const commentsRepository = connection.getRepository(Comments);
    return commentsRepository;
}