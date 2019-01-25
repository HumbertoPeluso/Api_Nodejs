import * as express from "express";
import { getUserRepository } from "../repositories/userRepository";
import * as joi from "joi";
import { getLinkRepository } from "../repositories/linkRepository";
import { getCommentsRepository } from "../repositories/commentsRepository";
import { Repository } from "typeorm";
import { User } from "../entities/user";
import { Link } from "../entities/link";
import { Comments } from "../entities/comments";


 // Declare Joi Schema so we can validate movies
 const userDetailsSchema = {
    id: joi.number(),
    email: joi.string().email(),
    password: joi.string()
};

export function getUserHandler(userRepo:Repository<User>,linksRepo:Repository<Link>,commentsRepo:Repository<Comments>){

    const getAnUserLinksAndComments = (req:express.Request,res:express.Response)=>{
        (async()=>{
            const id = req.params.id;
            const user =  await userRepo.findOne(id);
            if(user==null){
                res.status(404).send({msg:"user not found"});
            }else{
                const links = await linksRepo.find({user})
                const comments = await commentsRepo.find({user});
                res.json({user,links, comments});
            }
        })().catch(error =>{
            console.log('Error ', error.message)});
    }

    return{
        getAnUserLinksAndComments:getAnUserLinksAndComments
    }
}

export function postUserHandler(userRepo:Repository<User>){
    
    const postAUser = (req:express.Request,res:express.Response)=>{
        (async()=>{
            const newUser = req.body;
            const result = joi.validate(newUser, userDetailsSchema);
            if(result.error){
                res.status(400).send();
            }else{
                const user = await userRepo.save(newUser);
                res.json({ok:"Ok"}).send();
            }
        })().catch(error =>{
            console.log('Error', error.message)});
    }
    return{
        postAUser:postAUser
    }
}


export function getUserController(){

    // Create a repository so we can perform database operations
    const userRepository = getUserRepository();
    const linksRepository = getLinkRepository();
    const commentsRepository = getCommentsRepository();

    // Create router instance so we can declare enpoints
    const router = express.Router();

    const getUsers = getUserHandler(userRepository,linksRepository,commentsRepository)
    const postUsers = postUserHandler(userRepository)


        // HTTP GET http://localhost:8080/api/v1/users/:id
        router.get("/:id",getUsers.getAnUserLinksAndComments)

        // HTTP POST http://localhost:8080/api/v1/users
        router.post("/", postUsers.postAUser)

        return router;
}