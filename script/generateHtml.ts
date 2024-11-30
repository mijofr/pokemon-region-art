import path from "path";
import { NodeFsAccess } from "./node-fs-access";
import { XmlNd, XmlNdText } from "./lib/xml-nd";
import { TreeNode } from "./lib/tree-node";
import { DirInfo, ImgInfo } from "types";


let fsAccess = new NodeFsAccess();

let outputLines: string[] = [];

function makeId(sectName: string, name: string) {
    let sName = sectName.toLocaleLowerCase().split(" ").join("-");
    let nName = name.toLocaleLowerCase().split(" ").join("-");
    return `${sName}_${nName}`;
}

function wrapPage(content: string): string {
    return `<html lang="en">
	<head>
		<meta charset="utf-8">

		<title>Pokemon World Map Art</title>
		<meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="icon" type="image/png" href="./favicon.png" />


		<link rel="stylesheet" type="text/css" href="./styles/normalize.css">
		<link rel="stylesheet" type="text/css" href="./styles/styles.css">
		<link rel="preconnect" href="https://fonts.googleapis.com">
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet">
	</head>
	<body>
${content}
	</body>
</html>
`
}

function roundToThree(number): number {
    return (Math.round(number * 100)/100)
}

function getSizeString(fsize: number): string {


    if (fsize >= (1024*1024)) {
        let mb = roundToThree(fsize / (1024*1024));
        return mb.toString() + " MB"
    } else {
        let kb = roundToThree(fsize / 1024);
        return kb.toString() + " kB";
    }
}

function translateImage(img: ImgInfo): XmlNd {

    let imgContainerNode = new XmlNd("div").addAttr("class", "img-container");

    let imgNode = new XmlNd("div")
        .addAttr("class", "img-frame")
        
    let thumbPath = path.relative(path.resolve("./"), img.thumbPath);

    imgNode.addChild(new XmlNd("img", true)
        .addAttr("src", thumbPath)
        .addAttr("class", "thumb-bg"))

    imgNode.addChild(new XmlNd("img", true)
        .addAttr("src", thumbPath)
        .addAttr("class", "thumb"))

    let descNode = new XmlNd("div")
        .addAttr("class", "img-desc")
        .addChild((new XmlNd("h3")).addChild(new XmlNdText(img.name)))
        .addChild((new XmlNd("span")).addChild(new XmlNdText(getSizeString(img.filesize))));

    imgContainerNode.addChild(imgNode).addChild(descNode);
    
    return imgContainerNode;
}


function translateNode(dataNode: TreeNode<ImgInfo, DirInfo>, level: number = 0): XmlNd {

    let htmlNode = new XmlNd("div");


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

async function main() {

    let dataset: TreeNode<ImgInfo, DirInfo> = 
        JSON.parse((await fsAccess.readFile("./fileTree.json")).toString());


    let htmlTree = translateNode(dataset);


    let resultString = wrapPage(htmlTree.getOutput(2));

    
    fsAccess.writeFile("./index.html", resultString);

}

main();