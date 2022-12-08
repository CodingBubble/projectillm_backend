
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

function user_get_by_name(username, password, callback) {
    username = convert_user_input(username);
    password = convert_user_input(password);
    var query = 'SELECT * FROM `users` WHERE username="'+username+'"';
    con.query(query, function (err, result) {
        if (err) throw err;
        if (result.length == 0) { callback(-1); return; }
		if (result[0]["password"]!=password) { callback(-1); return; }
        callback(result[0]["id"]);
     });
}


function user_create(username, password, callback) {
    username = convert_user_input(username);
    password = convert_user_input(password);
    var query = `INSERT INTO users( username, password) VALUES ("${username}","${password}")`;
    con.query(query, function (err, result) {
		if (err) { callback({}); return; }
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
