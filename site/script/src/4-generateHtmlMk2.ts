import path from "path";
import { NodeFsAccess } from "./bits/node-fs-access";
import { IXmlNd, NewXnd, NewXNdText, XmlNd, XmlNdText } from "../lib/xml-nd";
import { TreeNode } from "../lib/tree-node";
import { DirInfo, FileSizeDesc, ImgInfo, Size2 } from "src/types";
import { execPromise, fsAccess, getUniqueId, roundTo } from "./bits/utils";
import { Grouping, ImgFile, ImgSet } from "./2-transformFileTree";
import { IsNullOrWhitespace } from "./bits/utils";


let outputLines: string[] = [];

function makeId(sectName: string, name: string) {
    let sName = sectName.toLocaleLowerCase().split(" ").join("-");
    let nName = name.toLocaleLowerCase().split(" ").join("-");
    return `${sName}_${nName}`;
}

function addTextChunk(inp: string): string {

    inp = inp.split("\r\n").join("\n");

    inp = inp.split("\n").filter(n => n.trim() != "").map(n => `<p>${n}</p>`).join("");

    return `<div class="notes">${inp}</div>`
}

function generateLink4(itemUrl: string, 
    res: Size2, size: FileSizeDesc, fileFormat: string) {

    let linkItem = NewXnd("a", { attrs: { href: itemUrl }}, [
            NewXnd("div", {class: "pageIcon"}, [
                NewXNdText(`<svg class="pageIcon-svg" viewBox="0 0 60 85"><use href="#pageSymbol"></use></svg>`),
                NewXnd("div", {}, [NewXNdText(fileFormat.toLocaleUpperCase())])
            ])
    ]);

    let fileDataNode = NewXnd("div", {class: "fileData"});
    
    let nDiv = NewXnd("div", {}, [
        NewXnd("span", {}, [
            NewXNdText(size.size.toString()),
            NewXnd("span", {}, [NewXNdText(size.unit)])
        ])
    ]);

    let nDiv2 = NewXnd("div", {}, "Note 2");

    fileDataNode.addChild(nDiv);
    fileDataNode.addChild(nDiv2);

}


function generateLink5(img: ImgFile) {


        let fileFormat = img.extension.toLocaleLowerCase();
        let itemUrl = path.join("..", "regions", img.filePath);
        let size = getSizeString(img.filesize);



        let note: string = "";
        let sizeWarning = "";

        if (img.filesize > 68157440) {
            note += `<div class="tag tag-a">very large file</div>`
            sizeWarning = `<div class="warning"></div>`
        } else if (img.filesize > 47185920) {
            note += `<div class="tag tag-b">large file</div>`
        }
        if (img.metatags.includes("UPSCALE")) {
            note += `<div class="tag tag-d">upscale</div>`
        }
        if (img.metatags.includes("DOWNSCALE")) {
            // note += `<div class="tag tag-g">downscale</div>`
        }

        return `
        <a href="${itemUrl}" class="fileLink ${fileFormat}">
          <div class="pageIcon">
            <svg class="pageIcon-svg" viewBox="0 0 60 85"><use href="#pageSymbol"></use></svg>
            <div>${fileFormat.toLocaleUpperCase()}</div>
          </div>
          <div class="fileData">
            <div>
              <span class="size">${sizeWarning}${size.size}<span>${size.unit}</span>${sizeWarning}</span>
            </div>
            <div>
              <span class="format-spacer">${fileFormat.toLocaleUpperCase()}</span>${note}&nbsp;
            </div>
          </div>
        </a>`;
    }

function roundToThree(number): number {
    return (Math.round(number * 100)/100)
}


function addTextSpan(text: string, classStr: string = ""): XmlNd {
    let n = new XmlNd("span").addTextChild(text);
    if (!IsNullOrWhitespace(classStr)) {
        n.addAttr("class", classStr);
    }
    return n;
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


    return new XmlNdText(
        generateLink5(img)
    );


}

function translateSizes(imgSet: ImgSet): IXmlNd[] {

    let items: IXmlNd[] = [];

    let i = 0;

    items.push(NewXnd("div", {class: "growBuffer"}))
    
    for (let size of imgSet.sizes) {

        if (i > 0) {
            items.push(new XmlNd("div", false, [["class", "line"]]));
        }
        i++;


        let res = NewXnd("span", {class: "resolution"}, `${size.w}×${size.h}`);

        let aspect = roundTo(size.w/size.h,3);

        let aspectDemo = NewXnd("div", { class: "aspect-demo-outer"}, [
            NewXnd("div", {}, [
                NewXnd("div", {attrs: {style: `aspect-ratio:${aspect.toString()}`}})
            ])
        ]);

        let head = NewXnd("div", {class: "resolution-set-head"}, [res, aspectDemo]);


        let resFiles = NewXnd("div", {class: "resolution-set-files"});

        

        let filesOfSize = imgSet.files.filter(n => { 
            return n.width == size.w && n.height == size.h
        });

        for (let f of filesOfSize) {
            resFiles.addChild(translateImgLink(f))
        }

        let resSet = NewXnd("div", {class: "resolution-set"}, [head, resFiles]);
        items.push(resSet);
    }

    return items;

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

    let descNode = NewXnd("div", {class: "img-desc"});

    let headingWrapNode = NewXnd("div", {class: "heading"});
    descNode.addChild(headingWrapNode);

    headingWrapNode.addChild(
        (new XmlNd("h3")).addChild(new XmlNdText(imgSet.name)));

    let megaGrade = Math.floor((1.25 * Math.pow((imgSet.maxMegapixels*3),0.363636363)) + 1);
    megaGrade = megaGrade < 1 ? 1 : megaGrade;
    megaGrade = megaGrade > 9 ? 9 : megaGrade;
        
    headingWrapNode.addChild(new XmlNd("div", false, [["class", `megapix weight-${megaGrade}00`]])
    .addTextChild(`<span>${megaPixels}</span><span>megapixels</span>`));

    if (!IsNullOrWhitespace(imgSet.notes)) {
        descNode.addChild(new XmlNdText(addTextChunk(imgSet.notes), false));
    }

    descNode.addChild(...translateSizes(imgSet));


    /*

    let li = 0;
    for (let f of imgSet.files) {
        if (li > 0) {
            descNode.addChild(new XmlNd("div", false, [["class", "line"]]));
        }
        descNode.addChild(translateImgLink(f));
        li++;
    }

    */


    imgContainerNode.addChild(imgNode).addChild(descNode);
    return imgContainerNode;
}


function translateNode(dataNode: Grouping, level: number = 0): XmlNd {

    let htmlNode = new XmlNd("div").addAttr("id", dataNode.id);


    let classes: string[] = [];
    classes.push("groupNode");
    classes.push(`node-level-${level.toString()}`);
    if (dataNode.name.toLocaleLowerCase().trim() == "locations") {
        classes.push("is-minor")
    } else if (dataNode.isMinor) {
        classes.push("is-minor")
    }


    htmlNode.addAttr("class", classes.join(" "));
    htmlNode.addChild((new XmlNd("h2")).addChild(new XmlNdText(dataNode.name)));

    
    if (!IsNullOrWhitespace(dataNode.notes)) {
        htmlNode.addChild(new XmlNdText(addTextChunk(dataNode.notes), false));
    }

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


    linkItem.addChild(addTextSpan(dataset.name, "idxItemName"));
    linkItem.addAttr("href", `#${dataset.id}`);

    if (dataset.imgs.length > 0) {
        linkItem.addChild(new XmlNd("span", false, [["class", "count"]]).addTextChild(`${dataset.imgs.length.toString()}`))
    }


    root.addChild(linkItem);
    
    if (dataset.childGroups.length > 0) {
        let subListRoot = new XmlNd("ul", false, [["class", `idxLevel${dataset.depth}`]]);
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


    let listRoot = new XmlNd("ul", false, [["class", "idxLevel0"]]);

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

export async function main() {

    let dataset: Grouping = 
        JSON.parse((await fsAccess.readFile("./../imageDisplayTree.json")).toString());


    let sectionsSet: XmlNd[] = [];

    let indexTree: XmlNd = getIndex(dataset);
    sectionsSet.push(indexTree);

    let mainHtmlTree = translateNode(dataset);
    sectionsSet.push(mainHtmlTree);

    let contentString = sectionsSet.map(n => n.getOutput(2)).join("\n");



    let resultString = await wrapPage(contentString);

    
    await fsAccess.writeFile("./../../indexMk2.html", resultString);



}

main();