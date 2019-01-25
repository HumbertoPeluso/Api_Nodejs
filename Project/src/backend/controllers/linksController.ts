import express = require("express");
import * as joi from "joi";
import { getLinkRepository } from "../repositories/linkRepository";
import { getVoteRepository } from "../repositories/voteRepository";
import { Vote } from "../entities/vote";
import { getCommentsRepository } from "../repositories/commentsRepository";
import { authMiddleware } from "../middleware/authMiddleware";
import { Repository } from "typeorm";
import { Link } from "../entities/link";
import { Comments } from "../entities/comments";



// Declare Joi Schema so we can validate movies
const linkDetailsSchema = {
    id: joi.number(),
    user: joi.object(),
    url: joi.string(),
    title: joi.string()
};

const voteDetailsSchema = {
    id: joi.number(),
    user: joi.object(),
    link: joi.object(),
    positiveVote: joi.boolean()
};

export function postLinksHandler(linkRepo: Repository<Link>, voteRepo: Repository<Vote>) {

    const postALink = (req: express.Request, res: express.Response) => {
        (async () => {
            const newLink = req.body;
            const result = joi.validate(newLink, linkDetailsSchema);
            if (result.error) {
                res.status(400).send({ msg: "validation failed" });
            } else {
                await linkRepo.save(newLink);
                res.json({ newLink }).send();
            }
        })().catch(error => {
            console.log('Error', error.message)
        });
    };

    const postUpvote = (req: express.Request, res: express.Response) => {

        (async () => {
            const id = req.params.id;
            const link = await linkRepo.findOne(id, { relations: ["user"] });
            console.log(link)
            if (link == null) {
                res.status(404).send({ msg: "link no found" });
            } else {
                const userId = link.user.id;
                const newVote = {
                    link: link,
                    user: {
                        id: userId,
                    },
                    positiveVote: true
                }
                const result = joi.validate(newVote, voteDetailsSchema)
                if (result.error) {
                    res.status(400).send({ msg: "vote not valid" })
                } else {
                    try {
                        await voteRepo.save(newVote);
                        res.json(newVote).send();
                    } catch (err) {
                        console.log(err);
                        res.status(500).send({ msg: "user not permit to vote in this link" })
                    }

                }


            }
        })().catch(error => {
            console.log('Error', error.message)
        });
    };

    const postDownvote = (req: express.Request, res: express.Response) => {

        (async () => {
            const id = req.params.id;
            const link = await linkRepo.findOne(id, { relations: ["user"] });
            console.log(link)
            if (link == null) {
                res.status(404).send({ msg: "link no found" });
            } else {
                const userId = link.user.id;
                //await userRepo.findOne(ownerUserId);
                console.log(userId);

                const newVote = {
                    link: link,
                    user: {
                        id: userId,
                    },
                    positiveVote: false
                }
                const result = joi.validate(newVote, voteDetailsSchema)
                if (result.error) {
                    res.status(400).send({ msg: "vote not valid" })
                } else {
                    try {
                        await voteRepo.save(newVote);
                        res.json(newVote).send();
                    } catch (err) {
                        console.log(err);
                        res.status(500).send({ msg: "user not permit to vote in this link" })
                    }

                }


            }
        })().catch(error => {
            console.log('Error', error.message)
        });
    };
    return {
        postALink: postALink,
        postUpvote: postUpvote,
        postDownvote:postDownvote
    };
};

export function getLinksHandler(linkRepo:Repository<Link>,commentsRepo:Repository<Comments>){

    const getAllLinks = (req:express.Request,res:express.Response)=>{
        (async()=>{
            const link = await linkRepo.find();
            console.log(link);
            if (link == null) {
                res.status(404).send();
            } else {
                res.json({ link });
            }
        })().catch(error => {
            console.log('Error', error.message)
        });
    }

    const getLinkById = (req:express.Request,res:express.Response)=>{
        (async()=>{
            const id = req.params.id;
            const link = await linkRepo.findOne(id);
            if (link == null) {
                res.status(404).send();
            } else {
                const comments = await commentsRepo.find({ link });
                res.json({ link, comments });
            }
        })().catch(error => {
            console.log('Error', error.message)
        });
    }
    return{
        getAllLinks:getAllLinks,
        getLinkById:getLinkById
    };
}

export function deleteLinksHandler(linkRepo:Repository<Link>){

    const deleteALink = (req:express.Request,res:express.Response)=>{
        (async()=>{
            const id = req.params.id;
            const ownerUserId = (req as any).userId;
            const link = await linkRepo.findOne({ id: id, user: { id: ownerUserId } });
            if (link == null) {
                res.status(404).send({ MSG: "not permited" });
            } else {
                await linkRepo.delete(id);
                res.json({ ok: "ok" });
            }
        })().catch(error => {
            console.log('Error', error.message)
        });
    }

    return{
        deleteALink:deleteALink
    };
}
export function getLinksController() {

    // Create a repository so we can perform database operations
    const linkRepository = getLinkRepository();
    const voteRepository = getVoteRepository();
    const commentsRepository = getCommentsRepository();

    // Create router instance so we can declare enpoints
    const router = express.Router();

    const postLinks = postLinksHandler(linkRepository, voteRepository);
    const getLinks = getLinksHandler(linkRepository,commentsRepository);
    const deleteLinks = deleteLinksHandler(linkRepository)

    // HTTP POST http://localhost:8080/api/v1/links
    router.post("/", authMiddleware, postLinks.postALink);

    // HTTP POST http://localhost:8080/api/v1/links/:id/upvote 
    router.post("/:id/upvote", authMiddleware, postLinks.postUpvote)

    // HTTP POST http://localhost:8080/api/v1/links/:id/downvote
    router.post("/:id/downvote",authMiddleware,postLinks.postDownvote)

    // HTTP GET http://localhost:8080/api/v1/links 
    router.get("/", getLinks.getAllLinks);

    // HTTP GET http://localhost:8080/api/v1/links/:id
    router.get("/:id",getLinks.getLinkById)

    // HTTP DELETE http://localhost:8080/api/v1/links/:id
    router.get("/:id",authMiddleware, deleteLinks.deleteALink)

    return router;
}


