# Grouping Backend
Backend for the Open Source Grouping App

## How to Setup
1. Create a MySql Database and use import the database.sql file
2. Change the connection settings in the api_conn_settings.json file
3. (optional) Set up the Port-Settings in the server_setting.json file
4. Install the Dependencies (mysql, express)
6. Create a sharepoint folder in the root
7. Start the Node App with by calling index.js

## Api 
### Data Transmission
To access the api call the Url, for example
  http://localhost:8000/
and add input json after the / 
Example: 

**localhost:8000/{"command": "YOUR_COMMAND", "args":[YOUR_ARGS]}**

Replace **YOUR_COMMAND** with the command you want to execute and **YOUR_COMMAND** with parameters you want to send

# Commands
List of commands for the API
## User Commands

### user_get_by_name:
Loads the Userid of a user given its Name and Password

Args:
1. Name of the User [String]
2. Password of the User [String]

result: Id of the User [int]

### user_get_by_id:
Loads an user object given the id of a user

Args:
1. ID of the User [int]

result: Object: with Username and UserID

### user_verify:
Verifies Username and Pasword of a User

Args:
1. Name of the User [String]
2. Password of the User [String]

result: Bool: true if the Username and Password were correct, else false

### user_create:
Creates a new User Account given Name and Pasword. 

Args:
1. Name of the new User [String]
2. Password of the new User [String]

result: Object: of the newly created User Account

### user_change_password:
Changes the password of a user

Args:
1. Name of the User [String]
2. Old Password of the User [String]
3. New Password of the User

result: Bool: true if successful, else false

### user delete:
Deletes the account of a User 

Args:
1. Name of the User [String]
2. Password of the User [String]

result: Bool: true if successful, else false


### user_get_groups:
Returns all groups a given User is a member of 

Args:
1. Name of the User [String]
2. Password of the User [String]

result: Array of Objects: List of Groups


### user_use_invitation_code:
Adds a User to a Group via an Invitation Code

Args:
1. Name of the User [String]
2. Password of the User [String]
2. Invitation Group [String]

result: Bool: true if successful, else false

### user_get_all_active_joined_events:
Returns all active events a given User has joined

Args:
1. Name of the User [String]
2. Password of the User [String]

result: Array of Objects: List of Events


## Group Commands

### group_user_is_admin:
Checks if the User Executing is the Admin of a Group

Args:
1. Name of the User [String]
2. Password of the User [String]
3. Group Id [int]

result: Bool: true if the User is the admin of the Group

### group_create_key:
Creates a invite code for a Group > [Only the Admin of a Group can execute this]

Args:
1. Name of the executing user  [String]
2. Password of the executing user  [String]
3. Group Id [int]

result: Object: {key: "..."}


### group_leave:
Removes the executing user from a group

Args:
1. Name of the executing user[String]
2. Password of the executing user [String]
3. Group Id [int]

result: Bool: true if successful

### group_kick:
Removes the specified user from a group > [Only the Admin of a Group can execute this]

Args:
1. Name of the executing user[String]
2. Password of the executing user [String]
3. ID of the User to remove [int]
4. Group Id [int]

result: Bool: true if successful

### group_create:
Creates a new Group

Args:
1. Name of the executing user[String]
2. Password of the executing user [String]
3. Title of the new Group [String]
4. Description of the new Group [String]

result: Object: of the newly created Group

### group_update:
Updates title and description of a Group > [Only the Admin of a Group can execute this]

Args:
1. Name of the executing user[String]
2. Password of the executing user [String]
3. Id of the Group to Change [int]
4. New title of the Group [String]
5. New Description of the Group [String]

result: Bool: true if successful

### group_delete:
Deletes a Group > [Only the Admin of a Group can execute this]

Args:
1. Name of the executing user[String]
2. Password of the executing user [String]
3. Id of the Group to Delete [int]

result: Bool: true if successful

### group_get_members:
Loads all Users that are a member of a specified Group

Args:
1. Name of the executing user[String]
2. Password of the executing user [String]
3. Id of the Group [int]

result: List of Objects: Users that are member of the Group

### group_get_events_active:
Loads all Events that are currently active

Args:
1. Name of the executing user[String]
2. Password of the executing user [String]
3. Id of the Group [int]

result: List of Objects: Events that are currently active

### group_get_events_achieved:
Loads all Events that are no longer active

Args:
1. Name of the executing user[String]
2. Password of the executing user [String]
3. Id of the Group [int]

result: List of Objects: Events that are no longer active

### group_load_msgs:
Loads all Messages of a Group-Chat

Args:
1. Name of the executing user[String]
2. Password of the executing user [String]
3. Id of the Group [int]

result: List of Objects: Messages

### group_load_msgs_gen:
Loads all Messages of a Group-Chat Generative in Batches of 20

Args:
1. Name of the executing user[String]
2. Password of the executing user [String]
3. Id of the Group [int]
4. Batch number [int]

result: List of Objects: Messages

### group_msg_send:
Sends a Message into the Group Chat

Args:
1. Name of the executing user[String]
2. Password of the executing user [String]
3. Id of the Group [int]
4. Message [String]

result: Bool: true if successful

### group_msg_delete:
Deletes a Message in a Group Chat

Args:
1. Name of the executing user[String]
2. Password of the executing user [String]
3. Id of the Message [int]

result: Bool: true if successful

## Event Commands

### event_create:
Creates a new Event

Args:
1. Name of the executing user[String]
2. Password of the executing user [String]
3. Id of the Group the Event should be Created in
4. Title of the new Event [String]
5. Description of the new Event [String]
6. Time of the Event in millies [int]

result: Object: of the newly created Event

### event_leave:
Removes the executing user from an Event

Args:
1. Name of the executing user[String]
2. Password of the executing user [String]
3. Group Id [int]

result: Bool: true if successful

### event_join:
Makes a User join an Event

Args:
1. Name of the executing user[String]
2. Password of the executing user [String]
4. Event Id [int]

result: Bool: true if successful

### event_update:
Updates title, description and Time of an Event > [Only the creator of the Event can execute this]

Args:
1. Name of the executing user[String]
2. Password of the executing user [String]
3. Id of the Event to Change [int]
4. New title of the Event [String]
5. New Description of the Event [String]
6. New Time of the Event [int]

result: Bool: true if successful

### event_delete:
Deletes an Event  > [Only the creator of the Event can execute this]

Args:
1. Name of the executing user[String]
2. Password of the executing user [String]
3. Id of the Event to Delete [int]

result: Bool: true if successful

### event_get_members:
Loads all Users that joined of a specified Event

Args:
1. Name of the executing user[String]
2. Password of the executing user [String]
3. Id of the Event [int]

result: List of Objects: Users that are member of the Event

### event_load_msgs:
Loads all Messages of an Event-Chat

Args:
1. Name of the executing user[String]
2. Password of the executing user [String]
3. Id of the Event [int]

result: List of Objects: Messages

### event_load_msgs_gen:
Loads all Messages of an Event-Chat Generative in Batches of 20

Args:
1. Name of the executing user[String]
2. Password of the executing user [String]
3. Id of the Event [int]
4. Batch number [int]

result: List of Objects: Messages

### event_msg_send:
Sends a Message into the Event Chat

Args:
1. Name of the executing user[String]
2. Password of the executing user [String]
3. Message [String]

result: Bool: true if successful

### event_msg_delete:
Deletes a Message in an Event-Chat

Args:
1. Name of the executing user[String]
2. Password of the executing user [String]
3. Id of the Message [int]

result: Bool: true if successful

### event_load_announcements:
Loads all Announcements of an Event-Chat

Args:
1. Name of the executing user[String]
2. Password of the executing user [String]
3. Id of the Event [int]

result: List of Objects: Announcements

### event_load_announcements_gen:
Loads all Announcements of an Event-Chat Generative in Batches of 20

Args:
1. Name of the executing user[String]
2. Password of the executing user [String]
3. Id of the Event [int]
4. Batch number [int]

result: List of Objects: Announcements

### event_announcement_send:
Sends an Announcement into the Event Chat > [Only the creator of the Event can execute this]

Args:
1. Name of the executing user[String]
2. Password of the executing user [String]
3. Message [String]

result: Bool: true if successful

### event_announcement_delete:
Deletes an Announcement in an Event-Chat > [Only the creator of the Event can execute this]

Args:
1. Name of the executing user[String]
2. Password of the executing user [String]
3. Id of the Announcement [int]

result: Bool: true if successful


## Event Poll/Voting Commands

### vote_create:
Creates a new Vote > [Only the creator of the Event can execute this]

Args:
1. Name of the executing user[String]
2. Password of the executing user [String]
3. Id of the Event the Vote should be created in
4. Title of the new Vote [String]

result: Object: of the newly created Vote

### vote_update:
Updates the title of a Vote > [Only the creator of the Event can execute this]

Args:
1. Name of the executing user[String]
2. Password of the executing user [String]
3. Id of the Vote to Change [int]
4. New title of the Vote [String]

result: Bool: true if successful

### vote_delete:
Deletes a Vote  > [Only the creator of the Event can execute this]

Args:
1. Name of the executing user[String]
2. Password of the executing user [String]
3. Id of the Vote to Delete [int]

result: Bool: true if successful

### vote_get_count:
Fetches the Amount of Users that took part in a Vote

Args:
1. Name of the executing user[String]
2. Password of the executing user [String]
3. Id of the Vote [int]

result: Int: Number of Users

### vote_load_options:
Loads all Options in a Vote

Args:
1. Name of the executing user[String]
2. Password of the executing user [String]
3. Id of the Vote [int]

result: List of Objects: Options

### vote_user_get_votes:
Loads all Options the executing User took in a Vote

Args:
1. Name of the executing user[String]
2. Password of the executing user [String]
3. Id of the Vote [int]

result: List of Objects: Options

### vote_option_create:
Creates a new Vote Option > [Only the creator of the Event can execute this]

Args:
1. Name of the executing user[String]
2. Password of the executing user [String]
3. Id of the Event the Vote should be created in
4. Title of the new Option [String]

result: Object: of the newly created Vote Option

### vote_option_update:
Updates the title of a Vote Option > [Only the creator of the Event can execute this]

Args:
1. Name of the executing user[String]
2. Password of the executing user [String]
3. Id of the Vote to Change [int]
4. New title of the Option [String]

result: Bool: true if successful

### vote_option_delete:
Deletes a Vote Option > [Only the creator of the Event can execute this]

Args:
1. Name of the executing user[String]
2. Password of the executing user [String]
3. Id of the Vote to Delete [int]

result: Bool: true if successful

### vote_option_get_count:
Fetches the Amount of Users that voted for an Option

Args:
1. Name of the executing user[String]
2. Password of the executing user [String]
3. Id of the Vote Option [int]

result: Int: Number of Users

### vote_user_add_vote:
Adds to a Vote to a Vote Option as the executing User

Args:
1. Name of the executing user[String]
2. Password of the executing user [String]
3. Id of the Vote Option [int]

result: Bool: true if successful

### vote_user_add_vote:
Removes to a Vote from a Vote Option as the executing User

Args:
1. Name of the executing user[String]
2. Password of the executing user [String]
3. Id of the Vote Option [int]

result: Bool: true if successful