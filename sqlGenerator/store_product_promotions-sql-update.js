const fs = require('fs')

const getRandomProductId = () => {
  return Math.floor(Math.random() * (1019 - 1) + 1);
};

//console.log(getRandomProductId());

id = 2;
let seed = "";

for (let index = 0; index < 1000; index++) {
  let row = `UPDATE pcstore.store_product_promotions SET product_id = ${getRandomProductId()} WHERE id=${id};\n`;
  seed = seed + row;
  id++;
}


fs.writeFile("./data/promotions_seed_update.sql", seed, (err) => {
  if (err) throw err;
  console.log("Data written to file");
});

