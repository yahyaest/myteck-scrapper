const webDriver = require("selenium-webdriver");
const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");

const url =
  "https://www.mytek.tn/informatique/ordinateur-de-bureau/pc-de-bureau.html?product_list_limit=all";

// Images Table
const pcTable = [];

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
        `https://www.mytek.tn/informatique/ordinateur-de-bureau/pc-de-bureau.html?p=${index}`
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

          // pc Data
          const pcTitle = loadedHtml(".base").text();
          const pcBrand = loadedHtml('td[data-th="Marque"]').text();
          const pcPrice =
            loadedHtml('[itemprop="price"]').attr("content") + ",000 TND";
          //loadedHtml(".price").text().split("DT")[0].trim() + " TND";
          const pcModel = loadedHtml('td[data-th="Modèle PC"]').text();
          const pcType = loadedHtml('td[data-th="Type"]').text();
          const pcOs = loadedHtml(
            'td[data-th="Système d\'exploitation"]'
          ).text();
          const pcCpu = loadedHtml('td[data-th="Processeur"]').text();
          const pcCpuType = loadedHtml('td[data-th="Type Processeur"]').text();
          const pcCpuReference = loadedHtml(
            'td[data-th="Référence Processeur"]'
          ).text();
          const pcCpuFrequency = loadedHtml(
            'td[data-th="Fréquence Processeur"]'
          ).text();
          const pcGraphicChipset = loadedHtml(
            'td[data-th="Chipset Graphique"]'
          ).text();
          const pcCacheMemory = loadedHtml(
            'td[data-th="Mémoire Cache"]'
          ).text();
          const pcGpu = loadedHtml('td[data-th="Carte Graphique"]').text();
          const pcRam = loadedHtml('td[data-th="Mémoire"]').text();
          const pcRamType = loadedHtml('td[data-th="Type Mémoire"]').text();
          const pcDrive = loadedHtml('td[data-th="Disque Dur"]').text();
          const pcDriveType = loadedHtml(
            'td[data-th="Type Disque Dur"]'
          ).text();
          const pcIsScreen = loadedHtml('td[data-th="Ecran"]').text();
          const pcIsTouchScreen = loadedHtml(
            'td[data-th="Ecran Tactile"]'
          ).text();
          const pcScreenSize = loadedHtml(
            'td[data-th="Taille de l\'écran"]'
          ).text();

          const pcConnectors = loadedHtml('td[data-th="Connecteurs"]').text()
            ? loadedHtml('td[data-th="Connecteurs"]').text()
            : "N/A";

          // // get pc images
          // const scriptsList = loadedHtml('script[type="text/x-magento-init"]');
          // const imageScript = scriptsList
          //   .toArray()
          //   .filter(
          //     (script) =>
          //       script.children["0"].data.indexOf("mage/gallery/gallery") !== -1
          //       )[0];

          //       const imagesData = JSON.parse(imageScript.children["0"].data)[
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

          // get pc images and create images object V2
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
          descriptionObject.brand = pcBrand;
          descriptionObject.model = pcModel;
          descriptionObject.type = pcType;
          descriptionObject.os = pcOs;
          descriptionObject.processor = pcCpu;
          descriptionObject.processor_type = pcCpuType;
          descriptionObject.processor_reference = pcCpuReference;
          descriptionObject.processor_frequency = pcCpuFrequency;
          descriptionObject.processor_cache = pcCacheMemory;
          descriptionObject.gpu = pcGpu;
          descriptionObject.gpu_chipset = pcGraphicChipset;
          descriptionObject.memory = pcRam;
          descriptionObject.memory_type = pcRamType;
          descriptionObject.drive = pcDrive;
          descriptionObject.drive_type = pcDriveType;
          descriptionObject.screen = pcIsScreen;
          descriptionObject.touchscreen = pcIsTouchScreen;
          descriptionObject.screen_size = pcScreenSize;
          descriptionObject.connectors = pcConnectors;
          // create pc array
          const pcObject = {};
          pcObject.title = pcTitle;
          pcObject.description = descriptionObject;
          pcObject.price = pcPrice;
          pcObject.inventory = randomNum(0, 50);
          pcObject.slug = pcTitle.toLowerCase().replace(/[^\w-]+/g, "-");
          pcObject.last_update = randomDate(new Date(2012, 0, 1), new Date());
          pcObject.collection_id = 1;
          pcObject.images = imageObject;

          pcTable.push(pcObject);
          console.log(elementIndex, ` - Adding ${pcTitle} ...`);
          elementIndex++;
        } else {
          console.log("error : " + response.status);
        }
      }
    }

    fs.writeFile("./data/pc.json", JSON.stringify(pcTable), (err) => {
      if (err) throw err;
      console.log("Data written to file");
    });
  } finally {
    await driver.quit();
  }
};

componentPageScrapper(url);
