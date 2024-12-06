import { createClient } from 'redis';
import { promisify } from 'util';

const express = require('express');

const app = express();

const client = createClient();

client.on('connect', () => console.log('Redis client connected to the server'));

client.on('error', (err) => console.log(`Redis client not connected to the server: ${err}`));

const listProducts = [
  {
    itemId: 1, itemName: 'Suitcase 250', price: 50, initialAvailableQuantity: 4,
  },
  {
    itemId: 2, itemName: 'Suitcase 450', price: 100, initialAvailableQuantity: 10,
  },
  {
    itemId: 3, itemName: 'Suitcase 650', price: 350, initialAvailableQuantity: 2,
  },
  {
    itemId: 4, itemName: 'Suitcase 1050', price: 550, initialAvailableQuantity: 5,
  },
];

function getItemById(itemId) {
  return listProducts.filter((item) => item.itemId === itemId)[0];
}

function reserveStockById(itemId, stock) {
  client.set(itemId, stock);
}

reserveStockById(1, 4);
reserveStockById(2, 10);
reserveStockById(3, 2);
reserveStockById(4, 5);

const get = promisify(client.get).bind(client);

async function getCurrentReservedStockById(itemId) {
  const stock = await get(itemId);
  return stock;
}

app.get('/list_products', (req, res) => {
  res.json(listProducts);
});

app.get('/list_products/:itemId', async (req, res) => {
  const { itemId } = req.params;
  const item = getItemById(parseInt(itemId, 10));
  if (!item) {
    res.json({ status: 'Product not found' });
    return;
  }
  const stock = await getCurrentReservedStockById(itemId);
  const foundItem = {
    itemId: item.itemId,
    itemName: item.itemName,
    price: item.price,
    initialAvailableQuantity: item.initialAvailableQuantity,
    currentQuantity: stock !== null ? parseInt(stock, 10) : item.initialAvailableQuantity,
  };
  res.json(foundItem);
});

app.get('/reserve_product/:itemId', async (req, res) => {
  const { itemId } = req.params;
  const item = getItemById(parseInt(itemId, 10));
  if (!item) {
    res.json({ status: 'Product not found' });
    return;
  }
  const currentQuantity = await getCurrentReservedStockById(itemId);
  if (currentQuantity !== null) {
    if (currentQuantity < 1) {
      res.json({ status: 'Not enough stock available', itemId });
    } else {
      reserveStockById(itemId, currentQuantity - 1);
      res.json({ status: 'Reservation confirmed', itemId });
    }
  } else {
    reserveStockById(itemId, item.initialAvailableQuantity - 1);
    res.json({ status: 'Reservation confirmed', itemId });
  }
});

app.listen(1245);
