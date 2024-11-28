import path from "path";
import { NodeFsAccess } from "./node-fs-access";
import { XmlNd } from "./xml-nd";


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

<title>Insignia & Emblems</title>
<meta name="viewport" content="width=device-width, initial-scale=1">

<link rel="stylesheet" type="text/css" href="./make-preview/normalize.css">
<link rel="stylesheet" type="text/css" href="./make-preview/styles.css">


</head>
<body>
    ${content};
</body>
</html>
`
}

async function main() {


    fsAccess.writeFile("./index.html", outputLines.join("\n"));

}

main();