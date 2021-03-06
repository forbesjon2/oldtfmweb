/**
 * Because were not using very complex queries. Using prepared statments for
 * optimization purposes isn't really the point. This file stores prepared statements
 * to protect forom SQL injection in case malicious sequences are attempted
 */
const validator = require('validator');
const bcrypt = require('bcrypt');       //check password (authentication)
const crypto = require('crypto');       //random string, used with JWT
const JWT = require('jsonwebtoken');    //session






/*************************************************************************
 * Takes the array of id's from indexRankQuery  as well as the original
 * query and highlights the results. Returns false if something bad happened
 *
 * @param {String} idArray array of id's
 * @param {String} query the query text
 * @param {pg} pool postgres client pool
 * @param {res} res response
 **************************************************************************/
function indexRankAndHighlightQuery(query, page, subq, pool, res){
    const preparedQuerySubq =  {
        name: "index-query-subq",
        text: "SELECT id FROM transcriptions WHERE LOWER(podcastname) = LOWER($2) AND tsv @@ plainto_tsquery($1) ORDER BY ts_rank_cd(tsv, plainto_tsquery($1)) DESC;",
        values: [query, subq]};
    
    const preparedRankQuery =  {
        name: "rank-query",
        text: "SELECT id FROM transcriptions WHERE tsv @@ plainto_tsquery($1) ORDER BY ts_rank_cd(tsv, plainto_tsquery($1)) DESC;",
        values: [query]};

    let runQ = function(preparedQuery, resultStr){
        return new Promise(function(resolve, reject){
            try{
                pool.query(preparedQuery, (err, qr) =>{
                    if(!err){
                        for(var i = (page - 1) *10; i < ((page - 1) * 10) + 10; ++i) {
                            try{
                                resultStr += "\"" + qr.rows[i].id + "\", ";
                            }catch(e){
                                break;
                            }
                        }
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

    runQ(subq.length > 0 ? preparedQuerySubq : preparedRankQuery, "[").then(function(idArray){
        const preparedHighlightQuery = {
            name: "highlight-query",
            text: "WITH arr(ids) AS (VALUES($1)) SELECT ts_headline('english',(coalesce(transcription, '') || ' ... '|| coalesce(description)), plainto_tsquery($2), 'MinWords=40, MaxWords=90'), id, title, podcastname, date FROM transcriptions WHERE id IN (SELECT elem::int FROM arr, json_array_elements_text(ids::json) elem) ORDER BY ts_rank_cd(tsv, plainto_tsquery($2)) DESC;",
            values: [idArray, query]
        };
        if(idArray.length > 4){
            return runH(preparedHighlightQuery);
        }else{
            return Promise.reject("none")
        }
    }).then(function(highlights){
        res.end(highlights);
    }).catch(function(error){
        if(!res.aborted) res.end(error == "none" ? "[]" : "error in indexAndHighlightQuery with message " +error);
    })
}




/*************************************************************************
 * Gets the general details of a specific podcast. used with "getShowList"
 *
 *************************************************************************/
function getPodcastDetails(podcastName, pool){
    return new Promise(function(resolve, reject){
        try{
            const podcastDetailsQuery = {
                name:"podcast-details",
                text:"SELECT description, imageuri from podcasts WHERE name = $1;",
                values:[podcastName]};

            pool.query(podcastDetailsQuery, (err, qr) =>{
                if(!err){
                    resolve([podcastName, JSON.stringify(qr.rows)]);
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
 * Gets the list of shows for a podcast. Used with "getPodcastDetails"
 * so one of the arguments is the response from that promise.
 *
 *************************************************************************/
function getShowList(podcastName, pool, podcastDetails){
    return new Promise(function(resolve, reject){
        try{
            const showListQuery = {
                name:"podcast-shows",
                text: "SELECT title, duration, date FROM transcriptions WHERE podcastname = $1;",
                values: [podcastName]};
            pool.query(showListQuery, (err, qr) =>{
                if(!err){
                    resolve([JSON.stringify(qr.rows), podcastDetails]);
                }else{
                    reject("Error in getShowList query " + err);
                }
            })
        }catch(e){
            reject("getShowList issue " + e);
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
            values: [podcastName, showName.replace(/-/g, "%") + "%"]};
        pool.query(preparedQuery, (err, qr) =>{
            if(!err){
                resolve(JSON.stringify(qr.rows));
            }else{
                reject("Error in getTranscription query");
            }
        })
    });
}




/*************************************************************************
 * This checks if a username exists. Its used in post.js when the user
 * tries to create a new account.
 *
 * index 0: Returns true if an account with that username exists or
 * false if the username is unique
 * index 1: Returns username
 * index 2: Returns password
 *
 * 1st step of account creation
 *************************************************************************/
function checkIfUsernameExists(username, password, pool){
    return new Promise(function(resolve, reject){
        const preparedQuery = {
            name:"check-account-valid",
            text: "SELECT username FROM users WHERE username = $1",
            values:[username]};
        pool.query(preparedQuery, (err, qr) =>{
            if(!err){
                resolve([qr.rows.length == 1 ? false : true, username, password]);
            }else{
                reject(err);
            }
        })
    })
}


/*************************************************************************
 * This is run after the "checkIfUsernameExists" function returns a status
 * representing that the username isnt taken. It then inserts the username
 * and hash as new values into the database
 *
 * 2nd step of account creation
 *************************************************************************/
function insertUsernameAndHash(username, password, pool, res){
    let insertData = function(username, hash){
        return new Promise(function(resolve, reject){
        const preparedQuery = {
            name: "insert-username-hash",
            text: "INSERT INTO users(username, hash) VALUES($1, $2);",
            values: [username, hash]};
        pool.query(preparedQuery, (err, qr) =>{
            if(!err){
                resolve("{\"status\":true}");
            }else{
                reject(err);
            }
        })
    })}

    bcrypt.hash(password, 11).then(function(hash){
        return insertData(username,hash);
    }).then(function(message){
        if(!res.aborted) res.end(message);
    }).catch(function(err){
        console.log("an error happened in insertUsernameAndHash with message " + err);
    })
}



/*************************************************************************
 * Retrieves the username and hash from the database given the username
 * and checks to see if the password matches the decoded hash
 *************************************************************************/
function checkLoginDetails(username, password, stayLoggedIn, pool, res){
    let retrieveData = function(username, pool){
        return new Promise(function(resolve, reject){
        const preparedQuery ={
            name:"get-login-details",
            text: "SELECT username, hash FROM users WHERE username = $1;",
            values:[username]};
            pool.query(preparedQuery, (err, qr) =>{
                if(!err){
                    resolve(JSON.stringify(qr.rows));
                }else{
                    reject(err);
                }
            })
    })}

    let createSession = function(){
        return new Promise(function(resolve, reject){
            crypto.randomBytes(26, (err, buf) => {
                if (!err){
                    resolve(buf.toString("hex"));
                }else{
                    reject(err);
                }
          });
    })}

    let storeSession = function(SID){
        return new Promise(function(resolve, reject){
            const preparedSessionQuery = {
                name:"store-session",
                text: "UPDATE users SET sid = $1 WHERE username = $2;",
                values:[SID, username]};
                pool.query(preparedSessionQuery, (err, qr)=>{
                    if(!err){
                        resolve(SID)
                    }else{
                        reject(err);
                    }
                });
        });}

    retrieveData(username, pool).then(function(resp){
        if(JSON.parse(resp).length == 0 && !res.aborted) return Promise.reject("retrieveData error");
        return bcrypt.compare(password, JSON.parse(resp)[0].hash);
    }).then(function(loginSuccess){
        if(!loginSuccess) return Promise.reject("loginSuccess error");
        return createSession();
    }).then(function(SID){
        return storeSession(SID);
    }).then(function(resp){
        var age = [stayLoggedIn == true? 2592000 : 86400];
        var cc = "SID=" + resp +"; Max-Age=" + age + "; HttpOnly;Path=/;";
        res.writeHeader("Set-Cookie", cc);
        res.end("{\"status\":true}");
    }).catch(function(err){
        if(!res.aborted) res.end("{\"status\":false}");
    });
}


function checkIfLoggedIn(sid, pool){
    const preparedQuery = {
        name:"check-session",
        text:"SELECT username FROM users WHERE sid = $1;",
        values:[sid]};
    return new Promise(function(resolve, reject){
        pool.query(preparedQuery, (err, qr) =>{
            if(!err){
                resolve(JSON.stringify(qr.rows));
            }else{
                reject("checkIfLoggedIn query error " + err);
            }
        })
    });
}


module.exports = {indexRankAndHighlightQuery, getPodcastDetails, getTranscription, 
    getShowList, checkIfUsernameExists, insertUsernameAndHash, checkLoginDetails, checkIfLoggedIn};