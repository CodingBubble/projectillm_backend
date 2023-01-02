const mysql = require("mysql");
const settings = require("./api_conn_settings.json")
const fs = require('fs');
eval(fs.readFileSync('./db_fncs/user.js')+'');
eval(fs.readFileSync("./db_fncs/group.js")+'');
eval(fs.readFileSync("./db_fncs/event.js")+'');
eval(fs.readFileSync("./db_fncs/vote.js")+'');
eval(fs.readFileSync("./db_fncs/files.js")+'');
eval(fs.readFileSync("./db_fncs/lists.js")+'');
eval(fs.readFileSync("./db_fncs/splid.js")+'');

convert_user_input = (str)=>str.replace(/\"/g, "\\\"");


const cnvStr = r=>r;
const cnvInt = r=>parseInt(r);
const output_bool_Conv = r=>{return {"success": true, "result": r}};
const output_int_Conv = r=>{return {"success": true, "result":  r}};
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
	user_get_by_name: {args: [cnvStr, cnvStr], fn: user_get_by_name, out:output_int_Conv},
    user_get_by_id: {args: [cnvInt], fn:  user_get_by_id, out:output_object_Conv},
    group_get_by_id: {args: [cnvInt], fn:  group_get_by_id, out:output_object_Conv},
    event_get_by_id: {args: [cnvInt], fn:  event_get_by_id, out:output_object_Conv},
    vote_get_by_id: {args: [cnvInt], fn:  vote_get_by_id, out:output_object_Conv},
    vote_option_get_by_id: {args: [cnvInt], fn:  vote_option_get_by_id, out:output_object_Conv},
	event_is_member: {args: [cnvInt, cnvInt], fn:  event_is_member, out:output_bool_Conv},
    user_verify: {args: [cnvStr, cnvStr], fn: user_verify, out:output_bool_Conv},
    user_create:  {args: [cnvStr, cnvStr], fn: user_create, out:output_object_Conv},
    user_change_password: {args: [cnvStr, cnvStr, cnvStr], fn: user_change_password, out:output_bool_Conv},
    user_delete:  {args: [cnvStr, cnvStr], fn: user_delete, out:output_bool_Conv},
    user_get_groups:  {args: [cnvStr, cnvStr], fn: user_get_groups, out:output_list_Conv},
    user_use_invitation_code:  {args: [cnvStr, cnvStr, cnvStr], fn: user_use_invitation_code, out:output_object_Conv},
    user_get_all_active_joined_events:  {args: [cnvStr, cnvStr], fn: user_get_all_active_joined_events, out:output_list_Conv},
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
    group_load_msgs_gen:  {args: [cnvStr, cnvStr, cnvInt, cnvInt], fn: group_load_msgs_gen, out:output_list_Conv},
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
    event_load_msgs:  {args: [cnvStr, cnvStr, cnvInt], fn: event_load_msgs, out:output_list_Conv},
    event_load_msgs_gen:  {args: [cnvStr, cnvStr, cnvInt, cnvInt], fn: event_load_msgs_gen, out:output_list_Conv},
    event_msg_send:  {args: [cnvStr, cnvStr, cnvInt, cnvStr], fn: event_msg_send, out:output_bool_Conv},
    event_msg_delete:  {args: [cnvStr, cnvStr, cnvInt], fn: event_msg_delete, out:output_bool_Conv},
    event_load_announcements:  {args: [cnvStr, cnvStr, cnvInt], fn: event_load_announcements, out:output_list_Conv},
    event_load_announcements_gen:  {args: [cnvStr, cnvStr, cnvInt, cnvInt], fn: event_load_announcements_gen, out:output_list_Conv},
    event_announcement_send:  {args: [cnvStr, cnvStr, cnvInt, cnvStr], fn: event_announcement_send, out:output_bool_Conv},
    event_announcement_delete:  {args: [cnvStr, cnvStr, cnvInt], fn: event_announcement_delete, out:output_bool_Conv},
    event_load_votes:  {args: [cnvStr, cnvStr, cnvInt], fn: event_load_votes, out:output_list_Conv},
    vote_create:  {args: [cnvStr, cnvStr, cnvInt, cnvStr], fn: vote_create, out:output_object_Conv},
    vote_delete:  {args: [cnvStr, cnvStr, cnvInt], fn: vote_delete, out:output_bool_Conv},
    vote_update:  {args: [cnvStr, cnvStr, cnvInt, cnvStr], fn: vote_update, out:output_bool_Conv},
    vote_get_count:  {args: [cnvStr, cnvStr, cnvInt], fn: vote_get_count, out:output_int_Conv},
    vote_load_options:  {args: [cnvStr, cnvStr, cnvInt], fn: vote_load_options, out:output_list_Conv},
    vote_user_get_votes:  {args: [cnvStr, cnvStr, cnvInt], fn: vote_user_get_votes, out:output_list_Conv},
    vote_option_create:  {args: [cnvStr, cnvStr, cnvInt, cnvStr], fn: vote_option_create, out:output_object_Conv},
    vote_option_delete:  {args: [cnvStr, cnvStr, cnvInt], fn: vote_option_delete, out:output_bool_Conv},
    vote_option_update:  {args: [cnvStr, cnvStr, cnvInt, cnvStr], fn: vote_option_update, out:output_bool_Conv},
    vote_option_get_count:  {args: [cnvStr, cnvStr, cnvInt], fn: vote_option_get_count, out:output_int_Conv},
    vote_user_add_vote:  {args: [cnvStr, cnvStr, cnvInt], fn: vote_user_add_vote, out:output_bool_Conv},
    vote_user_remove_vote:  {args: [cnvStr, cnvStr, cnvInt], fn: vote_user_remove_vote, out:output_bool_Conv},
    delete_file: {args: [cnvStr, cnvStr, cnvInt], fn: delete_file, out:output_bool_Conv},
    access_file: {args: [cnvStr, cnvStr, cnvInt], fn: access_file, out:output_bool_Conv, img_ret:true},
    event_list_load: {args: [cnvStr, cnvStr, cnvInt], fn: event_list_load, out:output_list_Conv},
    event_list_add_item: {args: [cnvStr, cnvStr, cnvInt, cnvStr], fn: event_list_add_item, out:output_object_Conv},
    event_list_remove_item: {args: [cnvStr, cnvStr, cnvInt], fn: event_list_remove_item, out:output_bool_Conv},
    event_list_set_user: {args: [cnvStr, cnvStr, cnvInt], fn: event_list_set_user, out:output_bool_Conv},
    event_list_reset_user: {args: [cnvStr, cnvStr, cnvInt], fn: event_list_reset_user, out:output_bool_Conv},
    transaction_create:  {args: [cnvStr, cnvStr, cnvInt, cnvInt, cnvInt,cnvStr, cnvInt], fn: transaction_create, out:output_object_Conv},
    transaction_delete:  {args: [cnvStr, cnvStr, cnvInt], fn: transaction_delete, out:output_bool_Conv},
    transactions_get_of:  {args: [cnvStr, cnvStr], fn: transactions_get_of, out:output_list_Conv},
    transactions_get_in:  {args: [cnvStr, cnvStr, cnvInt], fn: transactions_get_in, out:output_list_Conv},
    transactions_get_between:  {args: [cnvStr, cnvStr, cnvInt], fn: transactions_get_between, out:output_list_Conv},
    transactions_get_of_in:  {args: [cnvStr, cnvStr, cnvInt, cnvInt], fn: transactions_get_of_in, out:output_list_Conv},
    transactions_get_between_in:  {args: [cnvStr, cnvStr, cnvInt, cnvInt, cnvInt], fn: transactions_get_between_in, out:output_list_Conv},
}


exports.upload_file = upload_file;


var con = mysql.createConnection(settings);

con.connect(function(err) {
if (err) throw err; 
con.query("USE projectillm", function (err, result) {
    if (err) throw err;
    console.log("Connected!");

    //vote_create("Jakob", "Test1234", 26, "TestPoll", console.log)
    //event_load_votes("Jakob", "Test1234", 26, console.log)
    //vote_update("Jakob", "Test1234", 2, "TestPoll Changed", console.log);
    //vote_option_create("Jakob", "Test1234", 2, "Benis", console.log);
    //vote_load_options("Jakob", "Test1234", 2, console.log);
   // vote_user_add_vote("Jakob", "Test1234", 1, console.log);
    //vote_get_count("Jakob", "Test1234", 2, console.log)
    //vote_option_get_count("Jakob", "Test1234", 1, console.log)
    //vote_user_remove_vote("Jakob", "Test1234", 1, console.log);
    //vote_user_get_votes("Jakob", "Test1234", 2, console.log)


    // group_user_is_admin("Jakob", "Test1234", 16, console.log)
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


