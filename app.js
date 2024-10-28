import 'dotenv/config';
import express from 'express';
import './config/db/db.js';
import { createServer } from 'http';
// import { Server } from 'socket.io';

import router from './routes/index.routes.js';
import { socketIO } from './helpers/socket/socket.helpers.js';

const app = express();
const server = createServer(app);
// const io = new Server(server);
const port = process.env.PORT || 3000;
app.use(express.json());
socketIO(server);
app.use('/api', router);
server.listen(port, () => {
  console.log(`Server started at ${port}`);
});
