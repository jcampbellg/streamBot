import dotenv from 'dotenv';
dotenv.config();

export const events = [
  {type: 'channel.subscription.message', condition: {'broadcaster_user_id': process.env.TWITCH_CHANNEL_ID}},
  {type: 'channel.subscribe', condition: {'broadcaster_user_id': process.env.TWITCH_CHANNEL_ID}},
  {type: 'channel.follow', condition: {'broadcaster_user_id': process.env.TWITCH_CHANNEL_ID}},
  {type: 'channel.channel_points_custom_reward_redemption.add', condition: {'broadcaster_user_id': process.env.TWITCH_CHANNEL_ID}},
  {type: 'channel.subscription.gift', condition: {'broadcaster_user_id': process.env.TWITCH_CHANNEL_ID}},
  {type: 'channel.cheer', condition: {'broadcaster_user_id': process.env.TWITCH_CHANNEL_ID}},
  {type: 'channel.raid', condition: {'to_broadcaster_user_id': process.env.TWITCH_CHANNEL_ID}},
  {type: 'channel.poll.begin', condition: {'broadcaster_user_id': process.env.TWITCH_CHANNEL_ID}},
  {type: 'channel.poll.progress', condition: {'broadcaster_user_id': process.env.TWITCH_CHANNEL_ID}},
  {type: 'channel.poll.end', condition: {'broadcaster_user_id': process.env.TWITCH_CHANNEL_ID}},
  {type: 'channel.prediction.begin', condition: {'broadcaster_user_id': process.env.TWITCH_CHANNEL_ID}},
  {type: 'channel.prediction.progress', condition: {'broadcaster_user_id': process.env.TWITCH_CHANNEL_ID}},
  {type: 'channel.prediction.lock', condition: {'broadcaster_user_id': process.env.TWITCH_CHANNEL_ID}},
  {type: 'channel.prediction.end', condition: {'broadcaster_user_id': process.env.TWITCH_CHANNEL_ID}}
];

export const eventsType = {
  subscriptionMessage: 'channel.subscription.message',
  subscribe: 'channel.subscribe',
  follow: 'channel.follow',
  redemption: 'channel.channel_points_custom_reward_redemption.add',
  subscriptionGift: 'channel.subscription.gift',
  cheer: 'channel.cheer',
  raid: 'channel.raid',
  pollBegin: 'channel.poll.begin',
  pollProgress: 'channel.poll.progress',
  pollEnd: 'channel.poll.end',
  predictionBegin: 'channel.prediction.begin',
  predictionProgress: 'channel.prediction.progress',
  predictionLock: 'channel.prediction.lock',
  predictionEnd: 'channel.prediction.end'
};

export const cmdActions = {
  add: ['add', 'sumar', '+', 'a', 'añadir', 'agregar', 'anadir'],
  subtract: ['sub', 'subtract', '-', 's', 'restar', 'quitar', 'remove', 'rm'],
  clear: ['clear', 'limpiar', 'c', 'reset', 'resetear', 'reiniciar'],
};