var {Pool} = require("pg");




async function checkID(pool){
    
    pool.query("select case when coalesce(transcription, '') != '' then TRUE else FALSE end as ts from transcriptions WHERE id = " + id + ";", (err, queryResult) =>{
        if(err){
            console.log(err.stack);
            return "err.stack";
        }else{
            console.log("in get async");
            return queryResult.rows[0];
        }
    });
}
async function checkID2(pool){
    try{
        pool.query("select id from transcriptions where id = 142;", (err, queryResult) =>{
            console.log(err, queryResult);
            return "ss";
        });
    }catch(Exception){
        return Exception.stack;
    }
}



class GetRoutes{
    constructor(webServer, pool){
        console.log("inside routes");
        this.webServer = webServer;
        this.pool = pool;
    }
    attachGetRoutes(){
        this.webServer.get("/", (res,req) =>{
            setHeaders(res);
            res.end("insiderotes");
        });
        this.webServer.get("/woah/:id", async (res,req) => {
            res.onAborted(() =>{
                res.aborted = true;
            });
            console.log(req.getParameter("id"));
            let r = await checkID2(req.getParameter(pool));
            if(!res.aborted){
                res.end(r);
                console.log("yo " + r);
            }
        })


        this.webServer.get("/w/:id", (res,req) => {
            res.onAborted(() =>{
                res.aborted = true;
            });
            this.pool.query("select transcription from transcriptions where id = 142;", (err, queryResult) =>{
                if(!err && !res.aborted) {
                    console.log("s", queryResult.rows[0].id);
                    res.end('sup ' + queryResult.rows[0].transcription.toString());
                }
                else res.end("err");
            });
        })
        return this.webServer;
    }
}



module.exports = {
    GetRoutes,
}