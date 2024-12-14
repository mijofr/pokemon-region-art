import path from "path";
import { NodeFsAccess } from "./bits/node-fs-access";
import { IXmlNd, XmlNd, XmlNdText } from "../lib/xml-nd";
import { TreeNode } from "../lib/tree-node";
import { DirInfo, FileSizeDesc, ImgInfo, Size2 } from "src/types";
import { execPromise, fsAccess, getUniqueId } from "./bits/utils";
import { Grouping, ImgFile, ImgSet } from "./2-transformFileTree";


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

function translateImgLink(img: ImgFile): IXmlNd {


    let fformat = img.extension.toLocaleLowerCase();
    if (fformat == "webp" && img.lossless) {
        fformat = "webp-lossless";
    }

    let filePath = path.join("..", "regions", img.filePath);

    return new XmlNdText(
        generateLink(filePath ,{w: img.width, h: img.height}, getSizeString(img.filesize), fformat)
    );
}

function translateImage(imgSet: ImgSet): XmlNd {


    let megaPixels: number = imgSet.maxMegapixels;

    if (megaPixels > 10) {
        megaPixels = Math.round(megaPixels);
    } else if (megaPixels < 1) {
        megaPixels = Math.round(megaPixels * 100) / 100
    } else {
        megaPixels = Math.round(megaPixels * 10) / 10
    }

    let imgContainerNode = new XmlNd("div").addAttr("class", "img-container").addAttr("id", imgSet.id);

    let imgNode = new XmlNd("div")
        .addAttr("class", "img-frame")
        
    let thumbPath = path.join("./../", imgSet.thumbnailPath);

    imgNode.addChild(new XmlNd("img", true)
        .addAttr("src", thumbPath)
        .addAttr("class", "thumb-bg"))

    imgNode.addChild(new XmlNd("img", true)
        .addAttr("src", thumbPath)
        .addAttr("class", "thumb"))

    let descNode = new XmlNd("div")
        .addAttr("class", "img-desc")
        .addChild(
            (new XmlNd("h3")).addChild(new XmlNdText(imgSet.name)))
        
    descNode.addChild(new XmlNd("div", false, [["class", "megapix"]])
    .addTextChild(`<span>${megaPixels}</span><span>megapixels</span>`));

    descNode.addChild(new XmlNd("div", false, [["class", "line"]]));


    for (let f of imgSet.files) {
        descNode.addChild(translateImgLink(f));
    }


    imgContainerNode.addChild(imgNode).addChild(descNode);
    return imgContainerNode;
}


function translateNode(dataNode: Grouping, level: number = 0): XmlNd {

    let htmlNode = new XmlNd("div").addAttr("id", dataNode.id);


    let classes: string[] = [];
    classes.push("groupNode");
    classes.push(`node-level-${level.toString()}`);
    if (dataNode.name.toLocaleLowerCase().trim() == "locations") {
        classes.push("locations")
    }

    htmlNode.addAttr("class", classes.join(" "));
    htmlNode.addChild((new XmlNd("h2")).addChild(new XmlNdText(dataNode.name)));

    if (dataNode.imgs.length > 0) {
        let imgSetNode = new XmlNd("div")
            .addAttr("class", "group-imgs")

        for (let i of dataNode.imgs) {
            imgSetNode.addChild(translateImage(i));
        }
        htmlNode.addChild(imgSetNode); 
    }

    if (dataNode.childGroups.length > 0) {
        
        dataNode.childGroups.sort((a,b) => {
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

        for (let c of dataNode.childGroups) {
            childSetNode.addChild(translateNode(c, level + 1));
        }
        htmlNode.addChild(childSetNode); 
    }







    return htmlNode;

}


function returnIndexEntry(dataset: Grouping): XmlNd {
    let root = new XmlNd("li");

    let linkItem = new XmlNd("a");
    if (dataset.isMinor) {
        linkItem.addAttr("class", "isMinor");
    }


    linkItem.addTextChild(dataset.name);
    linkItem.addAttr("href", `#${dataset.id}`);

    if (dataset.imgs.length > 0) {
        linkItem.addChild(new XmlNd("span", false, [["class", "count"]]).addTextChild(`${dataset.imgs.length.toString()}`))
    }


    root.addChild(linkItem);
    
    if (dataset.childGroups.length > 0) {
        let subListRoot = new XmlNd("ul");
        for (let d of dataset.childGroups) {
            subListRoot.addChild(returnIndexEntry(d));
        }
        root.addChild(subListRoot);
    }

    return root;
}

function getIndex(dataset: Grouping): XmlNd {

    
    let root = new XmlNd("div", false, [["id", "pageContents"]]);
    let innerRoot = new XmlNd("div");

    root.addChild(innerRoot);


    let listRoot = new XmlNd("ul");

    for (let g of dataset.childGroups) {
        listRoot.addChild(returnIndexEntry(g));
    }


    for (let i of dataset.imgs) {
        let listEntry = new XmlNd("li", false, [["class", "singleImgIndexLink"]])
        listEntry.addChild(new XmlNd("a").addAttr("href", `#${i.id}`).addTextChild(i.name));
        listRoot.addChild(listEntry);
    }

    innerRoot.addChild(listRoot);

    return root;

}

async function wrapPage(content: string): Promise<string> {
    let templateString = (await fsAccess.readFile("./../../template.html")).toString().split("<!--<TEMPLATE>-->");

    return templateString[0] + content + templateString[2];
}

async function main() {

    let dataset: Grouping = 
        JSON.parse((await fsAccess.readFile("./../imageDisplayTree.json")).toString());


    let sectionsSet: XmlNd[] = [];

    let indexTree: XmlNd = getIndex(dataset);
    sectionsSet.push(indexTree);

    let mainHtmlTree = translateNode(dataset);
    sectionsSet.push(mainHtmlTree);

    let contentString = sectionsSet.map(n => n.getOutput(2)).join("\n");



    let resultString = await wrapPage(contentString);

    
    fsAccess.writeFile("./../../indexMk2.html", resultString);


}

main();