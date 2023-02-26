const fs = require("fs");

const pcList = require("../data/pc.json");
const pcGamerList = require("../data/pcGamer.json");
const laptopList = require("../data/laptop.json");
const monitorList = require("../data/monitor.json");
const cpuList = require("../data/cpu.json");
const gpuList = require("../data/gpu.json");
const ramList = require("../data/ram.json");
const hddList = require("../data/hdd.json");
const ssdList = require("../data/ssd.json");

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

// pcGamer

for (let pcGamer of pcGamerList) {
  seed =
    seed +
    `(${id}, '${pcGamer.title}', '${JSON.stringify(pcGamer.description)}', '${
      pcGamer.price
    }', ${pcGamer.inventory}, '${pcGamer.slug}', '${pcGamer.last_update}', ${
      pcGamer.collection_id
    }, '${JSON.stringify(pcGamer.images)}'),\n`;

  id++;
}

// laptop

for (let laptop of laptopList) {
  seed =
    seed +
    `(${id}, '${laptop.title}', '${JSON.stringify(laptop.description)}', '${
      laptop.price
    }', ${laptop.inventory}, '${laptop.slug}', '${laptop.last_update}', ${
      laptop.collection_id
    }, '${JSON.stringify(laptop.images)}'),\n`;

  id++;
}

// monitor

for (let monitor of monitorList) {
  seed =
    seed +
    `(${id}, '${monitor.title}', '${JSON.stringify(monitor.description)}', '${
      monitor.price
    }', ${monitor.inventory}, '${monitor.slug}', '${monitor.last_update}', ${
      monitor.collection_id
    }, '${JSON.stringify(monitor.images)}'),\n`;

  id++;
}

//cpu
for (let cpu of cpuList) {
  seed =
    seed +
    `(${id}, '${cpu.title}', '${JSON.stringify(cpu.description)}', '${
      cpu.price
    }', ${cpu.inventory}, '${cpu.slug}', '${cpu.last_update}', ${
      cpu.collection_id
    }, '${JSON.stringify(cpu.images)}'),\n`;

  id++;
}

// gpu

for (let gpu of gpuList) {
  seed =
    seed +
    `(${id}, '${gpu.title}', '${JSON.stringify(gpu.description)}', '${
      gpu.price
    }', ${gpu.inventory}, '${gpu.slug}', '${gpu.last_update}', ${
      gpu.collection_id
    }, '${JSON.stringify(gpu.images)}'),\n`;

  id++;
}

// ram

for (let ram of ramList) {
  seed =
    seed +
    `(${id}, '${ram.title}', '${JSON.stringify(ram.description)}', '${
      ram.price
    }', ${ram.inventory}, '${ram.slug}', '${ram.last_update}', ${
      ram.collection_id
    }, '${JSON.stringify(ram.images)}'),\n`;

  id++;
}

// hdd

for (let hdd of hddList) {
  seed =
    seed +
    `(${id}, '${hdd.title}', '${JSON.stringify(hdd.description)}', '${
      hdd.price
    }', ${hdd.inventory}, '${hdd.slug}', '${hdd.last_update}', ${
      hdd.collection_id
    }, '${JSON.stringify(hdd.images)}'),\n`;

  id++;
}

// ssd

for (let ssd of ssdList) {
  seed =
    seed +
    `(${id}, '${ssd.title}', '${JSON.stringify(ssd.description)}', '${
      ssd.price
    }', ${ssd.inventory}, '${ssd.slug}', '${ssd.last_update}', ${
      ssd.collection_id
    }, '${JSON.stringify(ssd.images)}'),\n`;

  id++;
}

fs.writeFile("./data/seed.sql", seed, (err) => {
  if (err) throw err;
  console.log("Data written to file");
});
