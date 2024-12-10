import path from "path";
import { NodeFsAccess } from "./bits/node-fs-access";
import { XmlNd, XmlNdText } from "../lib/xml-nd";
import { TreeNode } from "../lib/tree-node";
import { DirInfo, FileSizeDesc, ImgInfo, Size2 } from "src/types";
import { execPromise, fsAccess, getUniqueId, htmlRoot, regionsDir, rootDirectory, thumbnailsDir } from "./bits/utils";


let outputLines: string[] = [];

function makeId(sectName: string, name: string) {
    let sName = sectName.toLocaleLowerCase().split(" ").join("-");
    let nName = name.toLocaleLowerCase().split(" ").join("-");
    return `${sName}_${nName}`;
}

function generateLink(itemUrl: string, 
    res: Size2, size: FileSizeDesc, fileFormat: string) {

        let fileFormatDesc = fileFormat;
        if (fileFormat == "webp-lossless") {
            fileFormatDesc = `webp <span class="lossless-tag">(lossless)</span>`
        }
        if (fileFormat == "png") {
                fileFormatDesc = `png <span class="lossless-tag">(lossless)</span>`
        }

        let sizeWarning = "";
        if (size.unit.toLocaleLowerCase() == "mb" && size.size > 45) {
            sizeWarning = `<div class="warning"></div>`
        }

return `
<a href="${itemUrl}" class="fileLink ${fileFormat}">
    <div class="pageIcon">
        <svg class="pageIcon-svg" viewBox="0 0 60 85"><use href="#pageSymbol" /></svg>
    </div>
    <div class="fileData">
        <div>
            <span class="resolution">${res.w}×${res.h}</span>
            <span class="format"><span>${fileFormatDesc}</span></span>
        </div>
        <div>
            <span class="size">${sizeWarning}${size.size}<span>${size.unit}</span>${sizeWarning}</span>
        </div>
    </div>
</a>
`
}

function roundToThree(number): number {
    return (Math.round(number * 100)/100)
}

function getSizeString(fsize: number): FileSizeDesc {


    if (fsize >= (1024*1024)) {
        let mb = roundToThree(fsize / (1024*1024));

        return {
            size: mb,
            unit: "MB"
        }

    } else {
        let kb = roundToThree(fsize / 1024);
        return {
            size: kb,
            unit: "kB"
        }
    }
}

function translateImage(img: ImgInfo): XmlNd {


    let megaPixels: number = img.width * img.height / 1000000

    if (megaPixels > 10) {
        megaPixels = Math.round(megaPixels);
    } else if (megaPixels < 1) {
        megaPixels = Math.round(megaPixels * 100) / 100
    } else {
        megaPixels = Math.round(megaPixels * 10) / 10
    }

    let imgContainerNode = new XmlNd("div").addAttr("class", "img-container");

    let imgNode = new XmlNd("div")
        .addAttr("class", "img-frame")
        
    let thumbPath = path.relative(htmlRoot, img.thumbPath);
    let linkPath = path.join(regionsDir, img.relPath);

    imgNode.addChild(new XmlNd("img", true)
        .addAttr("src", thumbPath)
        .addAttr("class", "thumb-bg"))

    imgNode.addChild(new XmlNd("img", true)
        .addAttr("src", thumbPath)
        .addAttr("class", "thumb"))

    let descNode = new XmlNd("div")
        .addAttr("class", "img-desc")
        .addChild(
            (new XmlNd("h3")).addChild(new XmlNdText(img.name)))
        
    descNode.addChild(new XmlNd("div", false, [["class", "megapix"]])
    .addTextChild(`<span>${megaPixels}</span><span>megapixels</span>`));

    descNode.addChild(new XmlNd("div", false, [["class", "line"]]));

    let fformat = img.extension.toLocaleLowerCase();
    if (fformat == "webp" && img.lossless) {
        fformat = "webp-lossless";
    }

    descNode.addTextChild(
        generateLink(linkPath ,{w: img.width, h: img.height}, getSizeString(img.filesize), fformat)
    )

    imgContainerNode.addChild(imgNode).addChild(descNode);
    return imgContainerNode;
}


function translateNode(dataNode: TreeNode<ImgInfo, DirInfo>, level: number = 0): XmlNd {

    let htmlNode = new XmlNd("div").addAttr("id", dataNode.metadata.uniqueIdString);


    let classes: string[] = [];
    classes.push("groupNode");
    classes.push(`node-level-${level.toString()}`);
    if (dataNode.name.toLocaleLowerCase().trim() == "locations") {
        classes.push("locations")
    }

    htmlNode.addAttr("class", classes.join(" "));
    htmlNode.addChild((new XmlNd("h2")).addChild(new XmlNdText(dataNode.name)));

    if (dataNode.items.length > 0) {
        let imgSetNode = new XmlNd("div")
            .addAttr("class", "group-imgs")

        for (let i of dataNode.items) {
            imgSetNode.addChild(translateImage(i));
        }
        htmlNode.addChild(imgSetNode); 
    }

    if (dataNode.children.length > 0) {
        
        dataNode.children.sort((a,b) => {
            if (a.name.toLocaleLowerCase().trim() == "locations") {
                return 1;
            }
            if (b.name.toLocaleLowerCase().trim() == "locations") {
                return -1;
            }

            return a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase());
        })

        let childSetNode = new XmlNd("div")
            .addAttr("class", "group-children")

        for (let c of dataNode.children) {
            childSetNode.addChild(translateNode(c, level + 1));
        }
        htmlNode.addChild(childSetNode); 
    }







    return htmlNode;

}

function getIndex(dataset: TreeNode<ImgInfo, DirInfo>): XmlNd {

    let root = new XmlNd("div");
    root.addChild(new XmlNd("h1").addTextChild("Pokemon Region Art and Whatnot"));
    root.addChild(new XmlNd("h3").addTextChild("Index Goes Here"));
    return root;

}

async function wrapPage(content: string): Promise<string> {
    let templateString = (await fsAccess.readFile("./../../template.html")).toString().split("<!--<TEMPLATE>-->");

    return templateString[0] + content + templateString[2];
}

async function main() {

    let dataset: TreeNode<ImgInfo, DirInfo> = 
        JSON.parse((await fsAccess.readFile("./../fileTree.json")).toString());


    let sectionsSet: XmlNd[] = [];

    let indexTree: XmlNd = getIndex(dataset);
    sectionsSet.push(indexTree);

    let mainHtmlTree = translateNode(dataset);
    sectionsSet.push(mainHtmlTree);

    let contentString = sectionsSet.map(n => n.getOutput(2)).join("\n");



    let resultString = await wrapPage(contentString);

    
    fsAccess.writeFile("./../../index.html", resultString);

    console.log(rootDirectory);
    console.log(htmlRoot);
    console.log(regionsDir);
    console.log(thumbnailsDir);


}

main();