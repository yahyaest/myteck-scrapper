const fs = require("fs");

const getRandomTagId = () => {
  return Math.floor(Math.random() * (8 - 1) + 1);
};

const getRandomProductId = () => {
  return Math.floor(Math.random() * (1020 - 1) + 1);
};

let id = 5;
//
let seed =
  "insert into pcstore.store_product_promotions (id, object_id, content_type_id, tag_id)values ";

for (let index = 1; index < 997; index++) {
  seed =
    seed + `(${id}, ${getRandomProductId()}, 7, ${getRandomTagId()}),\n`;

  id++;
}

fs.writeFile("./data/tags_seed.sql", seed, (err) => {
  if (err) throw err;
  console.log("Data written to file");
});
