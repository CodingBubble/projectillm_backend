const fs = require('fs')

function save_binary(name, body) {
    fs.cre
    fs.writeFile("./sharepoint/" + name + '.jpg', body, 'binary', err=>{});
}

function load_binary(name, callback)
{
    fs.readFile("./sharepoint/" + name + '.jpg', function(err, data) {
        if (err) throw err; 
        callback(data);
    });
}

function delete_binary(name) {   
    fs.unlink("./sharepoint/" + name + '.jpg', err=>{}); 
}


function is_file_owner(username, password, fileid, callback) {
    user_verify_id(username, password, (g, userid) => {
        if (!g) { callback(false); return; } 
        var query = `SELECT ownerid FROM files WHERE id=${fileid}`;
        con.query(query, (err, result)=> {
            callback(userid=result[0]["ownerid"]);
        })
    });
}

function can_access(username, password, fileid, callback) {
    user_verify_id(username, password, (g, userid) => {
        if (!g) { callback(false); return; } 
        var query = `SELECT groupid FROM files WHERE id=${fileid}`;
        con.query(query, (err, result)=> group_verify_member(userid, result[0]["groupid"], callback))
    });
}


function upload_file(username, password, groupid, fildata, callback) {
    user_verify_id(username, password, (g, userid) => {
        if (!g) { callback(-1); return; } 
        group_verify_member(userid, groupid, k=>{
            if (!k) { callback(-1); return; } 
            var query = `INSERT INTO files(groupid, ownerid) VALUES (${groupid},${userid});`;
            con.query(query, (err, result)=> {
                if (err) throw err;
                con.query("SELECT LAST_INSERT_ID();", (err, fileid)=>{
                    if (err) throw err;
                    save_binary(fileid[0]['LAST_INSERT_ID()'], fildata);
                    callback(fileid[0]['LAST_INSERT_ID()']);
                });
            })
        });
    });
}

function delete_file(username, password, fileid, callback) {
    is_file_owner(username, password, fileid, cb=>{
        if (!cb) {callback(false); return; }
        var query = "DELETE FROM files WHERE id="+fileid;
        con.query(query, function (err, result) {
            if (err) throw err;
            delete_binary(fileid);
            callback(true);
        });
    })
}

function access_file(username, password, fileid, callback) {
    can_access(username, password, fileid, cb=>{
        if (!cb) {callback(""); return; }
        load_binary(fileid, callback);
    })
}

