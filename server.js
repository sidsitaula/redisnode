const express = require('express');
const {promisify}=require('util');
const redis=require('redis');

const client=redis.createClient();
const rIncr=promisify(client.incr).bind(client);
const rGet=promisify(client.get).bind(client);
const rSetEX=promisify(client.setex).bind(clients);

async function init(){
    const app=express();
    app.get('/pv', async(req,res)=>{
        const views = await rIncr('pageviews');
        console.log(views)
        res.json(
            {
                status:"ok",
                views
            }
        ).end();
    })
    app.use(express.static('./static'))
    app.listen(3000,()=>{
        console.log('Server started on port 3000')
    })
}
init();

