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

## Login User
- Endpoint : /user/login
- Request Body :
```json
{
    "user_email": "davidrsitorus04@gmail.com",
    "user_password": "davidrvii"
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
        "user_email": "davidrsitorus04@gmail.com",
        "user_password": "davidrvii",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo1LCJ1c2VyX2VtYWlsIjoiZGF2aWRyc2l0b3J1czA0QGdtYWlsLmNvbSIsImlhdCI6MTc1MDI1ODc4M30.R-IdGxWrHdcxtokgfPMdICehE_T-UaxEGitZuCRD2SY"
    }
}
```