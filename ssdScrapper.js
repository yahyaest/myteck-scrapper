const webDriver = require("selenium-webdriver");
const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");

const url =
  "https://www.mytek.tn/informatique/stockage/disque-dur-ssd.html?product_list_limit=all";

// Images Table
const ssdTable = [];

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
        `https://www.mytek.tn/informatique/stockage/disque-dur-ssd.html?p=${index}`
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

          // ssd Data
          const ssdTitle = loadedHtml(".base").text();
          const ssdBrand = loadedHtml('td[data-th="Marque"]').text();
          const ssdPrice =
            loadedHtml('[itemprop="price"]').attr("content") + ",000 TND";
          // loadedHtml(".price").text().split("DT")[0].trim() + " TND";
          const ssdState = loadedHtml('td[data-th="Etat"]').text();
          const ssdInterface = loadedHtml('td[data-th="Interface"]').text();
          const ssdCapacity = loadedHtml(
            'td[data-th="Capacité de Disque"]'
          ).text();
          const ssdFormat = loadedHtml('td[data-th="Format de Disque"]').text();
          const ssdType = loadedHtml('td[data-th="Disque Dur"]').text();

          // // get ssd images
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

          // get ssd images and create images object V2
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
          descriptionObject.brand = ssdBrand;
          descriptionObject.state = ssdState;
          descriptionObject.interface = ssdInterface;
          descriptionObject.capacity = ssdCapacity;
          descriptionObject.format = ssdFormat;
          descriptionObject.type = ssdType;
          // create ssd array
          const ssdObject = {};
          ssdObject.title = ssdTitle;
          ssdObject.description = descriptionObject;
          ssdObject.price = ssdPrice;
          ssdObject.inventory = randomNum(0, 100);
          ssdObject.slug = ssdTitle.toLowerCase().replace(/[^\w-]+/g, "-");
          ssdObject.last_update = randomDate(new Date(2012, 0, 1), new Date());
          ssdObject.collection_id = 9;
          ssdObject.images = imageObject;

          ssdTable.push(ssdObject);
          console.log(elementIndex, ` - Adding ${ssdTitle} ...`);
          elementIndex++;
        } else {
          console.log("error : " + response.status);
        }
      }
    }

    fs.writeFile("./data/ssd.json", JSON.stringify(ssdTable), (err) => {
      if (err) throw err;
      console.log("Data written to file");
    });
  } finally {
    await driver.quit();
  }
};

componentPageScrapper(url);
