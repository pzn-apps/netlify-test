require("dotenv").config();
const { Octokit } = require('octokit')
const expressHandleBars = require('express-handlebars');
const linkToEngRepo = "/repos/pzn-apps/pzn-apps-content/contents/en/"
const endOfMdFile = "?ref=main";
const express = require('express');
const app = express();
const serverless = require('serverless-http');

const octokit = new Octokit({
    auth: "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",
})
// const router = express.Router();
// router.get('/', (req, res) => {
//     res.json({
//         'hello': 'hi',
//     })
// })

// app.use('/', router)

// module.exports.handler = serverless(app)




const linkToEngWordDocumentAutoFill = "/repos/pzn-apps/pzn-apps-content/contents/en/word-document-auto-fill/"
let wordAutoFillContent = [];

const linkToTaskBase = "/repos/pzn-apps/pzn-apps-content/contents/en/task-base/"
let taskBaseContent = [];
const taskBaseFolders = [];


// const wordAutoFillRender = []
let wordAutoFillRouteRender = []


// async function getIntroMd() {
//     const introResponse = await octokit.request(`GET ${linkToEngRepo}intro.md${endOfMdFile}`, {

//         owner: 'OWNER',
//         repo: 'REPO'

//     })

//     addToWordArr(introResponse, introMdArray, 0)
// }
// getIntroMd()
function convertObsidianLinks(text) {
    let result = text

    let links = result.match(/(?<=\[\[)(.*?)(?=\]\])/g)
    if (links) {
        let images = result.match(/(?<=!\[\[)(.*?)(?=\]\])/g)
        links.map(link => {
            if (images.find(el => { return el === link })) return
            let parts = link.split('|')
            if (!parts[0]) return
            if (!parts[1]) parts[1] = parts[0].split('/').pop()

            result = result.replace(
                '[[' + link + ']]',
                '[' + parts[1].replace(/\/.*\//g, '') + '](' + parts[0].replace(new RegExp(' ', 'g'), '').replace(/'/g, '').replace(/.*\//g, '') + ')'
            )
        })
        return result
    }

}
// let fixedText = removeLinks.replaceAll("![[pzn-apps/img", `![alt text](https://github.com/pzn-apps/pzn-apps-content/blob/main/img`)
//     let endFixedText = fixedText.replaceAll("]]", "?raw=true)");
const changeImgLinks = (text) => {
    if (text) {
        let result = text.match(/(\!\[\[pzn-apps\/img)(.*?)(\]\])/g)
        if (result) text = text.replaceAll(/\!\[\[pzn-apps\/img/g, 'an image')
        let straightLine = text.match(/\|\d.*\]\]/)

        if (straightLine) {
            text = text.replaceAll(straightLine, 'alt text')
        }


        // let result = text.replace("![[pzn-apps/img", `![alt text](https://github.com/pzn-apps/pzn-apps-content/blob/main/img`)
        return text
    }

}
const addToWordArr = (response, array, index) => {

    let uncodedRepository = atob(response.data.content)
    let removeLinks = convertObsidianLinks(uncodedRepository)
    removeLinks = changeImgLinks(removeLinks)
    // if (removeLinks) {
    //     let addImg = changeImgLinks(removeLinks)
    //     if (addImg) 
    {
        let showdown = require('showdown'),
            converter = new showdown.Converter(),
            convertedText = removeLinks,
            html = converter.makeHtml(convertedText);

        array[index] = html;
        return array
    }
}

// }


const getContent = async (projectName, item, length, projectArray) => {
    let arr
    let index
    for (let i = 0; i < 1; i++) {
        let regExpItem = item.name.replaceAll(/ /g, "%20");

        const responseData = await octokit.request(`GET ${projectName}${regExpItem}${endOfMdFile}`)
        index = responseData.data.name[0]
        if (projectName.includes("word-document-auto-fill/")) {
            wordAutoFillContent = addToWordArr(responseData, projectArray, index)
        }
        if (projectName.includes("task-base/")) {
            taskBaseContent = addToWordArr(responseData, projectArray, index)
        }
    }
    for (let i = 0; i < length; i++) {

        app.get(`/${wordAutoFillRouteRender[i]}`, (req, res) => {

            res.render('layouts/main', { left_content: wordAutoFillSubFolders, right_content: wordAutoFillContent[i] })

        })
    }
    for (let i = 0; i < length; i++) {
        app.get(`/${taskBaseRouteRender[i]}`, (req, res) => {

            res.render('layouts/main', { left_content: taskBaseSubFolders, right_content: taskBaseContent[i] })

        })
    }

}
const wordAutoFillFolders = [];
const handlebars = expressHandleBars.create({
    defaultLayout: 'main',
    extname: 'hbs',
});
app.engine('hbs', handlebars.engine)

// view engine - шаблонизатор,hbs - расширение файла
// app.set('views', 'views')
app.set('view engine', 'hbs')

app.get('/', (req, res) => {
    res.render('layouts/main', { right_content: introMdArray })
})



app.use(express.static(__dirname + "/views"));
port = process.env.PORT || 80
app.listen(port)

const dataArr = [];
const introMdArray = [];




async function getFoldersCount(project, foldersArray, contentArray) {
    const response = await octokit.request(`GET ${project}`, {
        owner: 'OWNER',
        repo: 'REPO'
    })
    for (let i = 0; i < response.data.length; i++) {
        getContent(project, response.data[i], response.data.length, contentArray)
        foldersArray.push(response.data[i].name)
    }
    const newArr = foldersArray.map(item => item.replace(/ /g, ''))
    return [newArr, foldersArray]
}
const wordAutoFillSubFolders = []
getFoldersCount(linkToEngWordDocumentAutoFill, wordAutoFillFolders, wordAutoFillContent).then(item => {
    for (let i = 0; i < item[0].length; i++) {
        wordAutoFillRouteRender.push(item[0][i].replace(/.md/, '').replace(/'/g, ""))
        let a = `${item[0][i].replace(/.md/, '')}`
        let linkSubFolder = `<a class = 'left-content-subfolder' href='./${item[0][i].replace(/.md/, '').replace(/'/g, '')}'>${item[1][i].replace(/.md/, '')}</a>`
        wordAutoFillSubFolders.push(linkSubFolder)
        // wordAutoFillRender.push(a)
    }
})
let taskBaseRouteRender = []
const taskBaseSubFolders = []
getFoldersCount(linkToTaskBase, taskBaseFolders, taskBaseContent).then(item => {
    for (let i = 0; i < item[0].length; i++) {
        taskBaseRouteRender.push(item[0][i].replace(/.md/, '').replace(/'/g, ""))
        // let a = `./${taskBaseFolders[i].replace(/.md/, '').replace(/'/g, '')}`
        // taskBaseRouteRender.push(a)
        let linkSubFolder = `<a class = 'left-content-subfolder' href='./${item[0][i].replace(/.md/, '').replace(/'/g, '')}'>${item[1][i].replace(/.md/, '')}</a>`
        taskBaseSubFolders.push(linkSubFolder)

    }
    app.get('/', (req, res) => {
        res.render("main.hbs",
            { left_content: taskBaseRouteRender.map(item => item) }
        )
    })

})


const pathCreate = (foldersArray) => {
    foldersArray = foldersArray.forEach(item => item.replace(/ /g, ""));
    return foldersArray
}
pathCreate(wordAutoFillFolders)









