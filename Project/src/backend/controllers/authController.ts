import { getUserRepository } from "../repositories/userRepository";
import express = require("express");
import * as joi from "joi";
import jwt from "jsonwebtoken";
import { Repository } from "typeorm";
import { User } from "../entities/user";

const AUTH_SECRET = process.env.AUTH_SECRET;

const userDetailsSchema = {
    email:joi.string().email(),
    password:joi.string()
};

export function postAuthHandler(userRepo: Repository<User>) {

    const postAuth = (req: express.Request, res: express.Response) => {
        (async () => {
            const userDetails = req.body;
            const result = joi.validate(userDetails, userDetailsSchema);
            if (result.error) {
                res.status(400).send();
            } else {
                const match = await userRepo.findOne(userDetails);
                if (match === undefined) {
                    res.status(401).send();
                } else {
                    if (AUTH_SECRET === undefined) {
                        res.status(500).send({ Msg: "Internal Server error" });
                    } else {
                        const token = jwt.sign({ id: match.id }, AUTH_SECRET);
                        res.json({ token: token }).send();
                    }
                }
            }
        })();
    }
    return {
        postAuth: postAuth
    };
};

export function getAuthController() {

    const userRepository = getUserRepository();
    const router = express.Router();

    const postAuths = postAuthHandler(userRepository)

    // HTTP POST http://localhost:8080/auth/login/
    router.post("/login", postAuths.postAuth)

    return router;
}