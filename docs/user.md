# USER API SPECIFICATION

## Create New User
- Endpoint : /user/register
- Request Body :
```json
{
    "user_name": "David Revivaldy",
    "user_email": "davidrsitorus04@gmail.com",
    "user_password": "davidrvii"
}
``` 
- Response Success :
```json
{
    "success": true,
    "statusCode": 201,
    "message": "Create New User Success",
    "timestamp": "2025-06-18T14:38:19.989Z",
    "registResult": {
        "user_name": "David Revivaldy",
        "user_email": "davidrsitorus04@gmail.com",
        "user_password": "davidrvii"
    }
}
```