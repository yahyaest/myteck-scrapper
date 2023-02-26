const webDriver = require("selenium-webdriver");
const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");

const url =
  "https://www.mytek.tn/informatique/ordinateurs-portables/pc-portable.html?product_list_limit=all";

// Laptop Table
const laptopTable = [];

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
    await driver.get(url);
    // get component url pages

    let pageNumber = await driver
      .findElement(By.className("page last"))
      .findElements(By.css("span"));
    pageNumber = await pageNumber[pageNumber.length - 1].getAttribute(
      "innerText"
    );

    console.log(`There is ${pageNumber} pages to scrapp!`);

    let pagesUrl = [];
    for (let index = 1; index <= pageNumber; index++) {
      pagesUrl.push(
        `https://www.mytek.tn/informatique/ordinateurs-portables/pc-portable.html?p=${index}`
      );
    }

    let elementIndex = 1;
    for (let pageUrl of pagesUrl) {
      console.log("scrapping : ", pageUrl);
      await driver.navigate().to(pageUrl);

      const componentsTable = await driver.findElements(
        By.className("item product product-item")
      );

      // get component links
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

          // laptop Data
          const laptopTitle = loadedHtml(".base").text();
          const laptopBrand = loadedHtml('td[data-th="Marque"]').text();
          const laptopPrice =
            loadedHtml('[itemprop="price"]').attr("content") + ",000 TND";
          //loadedHtml(".price").text().split("DT")[0].trim() + " TND";
          const laptopModel = loadedHtml('td[data-th="Modèle PC"]').text();
          const laptopIsGamer = loadedHtml('td[data-th="Gamer"]').text();
          const laptopOs = loadedHtml(
            'td[data-th="Système d\'exploitation"]'
          ).text();
          const laptopCpu = loadedHtml('td[data-th="Processeur"]').text();
          const laptopCpuType = loadedHtml(
            'td[data-th="Type Processeur"]'
          ).text();
          const laptopCpuReference = loadedHtml(
            'td[data-th="Référence Processeur"]'
          ).text();
          const laptopCpuFrequency = loadedHtml(
            'td[data-th="Fréquence Processeur"]'
          ).text();
          const laptopGraphicChipset = loadedHtml(
            'td[data-th="Chipset Graphique"]'
          ).text();
          const laptopCacheMemory = loadedHtml(
            'td[data-th="Mémoire Cache"]'
          ).text();
          const laptopGpu = loadedHtml('td[data-th="Carte Graphique"]').text();
          const laptopRam = loadedHtml('td[data-th="Mémoire"]').text();
          const laptopDrive = loadedHtml('td[data-th="Disque Dur"]').text();
          const laptopDriveType = loadedHtml(
            'td[data-th="Type Disque Dur"]'
          ).text();
          const laptopScreen = loadedHtml('td[data-th="Ecran"]').text();
          const laptopIsTouchScreen = loadedHtml(
            'td[data-th="Ecran Tactile"]'
          ).text();
          const laptopScreenSize = loadedHtml(
            'td[data-th="Taille de l\'écran"]'
          ).text();
          const laptopScreenResolution = loadedHtml(
            'td[data-th="Résolution Ecran"]'
          ).text();

          const laptopConnectors = loadedHtml(
            'td[data-th="Connecteurs"]'
          ).text()
            ? loadedHtml('td[data-th="Connecteurs"]').text()
            : "N/A";
          // // get laptop images
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

          // get cpu images and create images object V2
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
          descriptionObject.brand = laptopBrand;
          descriptionObject.model = laptopModel;
          descriptionObject.gamer = laptopIsGamer;
          descriptionObject.os = laptopOs;
          descriptionObject.processor = laptopCpu;
          descriptionObject.processor_type = laptopCpuType;
          descriptionObject.processor_reference = laptopCpuReference;
          descriptionObject.processor_frequency = laptopCpuFrequency;
          descriptionObject.processor_cache = laptopCacheMemory;
          descriptionObject.gpu = laptopGpu;
          descriptionObject.gpu_chipset = laptopGraphicChipset;
          descriptionObject.memory = laptopRam;
          descriptionObject.drive = laptopDrive;
          descriptionObject.drive_type = laptopDriveType;
          descriptionObject.screen = laptopScreen;
          descriptionObject.touchscreen = laptopIsTouchScreen;
          descriptionObject.screen_size = laptopScreenSize;
          descriptionObject.screen_resolution = laptopScreenResolution;
          descriptionObject.connectors = laptopConnectors;
          // create laptop array
          const laptopObject = {};
          laptopObject.title = laptopTitle;
          laptopObject.description = descriptionObject;
          laptopObject.price = laptopPrice;
          laptopObject.inventory = randomNum(0, 30);
          laptopObject.slug = laptopTitle
            .toLowerCase()
            .replace(/[^\w-]+/g, "-");
          laptopObject.last_update = randomDate(
            new Date(2012, 0, 1),
            new Date()
          );
          laptopObject.collection_id = 3;
          laptopObject.images = imageObject;

          laptopTable.push(laptopObject);
          console.log(elementIndex, ` - Adding ${laptopTitle} ...`);
          elementIndex++;
        } else {
          console.log("error : " + response.status);
        }
      }
    }

    fs.writeFile("./data/laptop.json", JSON.stringify(laptopTable), (err) => {
      if (err) throw err;
      console.log("Data written to file");
    });
  } finally {
    await driver.quit();
  }
};

componentPageScrapper(url);
