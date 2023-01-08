
function order_ids(id1, id2, balance) {
    if (id1<id2) return [id1, id2, balance];
    return [id2, id1, -balance]
}

function transaction_get_by_id(id, callback)
{
    var query = `SELECT * FROM transactions WHERE id = ${id}`;
    con.query(query, function (err, result) {
        if (err) throw err;
        if (result.length == 0) callback({})
        else callback(result[0])
    });
}

function transaction_create(username, password, userid1, userid2, balance, title, groupid, callback) {
    title = convert_user_input(title);
    user_verify_id(username, password, (g, userid) => {
        if (!g) { callback({}); return; } 
        group_verify_member(userid, groupid, c=>{
            if (!c) { callback({}); return; } 
            group_verify_member(userid1, groupid, c=>{
                if (!c) { callback({}); return; } 
                group_verify_member(userid2, groupid, c=>{
                    if (!c) { callback({}); return; } 
                    [userid1, userid2, balance] = order_ids(userid1, userid2, balance);
                    var query = `INSERT INTO transactions(userid1, userid2, balance, title, groupid) 
                                        VALUES ("${userid1}", "${userid2}",${balance}, "${title}",${groupid});`;
                    con.query(query, (err, result)=> {
                        if (err) throw err;
                        con.query("SELECT LAST_INSERT_ID();", (err, transaction)=>{
                            if (err) throw err;
                                transaction_get_by_id(transaction[0]["LAST_INSERT_ID()"], callback)
                            })
                    })
                })
            });
        })
    });
}

function transaction_is_group_member(userid, tansid, callback)
{
    transaction_get_by_id(tansid, trans=>{
		group_verify_member(userid, trans["groupid"], callback); 
	})
}

function transaction_delete(username, password, transactionid, callback) {
    user_verify_id(username, password, (g, userid) => {
		if (!g) { console.log("E1"); callback([]); return; } 
		transaction_is_group_member(userid, transactionid, k=>{
			if (!k) {callback(false); return;}
			var query = "DELETE FROM transactions WHERE id="+transactionid;
			con.query(query, function (err, result) {
				if (err) throw err;
				callback(true);
			});
		})
    })       
}

function transactions_get_in(username, password, groupid, callback){
    user_verify_id(username, password, (g, userid) => {
        if (!g) { console.log("E1"); callback([]); return; } 
        group_verify_member(userid, groupid, k=>{
            if (!k) { console.log("E2"); callback([]); return; } 
            var query = `SELECT transactions.*, users1.username as "username1", users2.username as "username2" 
                            FROM (transactions, users as users1, users as users2) 
                            WHERE transactions.groupid=${groupid} and users1.id=transactions.userid1 and users2.id=transactions.userid2
                            ORDER BY id DESC`;
            con.query(query, function (err, result) {
                if (err) throw err;
                callback(result);
            });
        })
    })
}

function transactions_get_of(username, password, callback){
    user_verify_id(username, password, (g, userid) => {
        if (!g) { console.log("E1"); callback([]); return; } 
        var query = `SELECT transactions.*, users1.username as "username1", users2.username as "username2" 
                        FROM (transactions, users as users1, users as users2) 
                        WHERE (transactions.userid1=${userid} or transactions.userid2=${userid})
                                and users1.id=transactions.userid1 and users2.id=transactions.userid2
                        ORDER BY id DESC`;
        con.query(query, function (err, result) {
            if (err) throw err;
            result.forEach(element => {
                if (element["userid2"] == userid) {
                    element["balance"] = - element["balance"];
                }

            });
            callback(result);
        });
    });
}

function transactions_get_between(username, password, userid2, callback){
    user_verify_id(username, password, (g, userid1) => {
        if (!g) { console.log("E1"); callback([]); return; } 
        [userid1, userid2, factor] = order_ids(userid1, userid2, 1);
        var query = `SELECT * FROM transactions WHERE (userid1=${userid1} and userid2=${userid2}) ORDER BY id DESC`;
        con.query(query, function (err, result) {
            if (err) throw err;
            result.forEach(element => {
                element["balance"] = factor * element["balance"];
            });
            callback(result);
        });
    });
}

function transactions_get_of_in(username, password, userid1, groupid, callback){
    user_verify_id(username, password, (g, userid) => {
        if (!g) { console.log("E1"); callback([]); return; } 
        group_verify_member(userid, groupid, c=>{
            if (!c) { callback([]); return; } 
            var query = `SELECT transactions.*, users1.username as "username1", users2.username as "username2" 
                    FROM (transactions, users as users1, users as users2) 
                    WHERE (transactions.userid1=${userid1} or transactions.userid2=${userid1}) and groupid=${groupid}
                            and users1.id=transactions.userid1 and users2.id=transactions.userid2
                    ORDER BY id DESC`;
            con.query(query, function (err, result) {
                if (err) throw err;
                result.forEach(element => {
                    if (element["userid2"] == userid1) {
                        element["balance"] = - element["balance"];
                    }
                });
                callback(result);
            });
        });
    });
}

function transactions_get_between_in(username, password, userid1, userid2, groupid, callback){
    user_verify_id(username, password, (g, userid) => {
        if (!g) { console.log("E1"); callback([]); return; } 
        group_verify_member(userid, groupid, c=>{
            if (!c) { callback([]); return; } 
            [userid1, userid2, factor] = order_ids(userid1, userid2, 1);
            var query = `SELECT * FROM transactions WHERE (userid1=${userid1} and userid2=${userid2}) and groupid=${groupid} 
                                ORDER BY id DESC`;
            con.query(query, function (err, result) {
                if (err) throw err;
                result.forEach(element => {
                    element["balance"] = factor * element["balance"];
                });
                callback(result);
            });
        });
    });
}