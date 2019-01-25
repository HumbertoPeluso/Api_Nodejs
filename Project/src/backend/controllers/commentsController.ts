import { getCommentsRepository } from "../repositories/commentsRepository";
import express = require("express");
import * as joi from "joi";
import { authMiddleware } from "../middleware/authMiddleware";
import { Repository } from "typeorm";
import { Comments } from "../entities/comments";

// Declare Joi Schema so we can validate movies
const commentsDetailsSchema = {
    id: joi.number(),
    user: joi.object(),
    link: joi.object(),
    contentComment: joi.string()
};

export function postCommentsHandler(commentsRepo:Repository<Comments>){

        const postAComment = (req:express.Request,res:express.Response)=>{
            (async()=>{
                const newComment = req.body;
            const result = joi.validate(newComment, commentsDetailsSchema)
            if(result.error){
                res.status(400).send({msg:"This comment is not valid"});
            }else{
                const comments = await commentsRepo.save(newComment);
                res.json(comments);
            }
            })().catch(error => {
                console.log('Error', error.message)
            });
        };
    return{
        postAComment:postAComment
    };
};

export function deleteCommentHandler(commentsRepo:Repository<Comments>){

    const deleteCommentById = (req:express.Request,res:express.Response)=>{
        (async()=>{
            const ownerUserId = (req as any).userId;
            const id = req.params.id;
            const hasComment = await commentsRepo.findOne(id);
            if(!hasComment){
                res.status(404).send({ MSG: "comment not found" });
            }else{
                const comment = await commentsRepo.findOne({id:id, user:{id:ownerUserId}})
                if(comment==null){
                    res.status(400).send({msg:"user not able to delete this comment"})
                }else{
                    await commentsRepo.delete(id);
                    res.json({ok:"Ok"});
                }
            }
        })();
    };
    return{
        deleteCommentById:deleteCommentById
    };
};

export function patchCommentHandler(commentsRepo:Repository<Comments>){

    const updateCommentById = (req:express.Request,res:express.Response)=>{
        (async()=>{
            const ownerUserId = (req as any).userId;
            const id = req.params.id;
            const hasComment = await commentsRepo.findOne(id);
            if(!hasComment){
                res.status(404).send({msg:"comment not found"});
            }else{
                const comment = await commentsRepo.findOne({id:id, user:{id:ownerUserId}});
                if(comment==null){
                    res.status(400).send({msg:"user not able to update this comment"});
                }else{
                   
                    await commentsRepo.update(id,{contentComment:req.body.contentComment});
                    res.json({ok:"Ok"});
                }

            }
        })().catch(error => {
            console.log('Error', error.message)
        });
    };
    return{
        updateCommentById:updateCommentById
    }
};

export function getCommentsController(){

    // Create a repository so we can perform database operations
    const commentsRepository = getCommentsRepository();
    // Create router instance so we can declare enpoints
    const router = express.Router();
     
    const getComments = postCommentsHandler(commentsRepository)     
    const deleteComments = deleteCommentHandler(commentsRepository)
    const updateComments = patchCommentHandler(commentsRepository)

    // HTTP POST http://localhost:8080/api/v1/comments
    router.post("/",authMiddleware,getComments.postAComment)

    // HTTP DELETE http://localhost:8080/api/v1/comments/:id
    router.delete("/:id",authMiddleware,deleteComments.deleteCommentById)

    // HTTP PATCH http://localhost:8080/api/v1/comments/:id
    router.patch("/:id",authMiddleware,updateComments.updateCommentById)

    return router;
}