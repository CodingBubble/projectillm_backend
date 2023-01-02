
var convert_user_input = r => r;
var con;

function group_user_is_admin(username, password, groupid, callback)
{
    user_verify_id(username, password, (g, userid) => {
        if (!g) { callback(false); return; } 
        group_get_by_id(groupid, group=>{
            callback(group["admin"]==userid);
        });
    });
}


function group_create_key(username, password, groupid, days, callback)
{
    group_user_is_admin(username, password, groupid, g=> {
        if (!g) { callback({}); return; }
        let r = (Math.random() + 1).toString(36).substring(2);
        var query = `INSERT INTO group_invite_keys (groupid, code, exp_date) VALUES (${groupid},"${r}",NOW()+INTERVAL ${days} DAY)` ;
        con.query(query, function (err, result) {
            if (err) throw err;
            callback({"key": r});
        });
    });
}

function group_leave(username, password, groupid, callback)
{
    user_verify_id(username, password, (g, userid)=>{
        if (!g) {callback(false);  return; }
        group_verify_member(userid, groupid, v=>{
            if(!v) { callback(false); return; }
            group_user_is_admin(username, password, groupid, c=>{
                if(c) { callback(false); return; }
                var query = `DELETE FROM group_members WHERE userid=${userid} AND groupid=${groupid}`;
                con.query(query, function (err, result) {
                    if (err) throw err;
                    group_remove_from_all_events(userid, groupid, cb=>{
                        callback(true);
                    })
                });
            })
        })
    })
}

function group_kick(username, password, userid, groupid, callback)
{
    user_verify_id(username, password, (g, myuserid)=>{
        if (!g) {callback(false);  return; }
        if (myuserid==userid) { callback(false); return; }
        group_verify_member(userid, groupid, v=>{
            if(!v) { callback(false); return; }
            group_user_is_admin(username, password, groupid, c=>{
                if(!c) { callback(false); return; }
                var query = `DELETE FROM group_members WHERE userid=${userid} AND groupid=${groupid}`;
                con.query(query, function (err, result) {
                    if (err) throw err;
                    group_remove_from_all_events(userid, groupid, cb=>{
                        callback(true);
                    })
                });
            })
        })
    })
}

function group_update(username, password, groupid, new_name, new_desc)
{
    group_user_is_admin(username, password, groupid, isadmin => {
        if (!isadmin) {callback(false); return;}
        var query = `UPDATE groups SET groupname="${new_name}", description="${new_desc}" WHERE id=${groupid}`;
        con.query(query, function (err, result) {
            if (err) throw err;
            callback(true);
        });
    })   
}

function group_verify_member(userid, groupid, callback) {
    var query = `SELECT id FROM group_members WHERE userid=${userid} AND groupid=${groupid}`;
    con.query(query, function (err, result) {
        if (err) throw err;
        callback(result.length>0);
    });
}

function group_create(username, password, groupname, groupdesc, callback) {
    groupname = convert_user_input(groupname);
    groupdesc = convert_user_input(groupdesc);
    user_verify_id(username, password, (g, userid) => {
        if (!g) { callback({}); return; } 
        var query = `INSERT INTO groups(groupname, description, admin) VALUES ("${groupname}","${groupdesc}",${userid});`;
        con.query(query, (err, result)=> {
            if (err) throw err;
            con.query("SELECT LAST_INSERT_ID();", (err, groupid)=>{
                if (err) throw err;
                query = `INSERT INTO group_members(groupid, userid) VALUES (${groupid[0]["LAST_INSERT_ID()"]}, ${userid});`;
                con.query(query, (err, result)=>{
                    if (err) throw err;
                    group_get_by_id(groupid[0]["LAST_INSERT_ID()"], callback)
                })
            })
        });
    });
}

function group_get_by_id(groupid, callback)
{
    var query = `SELECT * FROM groups WHERE id = ${groupid}`;
    con.query(query, function (err, result) {
        if (err) throw err;
        if (result.length == 0) callback({})
        else callback(result[0])
    });
}

function group_get_members(username, password, groupid, callback)
{
    user_verify_id(username, password, (g, userid) => {
        if (!g) { callback([]); return; } 
        group_verify_member(userid, groupid, k=>{
            if (!k) { callback([]); return; } 
            var query = `SELECT id, username FROM users WHERE id IN (SELECT userid FROM group_members WHERE groupid=${groupid})`;
            con.query(query, function (err, result) {
                if (err) throw err;
                callback(result);
            });
        })
    })
}

function group_delete(username, password, groupid, callback)
{
    group_user_is_admin(username, password, groupid, isadmin => {
        if (!isadmin) {callback(false); return;}
        var query = "DELETE FROM groups WHERE id="+groupid;
        con.query(query, function (err, result) {
            if (err) throw err;
            callback(true);
        });
    })       
}

function group_load_msgs(username, password, groupid, callback)
{
    user_verify_id(username, password, (g, userid)=>{
        if(!g) { callback([]); return; }
        group_verify_member(userid, groupid, m=>{
            if(!m) { callback([]); return; }
            var query = `SELECT group_messages.*, username FROM group_messages, users WHERE userid=users.id and groupid=${groupid} ORDER by date DESC`;
            con.query(query, function (err, result) {
                if (err) { callback(false); return; } 
                callback(result);
            });
        })
    })
}

function group_load_msgs_gen(username, password, groupid, part, callback)
{
    user_verify_id(username, password, (g, userid)=>{
        if(!g) { callback([]); return; }
        group_verify_member(userid, groupid, m=>{
            if(!m) { callback([]); return; }
            var query = `SELECT group_messages.*, username FROM group_messages, users WHERE userid=users.id and groupid=${groupid} 
                        ORDER by date DESC LIMIT ${part*settings["msg_load_num"]}, ${(settings["msg_load_num"])}`;
            con.query(query, function (err, result) {
                if (err) { callback(false); return; } 
                callback(result);
            });
        })
    })
}

function group_msg_load_by_id(msgid, callback)
{
    var query = `SELECT group_messages.*, username FROM group_messages, users WHERE userid=users.id and group_messages.id=${msgid};`
    con.query(query, function (err, result) {
        if (err) {callback({}); return; } 
        callback(result[0]);
    });
}

function group_msg_send(username, password, groupid, msg, callback)
{
    msg = convert_user_input(msg);
    user_verify_id(username, password, (g, userid)=>{
        if(!g) { callback({}); return; }
        group_verify_member(userid, groupid, f=>{
            if(!f) { callback({}); return; }
            var query = `INSERT INTO group_messages(userid, groupid, text, date) VALUES (${userid},${groupid},"${msg}",NOW())`;
            con.query(query, function (err, result) {
                if (err) { callback({}); return; } 
                con.query("SELECT LAST_INSERT_ID();", (err, msgid)=>{
                    if (err) throw err;
                    group_msg_load_by_id(msgid[0]["LAST_INSERT_ID()"], callback)
                });
            });
        })
    })
}

function group_msg_delete(username, password, msgid, callback)
{
    user_verify_id(username, password, (g, userid)=>{
        if(!g) {callback(false); return;}
        group_msg_load_by_id(msgid, c=>{
            if(!c) {callback(false); return;}
            if(c["userid"]!=userid) { callback(false); return; }
            var query = `DELETE FROM group_messages WHERE id=${msgid}`
            con.query(query, function (err, result) {
                callback(err==undefined)
            });
        })
    });
}

function group_get_events_active(username, password, groupid, callback){
    user_verify_id(username, password, (g, userid) => {
        if (!g) { console.log("E1"); callback([]); return; } 
        group_verify_member(userid, groupid, k=>{
            if (!k) { console.log("E2"); callback([]); return; } 
            var query = `SELECT * FROM events WHERE groupid=${groupid} and date>(NOW() - INTERVAL 1 DAY) ORDER BY date ASC`;
            con.query(query, function (err, result) {
                if (err) throw err;
                callback(result);
            });
        })
    })
}

function group_get_events_achieved(username, password, groupid, callback) {
    user_verify_id(username, password, (g, userid) => {
        if (!g) { callback([]); return; } 
        group_verify_member(userid, groupid, k=>{
            if (!k) { callback([]); return; } 
            var query = `SELECT * FROM events WHERE groupid=${groupid} and date<(NOW() - INTERVAL 1 DAY) ORDER BY date DESC`;
            con.query(query, function (err, result) {
                if (err) throw err;
                callback(result);
            });
        })
    })
}


function group_remove_from_all_events(userid, groupid, callback) {
    var query = `DELETE FROM event_members WHERE userid=${userid} AND
                 (SELECT groupid FROM events WHERE id=eventid)=${groupid}`
    con.query(query, function (err, result) {
        if (err) throw err;
        callback(true);
    });          
}
