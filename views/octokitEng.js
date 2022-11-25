import { Octokit, App } from "https://cdn.skypack.dev/octokit?dts";
import config from "./config.js";
const mainDescription = document.getElementById('main-description');
const leftContent = document.querySelector(".left-content");
const wordAutoFillFolders = [];
const wordAutoFillContent = [];
const projectHeader = Array.from(document.querySelectorAll('.project-header'));
const linkToEngRepo = "/repos/pzn-apps/pzn-apps-content/contents/en/"
const linkToEngWordDocumentAutoFill = "/repos/pzn-apps/pzn-apps-content/contents/en/word-document-auto-fill/"
const endOfMdFile = "?ref=main";
const octokit = new Octokit({
    auth: config,
})



const linkToTaskBase = "/repos/pzn-apps/pzn-apps-content/contents/en/task-base/"
const taskBaseContent = [];
const taskBaseFolders = [];

//get intro md file eng
const introMdArray = [];
// async function getIntroMd() {
//     const introResponse = await octokit.request(`GET ${linkToEngRepo}intro.md${endOfMdFile}`, {

//         owner: 'OWNER',
//         repo: 'REPO'

//     })

//     addToWordArr(introResponse, introMdArray)
//     mainDescription.innerHTML = introMdArray[0];
// }
// getIntroMd()
const addToWordArr = (response, array) => {
    //[Link text Here](https://link-url-here.org)
    let uncodedRepository = atob(response.data.content)
    //change link
    let fixedText = uncodedRepository.replaceAll("![[pzn-apps/img", "![alt text](https://github.com/pzn-apps/pzn-apps.github.io/blob/main/img")
    let endFixedText = fixedText.replaceAll("]]", "?raw=true)");
    var converter = new showdown.Converter(),
        convertedText = endFixedText,
        html = converter.makeHtml(convertedText);

    array.push(html);
    return array
}
const enProjects = [];
const getEnProjects = async () => {
    const response = await octokit.request(`GET ${linkToEngRepo}`, {
        owner: 'OWNER',
        repo: 'REPO'
    })
    for (let i = 0; i < response.data.length; i++) {
        if (!response.data[i].name.includes(".md")) {
            enProjects.push(response.data[i].name)
        }
    }
}
getEnProjects()
async function getFoldersCount(project, foldersArray, contentArray) {
    const response = await octokit.request(`GET ${project}`, {
        owner: 'OWNER',
        repo: 'REPO'
    })
    for (let i = 0; i < response.data.length; i++) {
        getContent(project, response.data[i], response.data.length, contentArray)
        foldersArray.push(response.data[i].name)
    }
    console.log(contentArray)
    return foldersArray
}
getFoldersCount(linkToEngWordDocumentAutoFill, wordAutoFillFolders, wordAutoFillContent)
getFoldersCount(linkToTaskBase, taskBaseFolders, taskBaseContent)

const getContent = async (projectName, item, length, projectArray) => {
    let arr
    for (let i = 0; i < 1; i++) {
        let regExpItem = item.name.replaceAll(/ /g, "%20");

        const responseData = await octokit.request(`GET ${projectName}${regExpItem}${endOfMdFile}`)

        arr = addToWordArr(responseData, projectArray)
    }

}


// переход без подгрузки

// const href = Array.from(document.querySelectorAll('.hrefTo'))
// href.map(item => item.addEventListener('click', (e) => {
//     let path = e.target.innerText.replace(/\s/g, '')
//     window.history.pushState({ hrefTo: path }, 'lorem', path)
//     window.addEventListener('popstate', (e) => {
//         e.state ? console.log(e.state) : console.error(e.state)
//     })
// }))


// const hrefFolder = Array.from(document.querySelectorAll('.hrefTo'))
// hrefFolder.map(item => item.addEventListener('click', (e) => {
//     let path = e.target.href.replace(/\s/g, '')
//     let newPath = path.replace(/\'/g, '')
//     console.log(newPath)
//     window.history.pushState({ hrefTo: newPath }, 'lorem', newPath)

//     window.addEventListener('popstate', (e) => {
//         e.state ? console.log(e.state) : console.error(e.state)
//     })
// }))



let pathWordDocument = []
const createSubFolder = (arr, index, subacontent) => {

    document.querySelector(".left-content").innerHTML = '';
    mainDescription.innerHTML = '';
    pathWordDocument = arr.map(item => item.replace(/ /g, '').replace(/.md/g, '').replace(/'/g, ''));
    if (leftContent.children.length === 0) {
        for (let i = 0; i < arr.length; i++) {
            let a = document.createElement('a')
            a.href = pathWordDocument[i];
            a.classList.add('left-content-subfolder');
            a.innerHTML = arr[i].replace(/.md/g, '')
            document.querySelector(".left-content").append(a)
            a.addEventListener('click', () => {
                mainDescription.innerHTML = subacontent[i];
            })
        }
        return pathWordDocument
    }

}
let resp = 0;

projectHeader.map((item, index) => item.addEventListener('click', () => {
    projectHeader.map(item => {
        item.style.backgroundColor = 'rgb(207, 207, 207)';
        item.style.transform = "scale(1)"
    })
    item.style.backgroundColor = "white"
    item.style.transform = "scale(1.09)"
    if (index === 0) createSubFolder(wordAutoFillFolders, index, wordAutoFillContent)
    if (index === 1) createSubFolder(taskBaseFolders, index, taskBaseContent)
    // if (index === 2) createSubFolder(intelligentInfoArrs, index)
    // if (index === 3) createSubFolder(bridgeArrs, index)

}))

