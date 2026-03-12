# APIS

## authRouter

- POST /signup
- POST /login
- POST /logout

## profileRouter

- GET /profile/view
- PATCH /profile/edit
- PATCH /profile/update-password

## connectionRequestRouter

- POST /request/send/:status/:toUserId ---> (status: ignored/interested)
- POST /request/review/:status/:requestId ---> (status: accepted/rejected)

## userRouter

- GET /user/request/received
- GET /user/connections
- GET /user/feed - get you the profiles of other users on platform
