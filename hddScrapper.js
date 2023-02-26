const webDriver = require("selenium-webdriver");
const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");

const url =
  "https://www.mytek.tn/informatique/stockage/disque-dur-externe.html?product_list_limit=all";

// Images Table
const externalDriveTable = [];

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
    try {
      let pageNumber = await driver
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
        `https://www.mytek.tn/informatique/stockage/disque-dur-externe.html?p=${index}`
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

          // externalDrive Data
          const externalDriveTitle = loadedHtml(".base").text();
          const externalDriveBrand = loadedHtml('td[data-th="Marque"]').text();
          const externalDrivePrice =
            loadedHtml('[itemprop="price"]').attr("content") + ",000 TND";
            // loadedHtml(".price").text().split("DT")[0].trim() + " TND";
          const externalDriveState = loadedHtml('td[data-th="Etat"]').text();
          const externalDriveInterface = loadedHtml(
            'td[data-th="Interface"]'
          ).text();
          const externalDriveCapacity = loadedHtml(
            'td[data-th="Capacité de Disque"]'
          ).text();
          const externalDriveFormat = loadedHtml(
            'td[data-th="Format de Disque"]'
          ).text();
          const externalDriveType = loadedHtml(
            'td[data-th="Disque Dur"]'
          ).text();

          // // get externalDrive images
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

          // get externalDrive images and create images object V2
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
          descriptionObject.brand = externalDriveBrand;
          descriptionObject.state = externalDriveState;
          descriptionObject.interface = externalDriveInterface;
          descriptionObject.capacity = externalDriveCapacity;
          descriptionObject.format = externalDriveFormat;
          descriptionObject.type = externalDriveType;

          // create externalDrive array
          const externalDriveObject = {};
          externalDriveObject.title = externalDriveTitle;
          externalDriveObject.description = descriptionObject;
          externalDriveObject.price = externalDrivePrice;
          externalDriveObject.inventory = randomNum(0, 100);
          externalDriveObject.slug = externalDriveTitle
            .toLowerCase()
            .replace(/[^\w-]+/g, "-");
          externalDriveObject.last_update = randomDate(
            new Date(2012, 0, 1),
            new Date()
          );
          externalDriveObject.collection_id = 8;
          externalDriveObject.images = imageObject;

          externalDriveTable.push(externalDriveObject);
          console.log(elementIndex, ` - Adding ${externalDriveTitle} ...`);
          elementIndex++;
        } else {
          console.log("error : " + response.status);
        }
      }
    }

    fs.writeFile(
      "./data/hdd.json",
      JSON.stringify(externalDriveTable),
      (err) => {
        if (err) throw err;
        console.log("Data written to file");
      }
    );
  } finally {
    await driver.quit();
  }
};

componentPageScrapper(url);
