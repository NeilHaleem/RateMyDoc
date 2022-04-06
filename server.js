// setup environment variables in .env file to make it easier to go from development to production (using dotenv); environment variables also make things more secure since you are not exposing hard coded login data for example 
require("dotenv").config();

// get access to DB object
const db = require("./db");

const { request, response } = require("express");

// const { application, response } = require("express");
const express = require("express");

const expressApp = express();

const port = process.env.PORT;

// setup Middleware - the POST request includes data in the body and we need a way to retrieve that data in the body so, use the express.json built-in middleware in express to receive the data in the body and automatically attach it to a JS/JSON object (under the 'body' property)
expressApp.use(express.json());

// RUN or restart server: type in console "node server.js"
expressApp.listen(port, () => {
    console.log('server is live and listening on port ${port}');
});


// Setup CRUD operations

// starting path http://localhost:3000
// retrieve all doctors > GET > /api/doctors
// retrieve one doctor  > GET > /api/doctors/:id
// add doctor           > POST > /api/doctors
// update doctor        > PUT > /api/doctors/:id
// delete doctor        > DELETE > /api/doctors/:id

//Query response status description:
//200 - query processed successfully, return requested resource or result
//201 - query processed successfully, new resource created
//204 - query processed successfully, no content returned  


// I. RETRIEVE all doctors
expressApp.get("/api/doctors", async (request, response) => {
    const results = await db.query("SELECT * FROM doctors");

    response.status(200).json({
        status: "success",
        //show number of results
        results: results.rows.length,
        //format data as JSON object 
        data: {
            doctors: results.rows 
        }
    })
})


// II. RETRIEVE one doctor
expressApp.get("/api/doctors/:id", async (request, response) => {
    try {
        //Using parameterized query to avoid security issues with string concatenation: https://node-postgres.com/features/queries)
        const results = await db.query("SELECT * FROM doctors WHERE id = $1", [request.params.id]);

        response.status(200).json({
        status: "success",
        data: {
            doctor: results.rows[0],
        },
    })
    } catch (err) {
        console.log(err);
    }
  
});


// III. ADD a doctor
expressApp.post("/api/doctors", async (request, response) => {
    //Recall: that request.body is going to return a JSON object that was automatically created by our Middleware express.json() above
    const results = await db.query("INSERT INTO doctors (name, city, specialty) VALUES ($1, $2, $3)", [request.body.name, request.body.city, request.body.specialty]);
        
    response.status(201).json({
    status: "success",
    data: {
    //When adding or updating in PostgreSQL, by default the console does not return an object (it just displays the message "insert @ 1....query returned successfully") so the results.row[0] will return that actual array object for us and we can grab which ever element we need in that array, source: https://node-postgres.com/api/result
        doctor: results.rows[0] 
        }
    })
});


// IV. UPDATE a doctor
expressApp.put("/api/doctors/:id", async (request, response) => {
    try {
        const results = await db.query("UPDATE doctors SET name = $1, city = $2, specialty = $3 WHERE id = $4 RETURNING *", [request.body.name, request.body.city, request.body.specialty, request.params.id]);

        response.status(200).json({
        status: "success",
        data: {
            doctor: "Dr. Nancy Bridgens" 
        }
    })
    } catch (err) {
    console.log(err);
}    
});


// V. DELETE a doctor
expressApp.delete("/api/doctors/:id", async (request, response) => {
    try {
        const results = await db.query("DELETE FROM doctors WHERE id = $1", [request.params.id]);  
        
        response.status(204).json({
        status: "success",
        })
    } catch (err) {
    console.log(err);
    }    
})