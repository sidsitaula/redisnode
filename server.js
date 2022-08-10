const express = require('express');
const {promisify}=require('util');
const redis=require('redis');

const client=redis.createClient();
const rIncr=promisify(client.incr).bind(client);
const rGet=promisify(client.get).bind(client);
const rSetEX=promisify(client.setex).bind(client);

function cache(key, ttl, slowFn){
    return async function cached(...props){
        const cachedResponse = await rGet(key);
        if(cachedResponse){
            return cachedResponse;
        }
        const result=await slowFn(...props);
        await rSetEX(key, ttl, result);
        return result;
    }
}

async function slow(){
    const P= new Promise(res=>{
        setTimeout(()=>{
            res(new Date().toUTCString());
        },5000)
    })
    return P;
}

const cachedFn = cache("expensive",10,slow);


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

    app.get('/get', async (req, res)=>{
        const data = await cachedFn();
        res.json({
            status:"ok",
            data
        }).end();
    })
    app.use(express.static('./static'))
    app.listen(3000,()=>{
        console.log('Server started on port 3000')
    })
}
init();

