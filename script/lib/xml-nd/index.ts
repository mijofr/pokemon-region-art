export class XmlNd {
    constructor(
        private tag: string, 
        public selfTerminating: boolean = false,
        private attributes: [string, string][] = [],
        private properties: string[] = [],
        private children: XmlNd[] = []) {

    }

    public getOutput(depth: number = 0): string {

        let tabs: string = "\t".repeat(depth);

        let attrString = "";
        if (this.attributes.length > 0) {
            attrString = " " + this.attributes
                .map(([l,m]) => `${l}="${m}"`)
                .join(" ");
        }

        let propString = "";
        if (this.properties.length > 0) {
            propString = " " + this.properties.join(" ");
        }

        let childStr = "";
        if (this.children.length > 0) {
            childStr = `${this.children.map(n => n.getOutput(depth+1)).join("\n")}\n`
        }

        if (this.selfTerminating) {
            return `${tabs}<${this.tag}${attrString}${propString} />`
        } else {
            return `${tabs}<${this.tag}${attrString}${propString}>\n${childStr}${tabs}</${this.tag}>`
        } 
    }

    public addAttr(name: string, value: string) {
        this.attributes.push([name, value]);
    }

    public addProp(name: string) {
        this.properties.push(name);
    }

    public addChild(c: XmlNd) {
        this.children.push(c);
    }

}

