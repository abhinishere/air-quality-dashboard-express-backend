This is the backend part of the fullstack dashboard app I built for a take-home assignment.

It follows repository design pattern and is built with Express, TypeScript, Mongoose, Multer, XLSX, and MongoDB Atlas; dockerized and deployed on Cloud Run.

## Auth API endpoints

### Registering a user

Make a `POST` request to `/api/auth/signup` with a valid name, email and password in the body of the form:

```
{
    "name": "Test Name",
    "email": "testname@example.com",
    "password": "test123"
}
```

### Logging in

Make a `POST` request to `/api/auth/signin` with a valid email and password in the body of the form:

```
{
    "email": "testname@example.com",
    "password": "test123"
}
```

On successful registration (status code 201), a JWT `accessToken` with 15s expiry and a `refreshToken` with 1y expiry are set as HttpOnly cookies and userid is returned.

### Refreshing token

To ensure security, this app sets bearer accessToken and refreshToken as HttpOnly cookie and every request to readings documents in MongoDB involves verification of `accessToken`. To avoid unnecessary relogins, you can generate a new access (and refresh token) by sending a `POST` request to `/api/auth/refreshtoken` with an additional header `userId: <userid value>`

### Log out

`/api/auth/logout` clears all cookies.

## Reading API endpoints

All requests under the route `/api/reading/` are protected and involves verification of accessToken.

The `verifyAccessToken` middleware checks if you have an active bearer accessToken cookie.

Server returning `401` implies that accessToken has expired and to generate and set a new one, send a `POST` request to `/api/auth/refreshtoken` as mentioned above.

Now, you can send a new `GET` request with the newly generated accessToken.

### Pull data for specific devices

Make a `GET` request to `/api/reading/getalldata` with required devices as the values for the query parameter `devices`. For instance:

```
/api/reading/getalldata?devices=DeviceA
/api/reading/getalldata?devices=DeviceA,DeviceB
```

### Pull pm1, pm2.5, and pm10 values separately for all specified device

Make a `GET` request to `/api/reading/getreadings` with required devices as the values for the query parameter `devices` and required particulate matter size as pm value. For instance:

```
/api/reading/getreadings?devices=DeviceA,DeviceB&pm=p1
/api/reading/getreadings?devices=DeviceA,DeviceB,DeviceC&pm=p25
```

### Optional filter based on time range

```
/api/reading/getreadings?devices=DeviceA,DeviceB&pm=p1&starttime=21/03/19,09:01:46&endtime=21/03/20,05:10:40
```

### Upload bulk readings data from an excel file

Add the file as the form-data in the request body and send a `POST` request to `/api/reading/upload`.
