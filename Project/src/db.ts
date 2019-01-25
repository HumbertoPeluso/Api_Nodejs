import { User } from "./backend/entities/user";
import { Comments } from "./backend/entities/comments";
import { Link } from "./backend/entities/link";
import { Vote } from "./backend/entities/vote";
import { createConnection } from "typeorm";


export async function createDbConnection(){

    //Read the database settings from the environment variables
    const DATABASE_HOST = process.env.DATABASE_HOST;
    const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;
    const DATABASE_USER = process.env.DATABASE_USER;
    const DATABASE_DB = process.env.DATABASE_DB;

    // Display connection ditails in console
    console.log(
        `
        host: ${DATABASE_HOST}
        password: ${DATABASE_PASSWORD}
        user: ${DATABASE_USER}
        db: ${DATABASE_DB}
        `
        );

         // Open a database connection
await createConnection({
    type: "postgres",
    host: DATABASE_HOST,
    port: 5432,
    username: DATABASE_USER,
    password: DATABASE_PASSWORD,
    database: DATABASE_DB,

    entities: [
        User, Comments, Link,Vote
    ],
    synchronize: true
    });

}