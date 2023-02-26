const webDriver = require("selenium-webdriver");
const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");

const url =
  "https://www.mytek.tn/informatique/ordinateur-de-bureau/ordinateur-gamer.html?product_list_limit=all";

// Images Table
const pcGamerTable = [];

//
const isStringEqualTo = (string1, string2) => {
  const stringArray = [
    string2,
    string2.toUpperCase(),
    string2.charAt(0).toUpperCase() + string2.slice(1),
  ];
  if (stringArray.includes(string1)) return true;
  return false;
};

const randomNum = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

const randomDate = (start, end) => {
  const date = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
  return date.toISOString().split("Z")[0].replace("T", " ").split(".")[0];
};

// Scrraping

const componentPageScrapper = async (url) => {
  const By = webDriver.By;
  const driver = await new webDriver.Builder().forBrowser("chrome").build();

  try {
    // get component links
    await driver.get(url);

    // get component url pages
    let pageNumber = 1;
    try {
      pageNumber = await driver
        .findElement(By.className("page last"))
        .findElements(By.css("span"));
      pageNumber = await pageNumber[pageNumber.length - 1].getAttribute(
        "innerText"
      );
    } catch (error) {
      try {
        pageNumber = await driver.findElements(By.className("page"));
        pageNumber = await pageNumber[pageNumber.length - 1].findElements(
          By.css("span")
        );
        pageNumber = await pageNumber[pageNumber.length - 1].getAttribute(
          "innerText"
        );
      } catch (error) {
        pageNumber = 1;
      }
    }

    console.log(`There is ${pageNumber} pages to scrapp!`);

    let pagesUrl = [];
    for (let index = 1; index <= pageNumber; index++) {
      pagesUrl.push(
        `https://www.mytek.tn/informatique/ordinateur-de-bureau/ordinateur-gamer.html?p=${index}`
      );
    }

    let elementIndex = 1;
    for (let pageUrl of pagesUrl) {
      console.log("scrapping : ", pageUrl);
      await driver.navigate().to(pageUrl);

      const componentsTable = await driver.findElements(
        By.className("item product product-item ")
      );

      console.log(
        "Scrapping ",
        componentsTable.length,
        " elements for page ",
        pageUrl.split("?p=")[1]
      );

      for (let component of componentsTable) {
        const componentLink = await component
          .findElement(By.className("product-item-link"))
          .getAttribute("href");

        // get html doc
        const response = await axios.get(componentLink);
        if (response.status === 200) {
          const html = response.data;
          const loadedHtml = await cheerio.load(html);

          // PcGamer Data
          const pcGamerTitle = loadedHtml(".base").text();
          const pcGamerBrand = loadedHtml('td[data-th="Marque"]').text();
          // const pcGamerPrice =
          //   loadedHtml(".price").text().split("DT")[0].trim() + " TND";
          const pcGamerPrice =
            loadedHtml('[itemprop="price"]').attr("content") + ",000 TND";
          const pcGamerModel = loadedHtml('td[data-th="Modèle PC"]').text();
          const pcGamerType = loadedHtml('td[data-th="Type"]').text();
          const pcGamerOs = loadedHtml(
            'td[data-th="Système d\'exploitation"]'
          ).text();
          const pcGamerCpu = loadedHtml('td[data-th="Processeur"]').text();
          const pcGamerCpuType = loadedHtml(
            'td[data-th="Type Processeur"]'
          ).text();
          const pcGamerCpuReference = loadedHtml(
            'td[data-th="Référence Processeur"]'
          ).text();
          const pcGamerCpuFrequency = loadedHtml(
            'td[data-th="Fréquence Processeur"]'
          ).text();
          const pcGamerGraphicChipset = loadedHtml(
            'td[data-th="Chipset Graphique"]'
          ).text();
          const pcGamerCacheMemory = loadedHtml(
            'td[data-th="Mémoire Cache"]'
          ).text();
          const pcGamerGpu = loadedHtml('td[data-th="Carte Graphique"]').text();
          const pcGamerRam = loadedHtml('td[data-th="Mémoire"]').text();
          const pcGamerRamType = loadedHtml(
            'td[data-th="Type Mémoire"]'
          ).text();
          const pcGamerDrive = loadedHtml('td[data-th="Disque Dur"]').text();
          const pcGamerDriveType = loadedHtml(
            'td[data-th="Type Disque Dur"]'
          ).text();
          const pcGamerIsScreen = loadedHtml('td[data-th="Ecran"]').text();
          const pcGamerIsTouchScreen = loadedHtml(
            'td[data-th="Ecran Tactile"]'
          ).text();
          const pcGamerScreenSize = loadedHtml(
            'td[data-th="Taille de l\'écran"]'
          ).text();

          const pcGamerConnectors = loadedHtml(
            'td[data-th="Connecteurs"]'
          ).text()
            ? loadedHtml('td[data-th="Connecteurs"]').text()
            : "N/A";

          // // get pcGamer images
          // const scriptsList = loadedHtml('script[type="text/x-magento-init"]');
          // const imageScript = scriptsList
          //   .toArray()
          //   .filter(
          //     (script) =>
          //       script.children["0"].data.indexOf("mage/gallery/gallery") !== -1
          //   )[0];

          // const imagesData = JSON.parse(imageScript.children["0"].data)[
          //   "[data-gallery-role=gallery-placeholder]"
          // ]["mage/gallery/gallery"].data;

          // // create images object
          // const imageObject = {};
          // let imageIndex = 1;
          // for (let image of imagesData) {
          //   imageObject[`image${imageIndex}`] = {};
          //   imageObject[`image${imageIndex}`].tiny = image.thumb;
          //   imageObject[`image${imageIndex}`].medium = image.img;
          //   imageObject[`image${imageIndex}`].large = image.full;
          //   imageIndex++;
          // }

          // get pc gamer images and create images object V2
          const scriptsList = loadedHtml(`img[itemprop="image"]`);
          const imagesScript = scriptsList.toArray();
          const imageObject = {};
          let imageIndex = 1;
          for (let imageScript of imagesScript) {
            if (imageScript.attribs.title) {
              imageObject[`image${imageIndex}`] = {};
              imageObject[`image${imageIndex}`].title =
                imageScript.attribs.title;
              imageObject[`image${imageIndex}`].src = imageScript.attribs.src;
              imageIndex++;
            }
          }

          // create description object
          const descriptionObject = {};
          descriptionObject.brand = pcGamerBrand;
          descriptionObject.model = pcGamerModel;
          descriptionObject.type = pcGamerType;
          descriptionObject.os = pcGamerOs;
          descriptionObject.processor = pcGamerCpu;
          descriptionObject.processor_type = pcGamerCpuType;
          descriptionObject.processor_reference = pcGamerCpuReference;
          descriptionObject.processor_frequency = pcGamerCpuFrequency;
          descriptionObject.processor_cache = pcGamerCacheMemory;
          descriptionObject.gpu = pcGamerGpu;
          descriptionObject.gpu_chipset = pcGamerGraphicChipset;
          descriptionObject.memory = pcGamerRam;
          descriptionObject.memory_type = pcGamerRamType;
          descriptionObject.drive = pcGamerDrive;
          descriptionObject.drive_type = pcGamerDriveType;
          descriptionObject.screen = pcGamerIsScreen;
          descriptionObject.touchscreen = pcGamerIsTouchScreen;
          descriptionObject.screen_size = pcGamerScreenSize;
          descriptionObject.connectors = pcGamerConnectors;
          // create pcGamer array
          const pcGamerObject = {};
          pcGamerObject.title = pcGamerTitle;
          pcGamerObject.description = descriptionObject;
          pcGamerObject.price = pcGamerPrice;
          pcGamerObject.inventory = randomNum(0, 25);
          pcGamerObject.slug = pcGamerTitle
            .toLowerCase()
            .replace(/[^\w-]+/g, "-");
          pcGamerObject.last_update = randomDate(
            new Date(2012, 0, 1),
            new Date()
          );
          pcGamerObject.collection_id = 2;
          pcGamerObject.images = imageObject;

          pcGamerTable.push(pcGamerObject);
          console.log(elementIndex, ` - Adding ${pcGamerTitle} ...`);
          elementIndex++;
        } else {
          console.log("error : " + response.status);
        }
      }
    }

    fs.writeFile("./data/pcGamer.json", JSON.stringify(pcGamerTable), (err) => {
      if (err) throw err;
      console.log("Data written to file");
    });
  } finally {
    await driver.quit();
  }
};

componentPageScrapper(url);
