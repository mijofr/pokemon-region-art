
export function sortWithOrderedList<T>(toSort: T[], sortOrder: string[], cFunc: (c:T) => string ) {

 
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
