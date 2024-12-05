import { exec } from "child_process";
import { NodeFsAccess } from "./node-fs-access";
import path from "path";



export const fsAccess = new NodeFsAccess();

export const rootDirectory = path.resolve("./../../");
export const regionsDir = path.join(rootDirectory, "regions");
export const thumbnailsDir = path.join(rootDirectory, "thumbnails");


let idStart = 10003;

export function getUniqueId() {
    let returnVal = idStart;
    idStart = idStart + 1;
    return idStart;
}

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


export function execPromise(command, opts): Promise<string> {
    return new Promise(function(resolve, reject) {
        exec(command, opts, (error, stdout, stderr) => {
            if (error) {
                console.error(error)
                reject(error);
                return;
            }
            if (stdout != null) {
                resolve(stdout.toString().trim());
            } else {
                return null;
            }
            
        });
    });
}
