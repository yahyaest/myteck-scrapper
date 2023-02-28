const fs = require("fs");

const pcList = require("../data/pc.json");

let id = 1;
//
let seed =
  "insert into pcstore.store_product (id, title,  description, price, inventory, slug, last_update, collection_id, images)values ";

// pc

for (let pc of pcList) {
  seed =
    seed +
    `(${id}, '${pc.title}', '${JSON.stringify(pc.description)}', '${
      pc.price
    }', ${pc.inventory}, '${pc.slug}', '${pc.last_update}', ${
      pc.collection_id
    }, '${JSON.stringify(pc.images)}'),\n`;

  id++;
}



fs.writeFile("./data/pc_seed.sql", seed, (err) => {
  if (err) throw err;
  console.log("Data written to file");
});
