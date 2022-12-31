
function item_get_by_id(itemid, callback)
{
    var query = `SELECT * FROM list_items WHERE id = ${itemid}`;
    con.query(query, function (err, result) {
        if (err) throw err;
        if (result.length == 0) callback({});
        else callback(result[0])
    });
}

function item_user_is_admin(username, password, voteid, callback)
{
    item_get_by_id(voteid, f=>{
        event_user_is_admin(username, password, f["eventid"], callback)
    })
}

function event_list_load(username, password, eventid, callback)
{
    user_verify_id(username, password, (g, userid)=>{
        if(!g) { callback([]); return; }
        event_group_verify_member(userid, eventid, m=>{
            if(!m) { callback([]); return; }
            var query = `SELECT * FROM list_items WHERE eventid=${eventid}`;
            con.query(query, function (err, result) {
                if (err) { callback([]); return; } 
                callback(result);
            });
        })
    })
}

function event_list_add_item(username, password, eventid, title, callback)
{
    title = convert_user_input(title);
    event_user_is_admin(username, password, eventid, g2=>{
        if (!g2) { callback({}); return; }
        var query = `INSERT INTO list_items(title, eventid) VALUES ("${title}",${eventid})`;
        con.query(query, function (err, result) {
            if (err) { callback({}); return; } 
            con.query("SELECT LAST_INSERT_ID()", function (err, res) {
                if (err) { callback({}); return; } 
                item_get_by_id(res[0]["LAST_INSERT_ID()"], callback)     
            });
        })
    });
}

function event_list_remove_item(username, password, id, callback) {
    item_user_is_admin(username, password, id, g=>{
        if(!g) { callback(false); return; }
        var query = `DELETE FROM list_items WHERE id=${id}`;
        con.query(query, function (err, result) {
            if (err) { callback(false); return; } 
            callback(true);
        });
    })
}

function event_list_set_user(username, password, id, callback){
    user_verify_id(username, password, (g, userid)=>{
        if(!g) { callback(false); return; }
        item_get_by_id(id, c=>{
            if (Object.keys(c) == 0) {callback(false); return; }
            event_is_member(userid, c["eventid"], k=>{
                if (!k) {callback(false); return; }
                if (c["user_bring"]!="") {callback(false); return; }
                var query = `UPDATE list_items SET user_bring="${username}" WHERE id=${id}`;
                con.query(query, function (err, result) {
                    if (err) { callback(false); return; } 
                    callback(true);
                });
            })
        })
    });
}

function event_list_reset_user(username, password, id, callback){
    user_verify_id(username, password, (g, userid)=>{
        if(!g) { callback(false); return; }
        item_get_by_id(id, c=>{
            if (Object.keys(c) == 0) {callback(false); return; }
            if (c["user_bring"]!=username) {callback(false); return; }
            var query = `UPDATE list_items SET user_bring="" WHERE id=${id}`;
            con.query(query, function (err, result) {
                if (err) { callback(false); return; } 
                callback(true);
            });
        })
    });
}