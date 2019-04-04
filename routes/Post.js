var validator = require("validator");
const {indexRankAndHighlightQuery, getTranscription} = require("../queries/PreparedStatements");


let readJ = function (res){
  return new Promise(function(resolve, reject){
    readJson(res, (obj) => {
        resolve(obj);
      }, () => {
        reject("Error, invalid Json");
      });
    })
}


class Routes{
  constructor(webServer, pool){
      this.webServer = webServer;
      this.pool = pool;
  }
  attachPostRoutes(){

  /*************************************************************************
   * This searches and highlights the query entered into search
   *************************************************************************/
    this.webServer.post("/search", (res, req) =>{
      var localPool = this.pool;
      res.onAborted(()=> {
        res.aborted = true;
      });

      readJ(res).then(function(response){
        indexRankAndHighlightQuery(response.query, 10, localPool, res);
      }).catch(function(err){
        console.log("an error happened " + err);
      })
    });



      /*************************************************************************
       * This is the updated route that is called in the transcription.html file
       * c1: the general podcasts name
       * c2: the podcast's (specific) show name
       *************************************************************************/
      this.webServer.post("/transcription", (res, req) =>{
        var localPool = this.pool;
        res.onAborted(()=> {
          res.aborted = true;
        });
        readJ(res).then(function(response){
          return getTranscription(response.c1, response.c2, localPool);
        }).then(function(message){
          if(!res.aborted) res.end(message);
        }).catch(function(err){
          if(!res.aborted) res.end("err" + err);
        });
      });

      return this.webServer;
    }
  }




/* Helper function for reading a posted JSON body */
function readJson(res, cb, err) {
    let buffer;
    /* Register data cb */
    res.onData((ab, isLast) => {
      let chunk = Buffer.from(ab);
      if (isLast) {
        let json;
        if (buffer) {
          try {
            json = JSON.parse(Buffer.concat([buffer, chunk]));
          } catch (e) {
            /* res.close calls onAborted */
            try{
              res.close();
            }catch(e){}
            return;
          }
          cb(json);
        } else {
          try {
            json = JSON.parse(chunk);
          } catch (e) {
            /* res.close calls onAborted */
            try{
              res.close();
            }catch(e){}
            return;
          }
          cb(json);
        }
      } else {
        if (buffer) {
          buffer = Buffer.concat([buffer, chunk]);
        } else {
          buffer = Buffer.concat([chunk]);
        }
      }
});
/* Register error cb */
res.onAborted(err);
}

module.exports = {Routes}