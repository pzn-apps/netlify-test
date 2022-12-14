require("dotenv").config();
const { Octokit } = require("octokit");
const expressHandleBars = require("express-handlebars");
const linkToEngRepo = "/repos/pzn-apps/pzn-apps-content/contents/en/";
const endOfMdFile = "?ref=main";
const express = require("express");
const app = express();
const serverless = require("serverless-http");

const octokit = new Octokit({
  auth: process.env.API_KEY,
});

const linkToEngWordDocumentAutoFill =
  "/repos/pzn-apps/pzn-apps-content/contents/en/word-document-auto-fill/";
let wordAutoFillContent = [];

const linkToTaskBase =
  "/repos/pzn-apps/pzn-apps-content/contents/en/task-base/";
let taskBaseContent = [];
const taskBaseFolders = [];
let wordAutoFillRouteRender = [];

async function getIntroMd() {
  const introResponse = await octokit.request(
    `GET ${linkToEngRepo}intro.md${endOfMdFile}`,
    {
      owner: "OWNER",
      repo: "REPO",
    }
  );

  addToWordArr(introResponse, introMdArray, 0);
}
getIntroMd();
function convertObsidianLinks(text, imagePath, removePathFromLinks) {
  let result = convertObsidianImageLinks(text, imagePath);

  let links = result.match(/(?<=\[\[)(.*?)(?=\]\])/g);
  if (links) {
    links.map((link) => {
      let parts = link.split("|");
      if (!parts[0]) return;
      let label = parts[1] || parts[0].split("/").pop();
      let filename = removePathFromLinks ? parts[0].split("/").pop() : parts[0];

      result = result.replace(
        "[[" + link + "]]",
        "[" + label + "](" + filename.replace(new RegExp(" ", "g"), "") + ")"
      );
    });
  }

  return result;
}

function convertObsidianImageLinks(text, path) {
  const labelSubstitute = "unknown";
  let result = text;
  let images = result.match(/(?<=!\[\[)(.*?)(?=\]\])/g);
  if (images) {
    images.map((image) => {
      let parts = image.split("|");
      if (!parts[0]) return;

      let label = parts[1] || labelSubstitute;
      let filename = parts[0].replace(/\\/g, "/").split("/").pop();

      result = result.replace(
        "![[" + image + "]]",
        "![" + label + "](" + path + filename + "?raw=true)"
      );
    });
  }

  return result;
}

addToWordArr = (response, array, index) => {
  let uncodedRepository = atob(response.data.content);
  let removeLinks = convertObsidianLinks(
    uncodedRepository,
    "https://github.com/pzn-apps/pzn-apps-content/blob/main/img/",
    true
  );
  // removeLinks = changeImgLinks(removeLinks)
  // if (removeLinks) {
  //     let addImg = changeImgLinks(removeLinks)
  //     if (addImg)
  {
    let showdown = require("showdown"),
      converter = new showdown.Converter(),
      convertedText = removeLinks,
      html = converter.makeHtml(convertedText);

    array[index] = html;
    return array;
  }
};

// }

const getContent = async (projectName, item, length, projectArray) => {
  let arr;
  let index;
  for (let i = 0; i < 1; i++) {
    let regExpItem = item.name.replaceAll(/ /g, "%20");

    const responseData = await octokit.request(
      `GET ${projectName}${regExpItem}${endOfMdFile}`
    );
    index = responseData.data.name[0];
    if (projectName.includes("word-document-auto-fill/")) {
      wordAutoFillContent = addToWordArr(responseData, projectArray, index);
    }
    if (projectName.includes("task-base/")) {
      taskBaseContent = addToWordArr(responseData, projectArray, index);
    }
  }
  for (let i = 0; i < length; i++) {
    app.get(`/${wordAutoFillRouteRender[i]}`, (req, res) => {
      res.render("layouts/main", {
        left_content: wordAutoFillSubFolders,
        right_content: wordAutoFillContent[i],
      });
    });
  }
  for (let i = 0; i < length; i++) {
    app.get(`/${taskBaseRouteRender[i]}`, (req, res) => {
      res.render("layouts/main", {
        left_content: taskBaseSubFolders,
        right_content: taskBaseContent[i],
      });
    });
  }
};
const wordAutoFillFolders = [];
const handlebars = expressHandleBars.create({
  defaultLayout: "main",
  extname: "hbs",
});
app.engine("hbs", handlebars.engine);

// view engine - ????????????????????????,hbs - ???????????????????? ??????????
// app.set('views', 'views')
app.set("view engine", "hbs");

app.get("/", (req, res) => {
  res.render("layouts/main", { right_content: introMdArray });
});

app.use(express.static(__dirname + "/views"));
port = process.env.PORT || 80;
app.listen(port);

const dataArr = [];
const introMdArray = [];

async function getFoldersCount(project, foldersArray, contentArray) {
  const response = await octokit.request(`GET ${project}`, {
    owner: "OWNER",
    repo: "REPO",
  });
  for (let i = 0; i < response.data.length; i++) {
    getContent(project, response.data[i], response.data.length, contentArray);
    foldersArray.push(response.data[i].name);
  }
  const newArr = foldersArray.map((item) => item.replace(/ /g, ""));
  return [newArr, foldersArray];
}
const wordAutoFillSubFolders = [];
getFoldersCount(
  linkToEngWordDocumentAutoFill,
  wordAutoFillFolders,
  wordAutoFillContent
).then((item) => {
  for (let i = 0; i < item[0].length; i++) {
    wordAutoFillRouteRender.push(
      item[0][i].replace(/.md/, "").replace(/'/g, "")
    );
    let a = `${item[0][i].replace(/.md/, "")}`;
    let linkSubFolder = `<a class = 'left-content-subfolder' href='./${item[0][
      i
    ]
      .replace(/.md/, "")
      .replace(/'/g, "")}'>${item[1][i].replace(/.md/, "")}</a>`;
    wordAutoFillSubFolders.push(linkSubFolder);
    // wordAutoFillRender.push(a)
  }
});
let taskBaseRouteRender = [];
const taskBaseSubFolders = [];
getFoldersCount(linkToTaskBase, taskBaseFolders, taskBaseContent).then(
  (item) => {
    for (let i = 0; i < item[0].length; i++) {
      taskBaseRouteRender.push(item[0][i].replace(/.md/, "").replace(/'/g, ""));
      // let a = `./${taskBaseFolders[i].replace(/.md/, '').replace(/'/g, '')}`
      // taskBaseRouteRender.push(a)
      let linkSubFolder = `<a class = 'left-content-subfolder' href='./${item[0][
        i
      ]
        .replace(/.md/, "")
        .replace(/'/g, "")}'>${item[1][i].replace(/.md/, "")}</a>`;
      taskBaseSubFolders.push(linkSubFolder);
    }
    app.get("/", (req, res) => {
      res.render("main.hbs", {
        left_content: taskBaseRouteRender.map((item) => item),
      });
    });
  }
);

const pathCreate = (foldersArray) => {
  foldersArray = foldersArray.forEach((item) => item.replace(/ /g, ""));
  return foldersArray;
};
pathCreate(wordAutoFillFolders);
