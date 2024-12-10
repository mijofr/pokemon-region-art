let itemsToSort = [
    "Johto",
    "Hoenn",
    "Poketopia",
    "Orange Islands",
    "Sinnoh",
    "Pokemon Island",
    "Kanto & Johto",
    "Kalos",
    "Kanto",
    "Mystery Dungeon",
    "Aeos Island",
    "Orre",
];


let sortOrderList = [
    "Kanto",
    "Sevii Islands",
    "Kanto & Johto",
    "Johto",
    "Hoenn",
    "Mystery Dungeon"
]


interface ITestInterface {
        name: string;
        idNum: string;
}

function specialSort<T>(toSort: T[], sortOrder: string[], cFunc: (c:T) => string ) {

 
    let sortOrderLower = sortOrder.map(n => n.toLocaleLowerCase());
    let otherIdx = sortOrderLower.indexOf("*");

    console.log("otherIdx", otherIdx);
    if (otherIdx == -1) {
        otherIdx = sortOrderLower.length;
    }


    toSort.sort((a,b) => {


        let AName = cFunc(a);
        let BName = cFunc(b);

        let AIndex = sortOrderLower.indexOf(AName.toLocaleLowerCase());
        let BIndex = sortOrderLower.indexOf(BName.toLocaleLowerCase());

        if (AIndex == -1 && BIndex == -1) {
            return AName.localeCompare(BName);
        }
        AIndex = (AIndex == -1) ? otherIdx : AIndex;
        BIndex = (BIndex == -1) ? otherIdx : BIndex;

        return AIndex - BIndex;

    })

}



function main() {

    let subObj = itemsToSort.map((item,idx) => {
        return {
            name: item,
            idNum: idx.toString().padStart(2,"0")
        }
    })

    specialSort(subObj, sortOrderList, (u) => u.name);

    console.log(subObj);


}

main();