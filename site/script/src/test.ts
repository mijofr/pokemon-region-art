

interface nD {
    prop?: [string, string][] | any;
}



export function main() {
    let a: any =  [["a","b"]];
    a = {p:"d"}

    console.log(a instanceof Array);
}

main();