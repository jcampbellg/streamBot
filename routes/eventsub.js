import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
const router = express.Router();

router.post('/callback', (req, res, next) => {
  console.log({
    headers: req.headers,
    body: req.body
  });
});

export default router;