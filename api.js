const mysql = require("mysql");
const settings = require("./api_conn_settings.json")

var con = mysql.createConnection(settings);


convert_user_input = (str)=>str.replace(/\"/g, "\\\"");

function user_verify(username, password, callback) {
    username = convert_user_input(username);
    password = convert_user_input(password);
    var query = 'SELECT `password` FROM `users` WHERE username="'+username+'"';
    con.query(query, function (err, result) {
        if (err) throw err;
        if (result.length == 0) { callback(false); return; }
        callback(result[0]["password"]==password);
      });
}

function user_get_by_id(id, callback)
{
    var query =  'SELECT id, username FROM `users` WHERE id="'+id+'"'
    con.query(query, function (err, result) {
        if (err) throw err;
        if (result.length == 0) callback({})
        else callback(result[0])
      });
}

function user_verify_id(username, password, callback) {
    username = convert_user_input(username);
    password = convert_user_input(password);
    var query = 'SELECT * FROM `users` WHERE username="'+username+'"';
    con.query(query, function (err, result) {
        if (err) throw err;
        if (result.length == 0) { callback(false); return; }
        callback(result[0]["password"]==password, result[0]["id"]);
      });
}

function user_create(username, password, callback) {
    username = convert_user_input(username);
    password = convert_user_input(password);
    var query = `INSERT INTO users( username, password) VALUES ("${username}","${password}")`;
    con.query(query, function (err, result) {
        user_verify_id(username, password, (g, k)=>user_get_by_id(k,callback));
      });
}

function user_change_password(username, old_password, new_password, callback) {
    username = convert_user_input(username);
    new_password = convert_user_input(new_password);
    user_verify(username, old_password, g => {
        if (!g) { callback(false); return; } 
        var query = `UPDATE users SET password="${new_password}" WHERE username="${username}"`;
        con.query(query, function (err, result) {
            callback(err==null );
          });
    })
}

function user_delete(username, password, callback) {
    username = convert_user_input(username);
    user_verify(username, password, g => {
        if (!g) { callback(false); return; } 
        var query = `DELETE FROM users WHERE username="${username}"` 
        con.query(query, function (err, result) {
            callback(err==null);
          });
    });
}

function user_get_groups(username, password, callback) {
    username = convert_user_input(username);
    password = convert_user_input(password);
    user_verify_id(username, password, (g, id)=>{
        if (!g) { callback([]); return; } 
        var query = `SELECT * FROM groups WHERE id IN (SELECT groupid FROM group_members WHERE userid=${id})` 
        con.query(query, function (err, result) {
            if (err) throw err;
            callback(result)
        });
    })
}

function user_use_invitation_code(username, password, code, callback)
{
    code = convert_user_input(code);
    user_verify_id(username, password, (g, userid)=>{
        if (!g) { callback(false); return; } 
        var query = `SELECT groupid FROM group_invite_keys WHERE code="${code}"` 
        con.query(query, function (err, result) {
            if (err) throw err;
            if (result.length == 0) {callback(false); return;}
            var groupid = result[0]["groupid"];
            query = `SELECT id FROM group_members WHERE groupid=${groupid} AND userid=${userid}` 
            con.query(query, function (err, result) {
                if (err) throw err;
                if (result.length != 0) {callback(false); return;}
                query = `INSERT INTO group_members(groupid,userid) VALUES (${groupid}, ${userid})` 
                con.query(query, function (err, result) {
                    if (err) throw err;
                    callback(true)
                })
            })          
        });
    });
}

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
        let r = (Math.random() + 1).toString(36).substring(7);
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
                    groud_get_by_id(groupid, callback)
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
        if (!g) { callback([]); return; } 
        group_verify_member(userid, groupid, k=>{
            if (!k) { callback([]); return; } 
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

function event_get_by_id(eventid, callback)
{
    var query = `SELECT * FROM events WHERE id = ${eventid}`;
    con.query(query, function (err, result) {
        if (err) throw err;
        if (result.length == 0) callback({})
        else callback(result[0])
    });
}

function event_user_is_admin(username, password, eventid, callback)
{
    user_verify_id(username, password, (g, userid) => {
        if (!g) { callback(false); return; } 
        event_get_by_id(eventid, event=>{
            if (!event) callback(false); 
            else callback(event["creator"]==userid);
        });
    });
}

function event_create(username, password, groupid, eventname, eventdesc, date, callback)
{
    eventname = convert_user_input(eventname);
    eventdesc = convert_user_input(eventdesc);
    user_verify_id(username, password, (g, userid) => {
        if (!g) { callback({}); return; } 
        group_verify_member(userid, groupid, g2=>{
            if (!g2) { callback({}); return; }
            var query = `INSERT INTO events(creator, groupid, eventname, description, date) VALUES 
                        (${userid},${groupid},"${eventname}","${eventdesc}",FROM_UNIXTIME(${date}))`;
            con.query(query, function (err, result) {
                con.query("SELECT LAST_INSERT_ID()", function (err, res) {
                    if (err) { callback({}); return; } 
                    query = `INSERT INTO event_members(eventid, userid) VALUES (${res[0]["LAST_INSERT_ID()"]}, ${userid})`;
                    con.query(query, function (err, result) {
                        if (err)  { callback({}); return; } 
                        event_get_by_id(res[0]["LAST_INSERT_ID()"], callback)
                    });
                });
            })
        });
    });
}

function event_update(username, password, eventid, eventname, eventdesc, date, callback)
{
    event_user_is_admin(username, password, eventid, g=>{
        if(!g) { callback(false); return; }
        var query = `UPDATE events SET eventname="${eventname}",description="${eventdesc}",date=FROM_UNIXTIME(${date}) WHERE id=${eventid}`;
        con.query(query, function (err, result) {
            if (err) { callback(false); return; } 
            callback(true);
        });
    })
}

function event_group_verify_member(userid, eventid, callback)
{
    var query = `SELECT id FROM group_members WHERE userid=${userid} AND groupid=(SELECT groupid FROM events WHERE id=${eventid})`;
    con.query(query, function (err, result) {
        if (err) throw err;
        callback(result.length>0);
    });
}

function event_is_member(userid, eventid, callback)
{
    var query = `SELECT id FROM event_members WHERE userid=${userid} AND eventid=${eventid}`;
    con.query(query, function (err, result) {
        if (err) throw err;
        callback(result.length>0);
    });
}

function event_get_members(username, password, eventid, callback)
{
    user_verify_id(username, password, (g, userid) => {
        if (!g) { callback([]); return; } 
        event_group_verify_member(userid, eventid, k=>{
            if (!k) { callback([]); return; } 
            var query = `SELECT id, username FROM users WHERE id IN (SELECT userid FROM event_members WHERE eventid=${eventid})`;
            con.query(query, function (err, result) {
                if (err) throw err;
                callback(result);
            });
        })
    })
} 

function event_join(username, password, eventid, callback)
{
    user_verify_id(username, password, (g, userid)=>{
        if (!g) {callback(false); return;}
        event_group_verify_member(userid, eventid, c=>{
            if (!c) {callback(false); return;}
            event_is_member(userid, eventid, k=>{
                if (k) {callback(false); return;}
                var query = `INSERT INTO event_members(userid, eventid) VALUES (${userid}, ${eventid})`;
                con.query(query, function (err, result) {
                    if (err) throw err;
                    callback(true);
                });
            })
        })
    })
}

function event_leave(username, password, eventid, callback)
{
    user_verify_id(username, password, (g, userid)=>{
        if (!g) {callback(false); return;}
        event_user_is_admin(username, password, eventid, d=>{
            if (d) {callback(false); return;}
            event_is_member(userid, eventid, c=>{
                if (!c) {callback(false); return;}
                var query = `DELETE FROM event_members WHERE eventid=${eventid} AND  userid=${userid}`
                con.query(query, function (err, result) {
                    if (err) throw err;
                    callback(true);
                });
            })
        });
    });
}

function event_delete(username, password, eventid, callback)
{
    event_user_is_admin(username, password, eventid, g=>{
        if(!g) { callback(false); return; }
        var query = `DELETE FROM events WHERE id=${eventid}`;
        con.query(query, function (err, result) {
            if (err) { callback(false); return; } 
            callback(true);
        });
    })
}

function event_load_msgs(username, password, eventid, callback)
{
    user_verify_id(username, password, (g, userid)=>{
        if(!g) { callback([]); return; }
        event_group_verify_member(userid, eventid, m=>{
            if(!m) { callback([]); return; }
            var query = `SELECT event_messages.*, username FROM event_messages, users WHERE userid=users.id and eventid=${eventid} ORDER by date DESC`;
            con.query(query, function (err, result) {
                if (err) { callback(false); return; } 
                callback(result);
            });
        })
    })
}

function event_msg_load_by_id(msgid, callback)
{
    var query = `SELECT event_messages.*, username FROM event_messages, users WHERE userid=users.id and event_messages.id=${msgid} `
    con.query(query, function (err, result) {
        if (err) {callback({}); return; } 
        callback(result[0]);
    });
}

function event_msg_send(username, password, eventid, msg, callback)
{
    msg = convert_user_input(msg);
    user_verify_id(username, password, (g, userid)=>{
        if(!g) { callback({}); return; }
        event_is_member(userid, eventid, f=>{
            if(!f) { callback({}); return; }
            var query = `INSERT INTO event_messages(userid, eventid, text, date) VALUES (${userid},${eventid},"${msg}",NOW())`;
            con.query(query, function (err, result) {
                if (err) { callback({}); return; } 
                con.query("SELECT LAST_INSERT_ID();", (err, msgid)=>{
                    if (err) throw err;
                    event_msg_load_by_id(msgid[0]["LAST_INSERT_ID()"], callback)
                });
            });
        })
    })
}

function event_msg_delete(username, password, msgid, callback)
{
    user_verify_id(username, password, (g, userid)=>{
        event_msg_load_by_id(msgid, c=>{
            if(!c) {callback(false); return;}
            if(c["userid"]!=userid) { callback(false); return; }
            var query = `DELETE FROM event_messages WHERE id=${msgid}`
            con.query(query, function (err, result) {
                callback(err==undefined)
            });
        })
    });
}



const cnvStr = r=>r.replace(/\\n/, "\n");
const cnvInt = r=>parseInt(r);
const output_bool_Conv = r=>{return {"success": true, "result": r}};
const output_object_Conv = r=>{
    var ret = {}
    Object.keys(r).forEach(key=>{
        ret[key]=r[key];
    })
    return  {"success": true, "result": ret} 
}
const output_list_Conv = r=>{
    var ret1=[]
    r.forEach(set=>{
        var ret = {}
        Object.keys(set).forEach(key=>{
            ret[key]=set[key];
        })
        ret1.push(ret)
    })
    return  {"success": true, "result": ret1} 
}

exports.api_connector = {
    user_get_by_id: {args: [cnvInt], fn: user_get_by_id, out:output_object_Conv},
    group_get_by_id: {args: [cnvInt], fn: group_get_by_id, out:output_object_Conv},
    event_get_by_id: {args: [cnvInt], fn: event_get_by_id, out:output_object_Conv},
    user_verify: {args: [cnvStr, cnvStr], fn: user_verify, out:output_bool_Conv},
    user_create:  {args: [cnvStr, cnvStr], fn: user_create, out:output_object_Conv},
    user_change_password: {args: [cnvStr, cnvStr, cnvStr], fn: user_change_password, out:output_bool_Conv},
    user_delete:  {args: [cnvStr, cnvStr], fn: user_delete, out:output_bool_Conv},
    user_get_groups:  {args: [cnvStr, cnvStr], fn: user_get_groups, out:output_list_Conv},
    user_use_invitation_code:  {args: [cnvStr, cnvStr, cnvStr], fn: user_use_invitation_code, out:output_bool_Conv},
    group_user_is_admin:  {args: [cnvStr, cnvStr, cnvInt], fn: group_user_is_admin, out:output_bool_Conv},
    group_create_key:  {args: [cnvStr, cnvStr, cnvInt, cnvInt], fn: group_create_key, out:output_object_Conv},
    group_leave:  {args: [cnvStr, cnvStr, cnvInt], fn: group_leave, out:output_bool_Conv},
    group_kick:  {args: [cnvStr, cnvStr, cnvInt, cnvInt], fn: group_kick, out:output_bool_Conv},
    group_update:  {args: [cnvStr, cnvStr, cnvInt, cnvStr, cnvStr], fn: group_update, out:output_bool_Conv},
    group_create:  {args: [cnvStr, cnvStr, cnvStr, cnvStr], fn: group_create, out:output_object_Conv},
    group_get_members:  {args: [cnvStr, cnvStr, cnvInt], fn: group_get_members, out:output_list_Conv},
    group_delete:  {args: [cnvStr, cnvStr, cnvInt], fn: group_delete, out:output_bool_Conv},
    group_load_msgs:  {args: [cnvStr, cnvStr, cnvInt], fn: group_load_msgs, out:output_list_Conv},
    group_msg_send:  {args: [cnvStr, cnvStr, cnvInt, cnvStr], fn: group_msg_send, out:output_bool_Conv},
    group_msg_delete:  {args: [cnvStr, cnvStr, cnvInt], fn: group_msg_delete, out:output_bool_Conv},
    group_get_events_active:  {args: [cnvStr, cnvStr, cnvInt], fn: group_get_events_active, out:output_list_Conv},
    group_get_events_achieved: {args: [cnvStr, cnvStr, cnvInt], fn: group_get_events_achieved, out:output_list_Conv},
    group_msg_delete:  {args: [cnvStr, cnvStr, cnvInt], fn: group_msg_delete, out:output_bool_Conv},
    event_create:  {args: [cnvStr, cnvStr, cnvInt, cnvStr, cnvStr, cnvInt], fn: event_create, out:output_object_Conv},
    event_update:  {args: [cnvStr, cnvStr, cnvInt, cnvStr, cnvStr, cnvInt], fn: event_update, out:output_bool_Conv},
    event_delete:  {args: [cnvStr, cnvStr, cnvInt], fn: event_delete, out:output_bool_Conv},
    event_get_members:  {args: [cnvStr, cnvStr, cnvInt], fn: event_get_members, out:output_list_Conv},
    event_join:  {args: [cnvStr, cnvStr, cnvInt], fn: event_join, out:output_bool_Conv},
    event_leave:  {args: [cnvStr, cnvStr, cnvInt], fn: event_leave, out:output_bool_Conv},
    event_load_msgs:  {args: [cnvStr, cnvStr, cnvInt], fn: group_load_msgs, out:output_list_Conv},
    event_msg_send:  {args: [cnvStr, cnvStr, cnvInt, cnvStr], fn: event_msg_send, out:output_bool_Conv},
    event_msg_delete:  {args: [cnvStr, cnvStr, cnvInt], fn: event_msg_delete, out:output_bool_Conv},
}


con.connect(function(err) {
    if (err) throw err; 
    con.query("USE projectillm", function (err, result) {
        if (err) throw err;
        console.log("Connected!");
        //group_create("Jakob", "Test1234", "Testgruppe 2", "Platzhalter", (res,p2)=>{console.log(res);console.log(p2)})
        //group_create_key("Jakob", "Test1234", 1, 10, r=>console.log(r))
        //user_use_invitation_code("Jakob", "Test1234", "ksngl", c=>console.log(c))
        //event_delete("Jakob", "Test1234", 1, c=>console.log(c))
        //group_kick("Luca", "Test4321", 1, 1, c=>console.log(c))
        //group_leave("Luca", "Test4321", 1, c=>console.log(c))
        //event_join("Jakob", "Test1234", 2, c=>console.log(c))
        //event_leave("Luca", "Test4321", 2, console.log)
       // event_load_msgs("Jakob", "Test1234", 2, console.log)
        //event_msg_send_event("Jakob", "Test1234", 2, "Test", console.log)
       // event_msg_delete("Jakob", "Test1234", 3, console.log)
       //group_msg_send("Jakob", "Test1234", 1, "Testnachricht2", console.log);
      // group_load_msgs("Jakob", "Test1234", 1, console.log);
      //  group_msg_delete("Jakob", "Test1234", 1, console.log);
    });
  });
