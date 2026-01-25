import { createServer } from "node:http";
import { Server } from "socket.io";


const server = createServer((req, res) => {
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>SocketIO Chat Server</title>
  <style>
    /* Reset and base */
    body {
      margin: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #121212;
      color: #e0e0e0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100vh;
      text-align: center;
    }

    h1 {
      font-weight: 700;
      font-size: 2.5rem;
      margin-bottom: 1.5rem;
      letter-spacing: 1.2px;
    }

    a.github-link {
      position: relative;
      color: #61dafb;
      font-weight: 600;
      font-size: 1.2rem;
      text-decoration: none;
      cursor: pointer;
      padding-bottom: 4px;
      transition: color 0.3s ease;
    }

    a.github-link::after {
      content: "";
      position: absolute;
      left: 0;
      bottom: 0;
      width: 0%;
      height: 2px;
      background: #61dafb;
      transition: width 0.3s ease;
      border-radius: 2px;
    }

    a.github-link:hover {
      color: #21a1f1;
    }

    a.github-link:hover::after {
      width: 100%;
    }
  </style>
</head>
<body>
  <h1>SocketIO Chat Server by M-Arham07</h1>
  <a
    href="https://github.com/M-Arham07/"
    target="_blank"
    rel="noopener noreferrer"
    class="github-link"
    >Visit my GitHub</a
  >
</body>
</html>
`);
});



const io = new Server(server, {
    cors: {
        origin: "*", // tighten in production
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log("connected:", socket.id);

    socket.on("message", (msg) => {
        console.log("message:", msg);
        io.emit("message", msg); // broadcast to everyone
    });

    socket.on("disconnect", () => {
        console.log("disconnected:", socket.id);
    });
});



server.listen(8080, () => {
    console.log("[WS] Started")
});
