function vote_get_by_id(voteid, callback)
{
    var query = `SELECT * FROM votes WHERE id = ${voteid}`;
    con.query(query, function (err, result) {
        if (err) throw err;
        if (result.length == 0) callback({});
        else callback(result[0])
    });
}

function vote_event_verify_member(userid, voteid, callback)
{
    var query = `SELECT id FROM event_members WHERE userid=${userid} AND eventid IN (SELECT eventid FROM votes WHERE id=${voteid})`;
    con.query(query, function (err, result) {
        if (err) throw err;
        callback(result.length>0);
    });
}


function vote_user_is_admin(username, password, voteid, callback)
{
    vote_get_by_id(voteid, f=>{
        event_user_is_admin(username, password, f["eventid"], callback)
    })
}

function vote_create(username, password, eventid, title, callback)
{
    title = convert_user_input(title);
    event_user_is_admin(username, password, eventid, g2=>{
        if (!g2) { callback({}); return; }
        var query = `INSERT INTO votes(title, eventid) VALUES ("${title}",${eventid})`;
        con.query(query, function (err, result) {
            if (err) { callback({}); return; } 
            con.query("SELECT LAST_INSERT_ID()", function (err, res) {
                if (err) { callback({}); return; } 
                vote_get_by_id(res[0]["LAST_INSERT_ID()"], callback)     
            });
        })
    });
}

function vote_update(username, password, voteid, title, callback)
{
    vote_user_is_admin(username, password, voteid, g=>{
        if(!g) { callback(false); return; }
        var query = `UPDATE votes SET title="${title}" WHERE id=${voteid}`;
        con.query(query, function (err, result) {
            if (err) { callback(false); return; } 
            callback(true);
        });
    })
}

function vote_delete(username, password, voteid, callback)
{
    vote_user_is_admin(username, password, voteid, g=>{
        if(!g) { callback(false); return; }
        var query = `DELETE FROM votes WHERE id=${voteid}`;
        con.query(query, function (err, result) {
            if (err) { callback(false); return; } 
            callback(true);
        });
    })
}

function vote_get_count(username, password, voteid, callback)
{
    user_verify_id(username, password, (g, userid)=>{
        if(!g) { callback([]); return; }
        vote_event_verify_member(userid, voteid, k=>{
            if(!k) { callback(false); return; }
            var query = `SELECT COUNT(id) AS c FROM vote_user_vote WHERE voteid=${voteid}`;
            con.query(query, function (err, result) {
                callback(result[0]["c"]);
            });
        })
    });
}

function vote_load_options(username, password, voteid, callback)
{
    user_verify_id(username, password, (g, userid)=>{
        if(!g) { callback([]); return; }
        vote_event_verify_member(userid, voteid, m=>{
            if(!m) { callback([]); return; }
            var query = `SELECT * FROM vote_options WHERE voteid=${voteid}`;
            con.query(query, function (err, result) {
                if (err) { callback(false); return; } 
                callback(result);
            });
        })
    })
}



function vote_option_get_by_id(voteoptionid, callback)
{
    var query = `SELECT * FROM vote_options WHERE id = ${voteoptionid}`;
    con.query(query, function (err, result) {
        if (err) throw err;
        if (result.length == 0) callback({})
        else callback(result[0])
    });
}

function vote_option_user_is_admin(username, password, voteid, callback)
{
    vote_option_get_by_id(voteid, f=>{
        vote_user_is_admin(username, password, f["voteid"], callback)
    })
}
function vote_option_create(username, password, voteid, title, callback)
{
    title = convert_user_input(title);
    vote_user_is_admin(username, password, voteid, g2=>{
        if (!g2) { callback({}); return; }
        var query = `INSERT INTO vote_options(title, voteid) VALUES ("${title}",${voteid})`;
        con.query(query, function (err, result) {
            if (err) { callback({}); return; } 
            con.query("SELECT LAST_INSERT_ID()", function (err, res) {
                if (err) { callback({}); return; } 
                vote_option_get_by_id(res[0]["LAST_INSERT_ID()"], callback)     
            });
        })
    });
}

function vote_option_update(username, password, title, optionid, callback)
{
    vote_option_user_is_admin(username, password, eventid, g=>{
        if(!g) { callback(false); return; }
        var query = `UPDATE vote_options SET title="${title}" WHERE id=${optionid}`;
        con.query(query, function (err, result) {
            if (err) { callback(false); return; } 
            callback(true);
        });
    })
}

function vote_option_delete(username, password, voteid, callback)
{
    vote_option_user_is_admin(username, password, voteid, g=>{
        if(!g) { callback(false); return; }
        var query = `DELETE FROM vote_options WHERE id=${voteid}`;
        con.query(query, function (err, result) {
            if (err) { callback(false); return; } 
            callback(true);
        });
    })
}

function vote_option_get_count(username, password, vote_option, callback)
{
    user_verify_id(username, password, (g, userid)=>{
        if(!g) { callback([]); return; }
        var query = `SELECT COUNT(id) AS c FROM vote_user_vote WHERE vote_option=${vote_option}`;
        con.query(query, function (err, result) {
            callback(result[0]["c"]);
        });
    })

}



function vote_user_voted_for(userid, vote_option_id, callback)
{
    var query = `SELECT id FROM vote_user_vote WHERE userid=${userid} AND vote_option=${vote_option_id}`;
    con.query(query, function (err, result) {
        if (err) throw err;
        callback(result.length>0);
    });
}

function vote_user_get_votes(username, password, voteid, callback)
{
    user_verify_id(username, password, (g, userid)=>{
        if(!g) {callback(false); return; }
        var query = `SELECT * FROM vote_options WHERE id IN 
                    (SELECT vote_option FROM vote_user_vote WHERE userid=${userid} AND voteid=${voteid})`;
        con.query(query, function (err, result) {
            if (err) throw err;
            callback(result);
        });
    });
}

function vote_user_add_vote(username, password, vote_option_id, callback) {
    user_verify_id(username, password, (g, userid)=>{
        if(!g) {callback(false); return; }
        vote_option_get_by_id(vote_option_id, voteopt=>{
            vote_event_verify_member(userid, voteopt["voteid"], k=>{
                if(!k) {callback(false); return; }
                vote_user_voted_for(userid, vote_option_id, l=>{
                    if(l) {callback(false); return; }
                    var query = `INSERT INTO vote_user_vote(userid, vote_option, voteid) VALUES
                                 (${userid}, ${vote_option_id},${voteopt["voteid"]})`;
                    con.query(query, function (err, result) {
                        if (err) { callback(false); return; } 
                        callback(true);
                    });
                })

            })
        })
    })
}

function vote_user_remove_vote(username, password, vote_option_id, callback) {
    user_verify_id(username, password, (g, userid)=>{
        if(!g) {callback(false); return; }
        var query = `DELETE FROM vote_user_vote WHERE userid=${userid} AND vote_option=${vote_option_id}`;
        con.query(query, function (err, result) {
            if (err) { callback(false); return; } 
            callback(true);
        });
    });
}