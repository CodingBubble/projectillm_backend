

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
				if (err) { callback({}); return; } 
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

function event_load_msgs_gen(username, password, eventid, part, callback)
{
    user_verify_id(username, password, (g, userid)=>{
        if(!g) { callback([]); return; }
        event_group_verify_member(userid, eventid, m=>{
            if(!m) { callback([]); return; }
            var query = `SELECT event_messages.*, username FROM event_messages, users WHERE userid=users.id and eventid=${eventid} 
                            ORDER by date DESC LIMIT ${part*settings["msg_load_num"]}, ${(settings["msg_load_num"])}`;
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
        if(!g) {callback(false); return;}
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


function event_load_votes(username, password, eventid, callback)
{
    user_verify_id(username, password, (g, userid)=>{
        if(!g) { callback([]); return; }
        event_group_verify_member(userid, eventid, m=>{
            if(!m) { callback([]); return; }
            var query = `SELECT * FROM votes WHERE eventid=${eventid}`;
            con.query(query, function (err, result) {
                if (err) { callback([]); return; } 
                callback(result);
            });
        })
    })
}




function event_announcement_load_by_id(msgid, callback)
{
    var query = `SELECT * FROM event_announcements WHERE id=${msgid} `
    con.query(query, function (err, result) {
        if (err) {callback({}); return; } 
        callback(result[0]);
    });
}


function event_load_announcements(username, password, eventid, callback)
{
    user_verify_id(username, password, (g, userid)=>{
        if(!g) { callback([]); return; }
        event_group_verify_member(userid, eventid, m=>{
            if(!m) { callback([]); return; }
            var query = `SELECT * FROM event_announcements WHERE eventid=${eventid} ORDER by date DESC`;
            con.query(query, function (err, result) {
                if (err) { callback(false); return; } 
                callback(result);
            });
        })
    })
}

function event_load_announcements_gen(username, password, eventid, part, callback)
{
    user_verify_id(username, password, (g, userid)=>{
        if(!g) { callback([]); return; }
        event_group_verify_member(userid, eventid, m=>{
            if(!m) { callback([]); return; }
            var query = `SELECT * FROM event_announcements WHERE eventid=${eventid} 
                            ORDER by date DESC LIMIT ${part*settings["msg_load_num"]}, ${(settings["msg_load_num"])}`;
            con.query(query, function (err, result) {
                if (err) { callback(false); return; } 
                callback(result);
            });
        })
    })
}

function event_announcement_send(username, password, eventid, msg, callback)
{
    msg = convert_user_input(msg);
	event_user_is_admin(username, password, eventid, f=>{
		if(!f) { callback({}); return; }
		var query = `INSERT INTO event_announcements(eventid, text, date) VALUES (${eventid},"${msg}",NOW())`;
		con.query(query, function (err, result) {
			if (err) { callback({}); return; } 
			con.query("SELECT LAST_INSERT_ID();", (err, msgid)=>{
				if (err) throw err;
				event_announcement_load_by_id(msgid[0]["LAST_INSERT_ID()"], callback)
			});
		});
	})
}

function event_announcement_delete(username, password, msgid, callback)
{
	event_user_is_admin(username, password, eventid, f=>{
		if(!f) {callback(false); return;}
		var query = `DELETE FROM event_announcements WHERE id=${msgid}`
		con.query(query, function (err, result) {
			callback(err==undefined)
		})
	}); 
}
