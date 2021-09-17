require('dotenv').config();

const {Client, Intents} = require('discord.js');
const moment = require('moment');
const axios = require('axios');

const DiscordClient = new Client({intents: [Intents.FLAGS.GUILDS]});

const roundToTwo = num => {
  return +(Math.round(num + 'e+2') + 'e-2');
};

const getUsdPrice = async () => {
  const {data: usdCoin} = await axios.get(
    `https://api.coingecko.com/api/v3/coins/${process.env.USD_COIN_ID}`,
  );

  if (!usdCoin) throw new Error('USD coin not found...');

  const currentPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(usdCoin.market_data.current_price.brl);

  const priceChangePercentage =
    usdCoin.market_data.price_change_percentage_24h_in_currency.brl;

  const symbol =
    priceChangePercentage === 0 ? '-' : priceChangePercentage > 0 ? '⬈' : '⬊';

  const percentageRounded = roundToTwo(priceChangePercentage).toFixed(2);

  return `${currentPrice} ${symbol} ${percentageRounded}%`;
};

const updateUserActivity = () =>
  getUsdPrice()
    .then(price => {
      console.log(`[${moment().format('DD/MM/YYYY HH:mm:ss')}]: ${price}`);
      DiscordClient.user.setActivity(price);
    })
    .catch(console.log);

DiscordClient.on('ready', async client => {
  updateUserActivity().then();
  setInterval(() => {
    updateUserActivity().then();
  }, 10000);
});

DiscordClient.login(process.env.BOT_TOKEN);
