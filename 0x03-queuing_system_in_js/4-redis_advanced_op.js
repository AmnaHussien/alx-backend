import { createClient, print } from 'redis';

const client = createClient();

client.on('connect', () => console.log('Redis client connected to the server'));

client.on('error', (err) => console.log(`Redis client not connected to the server: ${err}`));

const cities = {
  Portland: 50,
  Seattle: 80,
  'New York': 20,
  Bogota: 20,
  Cali: 40,
  paris: 2,
};

for (const city in cities) {
  client.hset('HolbertonSchools', city, cities[city], print);
}

client.hgetall('HolbertonSchools', (error, result) => {
  if (error) {
    console.log(error);
    throw error;
  }
  console.log(result);
});
