export interface IXmlNd {
    getOutput(depth: number): string;
}

export class XmlNd implements IXmlNd {
    constructor(
        private tag: string, 
        public selfTerminating: boolean = false,
        private attributes: [string, string][] = [],
        private properties: string[] = [],
        private children: IXmlNd[] = []) {

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

    public addAttr(name: string, value: string): XmlNd {
        this.attributes.push([name, value]);
        return this;
    }

    public addProp(name: string): XmlNd {
        this.properties.push(name);
        return this;
    }

    public addChild(c: IXmlNd): XmlNd {
        this.children.push(c);
        return this;
    }

    public addTextChild(text: string): XmlNd {
        this.addChild(new XmlNdText(text));
        return this;
    }



}

export class XmlNdText implements IXmlNd {


    constructor(public text: string, public splitTextTabs: boolean | null = null) {
        
    }
    public getOutput(depth: number = 0, doSplitTextTabs = null): string {
        let tabs: string = "\t".repeat(depth);

        if (doSplitTextTabs === null) {
            doSplitTextTabs = this.splitTextTabs;
        }

        if (doSplitTextTabs) {
            this.text = this.text.split("\n").map(n => tabs + n).join("\n");
        }

        return tabs + this.text;
    }
}