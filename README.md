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

result: Object with Username and UserID

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

result: Object of the newly created User Account

### user_change_password:
Changes the password of a user

Args:
1. Name of the User [String]
2. Old Password of the User [String]
3. New Password of the User

result: Bool: true if successful, else false

### __user_change_password:
Deletes the account of a User 

Args:
1. Name of the User [String]
2. Password of the User [String]

result: Bool: true if successful, else false
