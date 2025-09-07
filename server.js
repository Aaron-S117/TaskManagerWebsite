import http, { ServerResponse } from "http";
import Database from "better-sqlite3";

const db = new Database('Database.db');
import dotenv from 'dotenv';
dotenv.config();
const baseURL = process.env.baseURL;
const backendPort = process.env.backendPort;

// Example: ensure a table exists
db.prepare(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    completed INTEGER DEFAULT 0
  )
`).run();

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");

  const {method, url} = req;

  const segmentURL = new URL(req.url, `http://${req.headers.host}`);
  // Split the path to extract segments
  const pathSegments = segmentURL.pathname.split('/').filter(segment => segment.length > 0);
  // res.end("Hello World\n");

  // restful APIs have a method (i.e. GET, POST, etc.) and a URL
  if (url === "/tasks" && method === 'GET') {

    // Read all tasks
    const rows = db.prepare("SELECT * FROM tasks").all();
    res.end(JSON.stringify(rows));

  } 
  else if (url === "/add" && method === 'POST') {
    // Add a sample task
    // const stmt = db.prepare("INSERT INTO tasks (TASKS) VALUES (?)");
    // const info = stmt.run("Sample task");

    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString(); // convert buffer to string
    });

    req.on('end', () => {
      try {
        const {task, status, done } = JSON.parse(body);
      
        if(!task || !status) {
          res.statusCode = 400;
          res.end(JSON.stringify({error: "Missing required fields: task and status"}));
          return;
        }
        const stmt = db.prepare("INSERT INTO tasks (TASKS, STATUS, DONE) VALUES (?,?,?)");
        const info = stmt.run(task, status, done ? 1: 0);

        res.statusCode = 201;
        res.end(JSON.stringify({ id: info.lastInsertRowid, message: "Task added successfully" }));
      } catch(error){
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Invalid JSON or bad request", info: error.all}));
      }
    });
  } 
  else if (url === '/removeTasks' && method === 'DELETE'){
    try {
      const stmt = db.prepare("DELETE FROM tasks");
      stmt.run();

      res.end(JSON.stringify("All Data removed from tasks table"));
      res.statusCode = 201;
    }catch(error){
      res.statusCode = 400;
      res.end(JSON.stringify({ error: "Invalid JSON or bad request", info: error.all}));
    }
  } 
  else if (pathSegments[0] === 'removeSingleTask' && pathSegments.length === 2 && method === 'DELETE') {
    
    const IDNumber = pathSegments[1];
    if (!IDNumber) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Task ID not provided.' }));
      return; // End execution
    }

    try {
      const stmt = db.prepare("DELETE FROM tasks WHERE ID = ?");
      const info = stmt.run(IDNumber);

      res.end(JSON.stringify(IDNumber + ": Record removed from tasks table"));
      res.statusCode = 201;
      
    }catch(error){
      res.statusCode = 401;
      res.end(JSON.stringify({ error: "Invalid JSON or bad request", info: error.all}));
    }
  }
  else if (url ==='/change' && method === "PUT"){
  
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString(); // convert buffer to string
    });

    req.on('end', () =>{
      try {
        const {field, value, ID} = JSON.parse(body);
      
        if(!field || !value || !ID) {
          res.statusCode = 400;
          res.end(JSON.stringify({error: "Missing required fields: task and status"}));
          return;
        }

        //console.log(`UPDATE tasks SET ${field} = '${value}' WHERE ID = ${ID}`);
        const stmt = db.prepare(`UPDATE tasks SET ${field} = '${value}' WHERE ID = ${ID}`);
        const info = stmt.run();

        res.statusCode = 201;
        res.end(JSON.stringify({ id: info.lastInsertRowid, message: "Task updated successfully" }));
      } catch(error){
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Invalid JSON or bad request", info: error.all}));
      }
    });
  }
  else {

    res.end(JSON.stringify({ message: "Hello World" }));

  }
});

const PORT = backendPort;
server.listen(PORT, () => {
  console.log(`Server running at ${baseURL}:${PORT}`);
});