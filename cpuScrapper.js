const webDriver = require("selenium-webdriver");
const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");

// const url =
//   "https://www.mytek.tn/informatique/composants/composants-informatique/processeur-tunisie.html?product_list_limit=all";

const url =
  "https://www.mytek.tn/informatique/composants-informatique/processeur.html?product_list_limit=all";
// Images Table
const cpuTable = [];

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
        `https://www.mytek.tn/informatique/composants-informatique/processeur.html?p=${index}`
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

          // CPU Data
          const cpuTitle = loadedHtml(".base").text();
          const cpuBrand = loadedHtml('td[data-th="Marque"]').text();
          const cpuName = !isStringEqualTo(
            loadedHtml('td[data-th="Processeur"]').text(),
            "autre"
          )
            ? loadedHtml('td[data-th="Processeur"]').text()
            : cpuTitle;
          const cpuPrice =
            loadedHtml('[itemprop="price"]').attr("content") + ",000 TND";
          //loadedHtml(".price").text().split("DT")[0].trim() + " TND";
          const cpuReference = loadedHtml(
            'td[data-th="Référence Processeur"]'
          ).text();
          const cpuFrequency = loadedHtml(
            'td[data-th="Fréquence Processeur"]'
          ).text();
          const cpuMemorySpeed = !isStringEqualTo(
            loadedHtml('td[data-th="Vitesse Memoire"]').text(),
            "autre"
          )
            ? loadedHtml('td[data-th="Vitesse Memoire"]').text()
            : "N/A";
          const cpuCacheMemory = !isStringEqualTo(
            loadedHtml('td[data-th="Mémoire Cache"]').text(),
            "autre"
          )
            ? loadedHtml('td[data-th="Mémoire Cache"]').text()
            : "N/A";
          const cpuMemoryType = !isStringEqualTo(
            loadedHtml('td[data-th="Type Mémoire"]').text(),
            "autre"
          )
            ? loadedHtml('td[data-th="Type Mémoire"]').text()
            : "N/A";
          const cpuCoresNumber = !isStringEqualTo(
            loadedHtml('td[data-th="Nombre de Coeurs"]').text(),
            "autre"
          )
            ? loadedHtml('td[data-th="Nombre de Coeurs"]').text()
            : "N/A";

          // // get cpu images
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

          // create images object
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
          descriptionObject.name = cpuName;
          descriptionObject.brand = cpuBrand;
          descriptionObject.reference = cpuReference;
          descriptionObject.frequency = cpuFrequency;
          descriptionObject.speed = cpuMemorySpeed;
          descriptionObject.memory = cpuCacheMemory;
          descriptionObject.type = cpuMemoryType;
          descriptionObject.cores = cpuCoresNumber;
          // create cpu array
          const cpuObject = {};
          cpuObject.title = cpuTitle;
          cpuObject.description = descriptionObject;
          cpuObject.price = cpuPrice;
          cpuObject.inventory = randomNum(0, 100);
          cpuObject.slug = cpuTitle.toLowerCase().replace(/[^\w-]+/g, "-");
          cpuObject.last_update = randomDate(new Date(2012, 0, 1), new Date());
          cpuObject.collection_id = 5;
          cpuObject.images = imageObject;

          cpuTable.push(cpuObject);
          console.log(elementIndex, ` - Adding ${cpuTitle} ...`);
          elementIndex++;
        } else {
          console.log("error : " + response.status);
        }
      }
    }

    fs.writeFile("./data/cpu.json", JSON.stringify(cpuTable), (err) => {
      if (err) throw err;
      console.log("Data written to file");
    });
  } finally {
    await driver.quit();
  }
};

componentPageScrapper(url);
