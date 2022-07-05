import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
const router = express.Router();

router.post('/callback', (req, res, next) => {
  console.log(req.headers['twitch-eventsub-message-type'], req.headers['twitch-eventsub-subscription-type']);
});

export default router;