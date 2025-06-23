# USER API SPECIFICATION

## Create New User
- Endpoint : /user/register
- Request Body : Method POST
```json
{
    "user_name": "David Revivaldy",
    "user_email": "davxxxxxxxxxxxxxil.com",
    "user_password": "daxxxxxxi"
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
        "user_email": "davxxxxxxxxxxxxxil.com",
        "user_password": "daxxxxxxi"
    }
}
```

## Login User
- Endpoint : /user/login
- Request Body : Method POST
```json
{
    "user_email": "davxxxxxxxxxxxxxil.com",
    "user_password": "daxxxxxxi"
}
``` 
- Response Success :
```json
{
    "success": true,
    "statusCode": 200,
    "message": "User Login Success",
    "timestamp": "2025-06-18T14:59:43.450Z",
    "loginResult": {
        "user_id" : 1
        "user_email": "davxxxxxxxxxxxxxil.com",
        "user_password": "daxxxxxxi",
        "token": "eyJhbGciOixxxxxxxxxxxxxxxxxxxD2SY"
    }
}
```

## Get All User (Admin)
- Endpoint : /user/admin
- Request Body : Method GET
- Response Success :
```json
{
    "success": true,
    "statusCode": 200,
    "message": "Get All User Success",
    "timestamp": "2025-06-18T15:04:58.810Z",
    "users": [
        {
            "user_id": 5,
            "user_name": "David Revivaldy",
            "user_email": "davxxxxxxxxxxxxxil.com",
            "user_password": "$2b$xxxxxxxxxxxxxxxsNMwO2u/G",
            "user_image": null,
            "is_on_project": 0,
            "talent_access": 0,
            "created_at": "2025-06-18T14:57:38.000Z",
            "updated_at": "2025-06-18T14:57:38.000Z",
            "linkedin": null,
            "github": null,
            "fcm_token": null
        }
    ]
}
```

## Get User Basic
- Endpoint : /user/basic/:id
- Request Body : Method GET
- Response Success :
```json
{
    "success": true,
    "statusCode": 200,
    "message": "Get User Basic Success",
    "timestamp": "2025-06-18T15:24:11.682Z",
    "usersBasic": [
        {
            "user_name": "David Revivaldy",
            "user_image": null
        }
    ]
}
```

## Get User Detail
- Endpoint : /user/detail/:id
- Request Body : Method GET
- Response Success :
```json
{
    "success": true,
    "statusCode": 200,
    "message": "Get User Detail Success",
    "timestamp": "2025-06-18T15:28:22.481Z",
    "userDetail": [
        {
            "user_id": 5,
            "user_name": "David Revivaldy",
            "user_email": "davxxxxxxxxxxxxxil.com",
            "user_password": "$2b$10xxxxxxxxxxxxMwO2u/G",
            "user_image": null,
            "is_on_project": 0,
            "talent_access": 0,
            "created_at": "2025-06-18T14:57:38.000Z",
            "updated_at": "2025-06-18T14:57:38.000Z",
            "linkedin": null,
            "github": null,
            "fcm_token": null
        }
    ]
}
```

## Get Update User
- Endpoint : /user/update/:id
- Request Body : Method PATCH
```json
{
    "user_name": "David Revivaldy Sitorus"
}
```
- Response Success :
```json
{
    "success": true,
    "statusCode": 200,
    "message": "Update User Success",
    "timestamp": "2025-06-18T15:32:08.313Z",
    "updatedUser": {
        "user_name": "David Revivaldy Sitorus"
    }
}
```

## Get Delete User
- Endpoint : /user/delete/:id
- Request Body : Method DELETE
- Response Success :
```json
{
    "success": true,
    "statusCode": 200,
    "message": "Delete User Success",
    "timestamp": "2025-06-18T15:33:27.225Z",
    "deletedUserId": "5"
}
```