const fs = require("fs");

// 25 + 20 + 15 + 12 + 10 + 7 + 5 + 4 + 2
const getPromotionId = () => {
  const tableIds = [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3,
    3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5,
    5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 8, 8, 8, 8, 9, 9,
  ];
  //   for (let index = 0; index < 15; index++) {
  //     tableIds.push(3);
  //   }

  // console.log(tableIds.length);

  return tableIds[Math.floor(Math.random() * (99 - 0) + 0)];
};

//console.log(getPromotionId());

const getRandomProductId = () => {
  return Math.floor(Math.random() * (1019 - 1) + 1);
};

let id = 1;
let unique_couple = [];
//
let seed =
  "insert into pcstore.store_product_promotions (id, product_id, promotion_id)values ";

for (let index = 1; index < 1823; index++) {
  let prod_id = getRandomProductId();
  let prom_id = getPromotionId();
  while (unique_couple.includes(`${prod_id}-${prom_id}`)) {
    prod_id = getRandomProductId();
    prom_id = getPromotionId();
  }

  unique_couple.push(`${prod_id}-${prom_id}`);
  let col = `(${id}, '${prod_id}', '${prom_id}'),\n`;

  seed = seed + col;

  id++;
}

fs.writeFile("./data/promotions_seed.sql", seed, (err) => {
  if (err) throw err;
  console.log("Data written to file");
});
