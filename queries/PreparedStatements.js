/**
 * Because were not using very complex queries. Using prepared statments for
 * optimization purposes isn't really the point. This file stores prepared statements
 * to protect forom SQL injection in case malicious sequences are attempted 
 */
const validator = require('validator');
/*************************************************************************
 * This returns an array (as string) of index values that match the query 
 * provided and returns false if something happened
 * 
 * @param {String} query The words you want to index
 * @param {Int} numResults The max number of results that you want to be listed 
 * @param {pg} pool The instance of postgres pool
 **************************************************************************/
function indexRankQuery(query, numResults, pool){
    const preparedQuery =  {
        name: "index-query",
        text: "SELECT id FROM transcriptions WHERE tsv @@ plainto_tsquery($1) ORDER BY ts_rank_cd(tsv, plainto_tsquery($1)) DESC LIMIT $2;",
        values: [query, numResults]
    };

    var resultStr = "[";
    let runQ = function(preparedQuery, resultStr){
        return new Promise(function(resolve, reject){
            pool.query(preparedQuery, (err, qr) =>{
                if(!err){
                    for(var i = 0; i < qr.rows.length; ++i) resultStr += "\"" + qr.rows[i].id + "\", ";
                    resultStr = resultStr.slice(0, resultStr.length - 2) + "]";
                    resolve(resultStr);
                }else{
                    reject("error in IRQ" + err);
                }
            })
        })
    }
    
    runQ(preparedQuery, resultStr).then(function(resultStr){
        return resultStr;
    }).catch(function(error){
        console.log("fuck an error panement " + error);
    })
    
}





/*************************************************************************
 * Takes the array of id's from indexRankQuery  as well as the original
 * query and highlights the results. Returns false if something bad happened
 * 
 * @param {String} idArray array of id's 
 * @param {String} query the query text
 * @param {pg} pool postgres client pool
 * @param {res} res response
 **************************************************************************/
function indexRankAndHighlightQuery(query, numResults, pool, res){
    const preparedRankQuery =  {
        name: "rank-query",
        text: "SELECT id FROM transcriptions WHERE tsv @@ plainto_tsquery($1) ORDER BY ts_rank_cd(tsv, plainto_tsquery($1)) DESC LIMIT $2;",
        values: [query, numResults]
    };


    let runQ = function(preparedQuery, resultStr){
        return new Promise(function(resolve, reject){
            try{
                pool.query(preparedQuery, (err, qr) =>{
                    if(!err){
                        for(var i = 0; i < qr.rows.length; ++i) resultStr += "\"" + qr.rows[i].id + "\", ";
                        resultStr = resultStr.slice(0, resultStr.length - 2) + "]";
                        resolve(resultStr);
                    }else{
                        reject("error in IRQ" + err);
                    }
                })
            }catch(e){
                reject("RunQ pool query issue " + e);
            }
        })}


    let runH = function(preparedHighlightQuery){
        return new Promise(function(resolve, reject){
            try{
                pool.query(preparedHighlightQuery, (err, qr) => {
                    if(!err){
                        resolve(JSON.stringify(qr.rows));
                    }else{
                        reject("Error in runH" + err);
                    }
                });
            }catch(e){
                reject("RunH pool query issue" + e);
            }
            
        })}
    var resultStr = "[";

    
    runQ(preparedRankQuery, resultStr).then(function(idArray){
        const preparedHighlightQuery = {
            name: "highlight-query",
            text: "WITH arr(ids) AS (VALUES($1)) SELECT ts_headline('english',(coalesce(transcription, '') || ' ... '|| coalesce(description)), plainto_tsquery($2), 'MinWords=40, MaxWords=90'), id, title, podcastname, date FROM transcriptions WHERE id IN (SELECT elem::int FROM arr, json_array_elements_text(ids::json) elem);",
            values: [idArray, query]
        };
        return runH(preparedHighlightQuery);
    }).then(function(highlights){
        res.end(highlights);
    }).catch(function(error){
        res.end("An error happened with message " + error);
    })
}



/*************************************************************************
 * Gets the list of shows given a podcast name. We use prepared statments
 * for this to avoid SQL injection attacks and allow for special characters
 * 
 *************************************************************************/
function getPodcastDetails(podcastName, pool){
    return new Promise(function(resolve, reject){
        try{
            const preparedQuery = {
                name:"podcast-details",
                text: "SELECT p.description, t.title, p.imageuri, t.duration, t.date FROM transcriptions AS t JOIN podcasts AS p ON p.name = t.podcastname WHERE t.podcastname = $1 GROUP BY p.description, p.imageuri, t.title, t.duration, t.date;",
                values: [podcastName]};
            pool.query(preparedQuery, (err, qr) =>{
                if(!err){
                    resolve(JSON.stringify(qr.rows));
                }else{
                    reject("Error in getPodcastDetails query" + err);
                }
            })
        }catch(e){
            reject("getPodcastDetails issue " + e);
        }
    })
}

/*************************************************************************
 * This is used in the POST route /transcription. It requires a podcastName
 * and a showName and uses prepared statements to run the query safely. 
 * Returns transcription, title, description, imageuri, and duration in
 * JSON format
 *************************************************************************/
function getTranscription(podcastName, showName, pool){
    return new Promise(function(resolve, reject){
        const preparedQuery = {
            name:"transcription-details",
            text:"SELECT t.transcription, t.title, t.description, p.imageuri, t.duration, t.date from transcriptions AS t JOIN podcasts AS p ON t.podcastname = p.name WHERE t.podcastname = $1 AND t.title LIKE $2 LIMIT 1;",
            values: [podcastName, showName + "%"]};
        pool.query(preparedQuery, (err, qr) =>{
            if(!err){
                resolve(JSON.stringify(qr.rows));
            }else{
                reject("Error in getTranscription query");
            }
        })
    });
}

module.exports = {indexRankQuery, indexRankAndHighlightQuery, getPodcastDetails, getTranscription};