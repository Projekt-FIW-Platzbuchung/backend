# Pre-requisites
- Install [Node.js](https://nodejs.org/en/) at least version 20.12.1
- You can check your version with
```
node -v
```
# Getting started
- Clone the repository
```
git clone https://github.com/Projekt-FIW-Platzbuchung/backend.git
```
- Install dependencies
```
cd path to the <project_name>
npm install
npm install moment
npm install --save-dev jest
npm install --save-dev supertest
npm install node-cron
npm install --save swagger-jsdoc swagger-ui-express
npm install --save jsonwebtoken
```
- Build and run the project
```
npm start
```
  Navigate to `http://localhost:4000`

# Test
- run the Test environment 
```
npm run test -- --silent 
```
# Swagger API Documentation
- start the backend with 
```
npm run start
```
Navigate to `http://localhost:4000/api-docs`

- Click on Authorize 

- In VSC put in your .env file 
```
SECRET_KEY=coolesTeamPasswort

```
- Go to Postman and Send following Request:
```
GET localhost:4000/generate-token
```
- Copy the Token and paste it into the SWAGGER UI Authorize Field and click close afterwards
- Now you can Try out the Endpoints

# View JsDoc Documentation
- in VSC open the doku folder 
- In there you see a file named index.html
- Right click on it and choose "open with LiveServer" (You might need to install the LiveServer Extension)
- You can also open the index.html via the following terminal command on MacOS

```
open doku/index.html

```



