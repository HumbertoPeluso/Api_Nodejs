import { Link } from "../backend/entities/link";
import { expect } from "chai";

import { createApp } from "..";
import  request  from "supertest";
import { postLinksHandler } from "../backend/controllers/linksController";
import { Vote } from "../backend/entities/vote";

const tokeUserId2 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNTQ4MzYyMTA0fQ.j3PkVxOFsBRnlBSmNk48GM7Rr1AvoCoKcaUwEXIInpo";

const fakeLink: Link = {
    id:1,
    user:{
        id:2,
        email:"userteste1",
        password:"userteste1"
    },
    url:"linkteste1/",
    title:"linkteste1"
};
const fakeLinkNoId = {
    'user':{
        'id':3,
        'email':'userteste1',
        'password':'userteste1'
    },
    'url':'linkteste1/',
    'title':'linkteste1'
};
const fakeVote: Vote={
    id:10,
    user:{
        id:2,
        email:"userteste1",
        password:"userteste1"
    },
    link:{
        id:1,
        user:{
            id:2,
            email:"userteste1",
            password:"userteste1"
        },
        url:"linkteste1/",
        title:"linkteste1"
    },
    positiveVote:true

}

const fakeRequest: any = {
    params:{
        id:1
    }
}
const fakeResponse: any = {
    json:(link:Link)=>{
        expect(link.id).to.eq(fakeLink.id);
    }
};
const fakeLinkRepository: any = {
    findOne: (id:number)=>{
        expect(id).to.eq(fakeLink.id);
        return Promise.resolve(fakeLink);
    }
};
const fakeVoteRepository:any={
    findOne:(id:number)=>{
        expect(id).to.eq(fakeVote.id);
        return Promise.resolve(fakeVote);
    }
}


describe("Links Controller", ()=>{

    it("should be able to post a link", ()=>{
       
        const linkHandlers = postLinksHandler(fakeLinkRepository, fakeVoteRepository);
        linkHandlers.postALink(fakeRequest,fakeResponse);
})
});


    describe("HTTP POST integrated",()=>{
        it("should post a link", (done)=>{
            (async ()=>{
                const app = await createApp();
                request(app)
                .post('/api/v1/links')
                .send(fakeLinkNoId)
                .set('Content-Type','application/json')
                .set('Accept','application/json')
                .set('x-auth-token',tokeUserId2)
                .expect(200)
                .end(function(err,res){
                    if(err) throw err;
                        console.log(res.body);
                    done();
                })
            })();
        });
    });

