import dotenv from 'dotenv';
dotenv.config();
import axios from "axios";

const eventSub = axios.create({
  baseURL: 'https://api.twitch.tv/helix/eventsub/subscriptions',
  headers: {
    'Client-id': process.env.TWITCH_CLIENT_ID,
    'Content-Type': 'application/json'
  }
});

const authorize = axios.create({
  baseURL: 'https://id.twitch.tv/oauth2',
  headers: {
    'Content-Type': 'application/json'
  }
});

const giphy = axios.create({
  baseURL: 'https://api.giphy.com/v1/gifs',
  headers: {
    'Content-Type': 'application/json'
  }
});

const twitchApi = {
  eventSub, authorize, giphy
};

export default twitchApi;