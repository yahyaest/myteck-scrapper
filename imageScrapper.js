const webDriver = require("selenium-webdriver");
const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");

const baseUrl = "https://www.mytek.tn/informatique/";
const componentUrl = [
  "ordinateurs-portables/pc-portable-pro.html",
  "ordinateurs-portables/ultrabook.html",
  "ordinateurs-portables/pc-gamer.html",
  "ordinateurs-portables/mac.html",
  "ordinateur-de-bureau/pc-de-bureau.html",
  "ordinateur-de-bureau/ordinateur-gamer.html",
  "ordinateur-de-bureau/ecran.html",
  "composants/stockage/disque-dur-externe.html",
  "composants/stockage/disque-dur-ssd.html",
  "composants/composants-informatique/barrettes-memoire.html",
  "composants/composants-informatique/carte-graphique.html",
  "composants/composants-informatique/processeur-tunisie.html",
];
const urlQuery = "?product_list_limit=all";

// Images Table
const imagesTable = [];
let imageId = 1;

// Fill url list
const urlList = [];
const getUrlList = () => {
  for (let component of componentUrl) {
    urlList.push(baseUrl + component + urlQuery);
  }
};

getUrlList();

// Scrraping

const componentPageScrapper = async (url) => {
  const By = webDriver.By;
  const driver = await new webDriver.Builder().forBrowser("chrome").build();

  try {
    // get component links
    await driver.get(url);

    const componentsTable = await driver.findElements(
      By.className("item product product-item product-item-info")
    );

    console.log(componentsTable.length);

    for (let component of componentsTable) {
      const componentLink = await component
        .findElement(By.className("product-item-link"))
        .getAttribute("href");

      // get html doc
      const response = await axios.get(componentLink);
      if (response.status === 200) {
        const html = response.data;
        const loadedHtml = await cheerio.load(html);

        // get component images data
        const scriptsList = loadedHtml('script[type="text/x-magento-init"]');
        const imageScript = scriptsList
          .toArray()
          .filter(
            (script) =>
              script.children["0"].data.indexOf("mage/gallery/gallery") !== -1
          )[0];

        const imagesData = JSON.parse(imageScript.children["0"].data)[
          "[data-gallery-role=gallery-placeholder]"
        ]["mage/gallery/gallery"].data;

        // create images array
        const imageObject = {};
        imageObject.id = imageId;
        let imageIndex = 1;
        for (let image of imagesData) {
          imageObject[`image${imageIndex}`] = {};
          imageObject[`image${imageIndex}`].tiny = image.thumb;
          imageObject[`image${imageIndex}`].medium = image.img;
          imageObject[`image${imageIndex}`].large = image.full;
          imageIndex++;
        }
        imagesTable.push(imageObject);
        imageId++;
      } else {
        console.log("error : " + response.status);
      }
    }

    //
  } finally {
    await driver.quit();
  }
};

// write images to json file
const allComponentScrapper = async () => {
    for (let url of urlList) {
     await componentPageScrapper(url);
   }
 // await componentPageScrapper(urlList[1]);

  fs.writeFile("./data/test.json", JSON.stringify(imagesTable), (err) => {
    if (err) throw err;
    console.log("Data written to file");
  });
};

allComponentScrapper();


