export interface IXmlNd {
    getOutput(depth: number): string;
    type: 'node' | 'txt';
}


export interface XmlNdOpts {
    selfTerminating?: boolean;
    attrs?: [string, string][] | any;
    props?: string[];
    id?: string;
    class?: string;
}


function IsNullOrWhitespace(str: string) {
    return ((str == null) || str.trim() == "")
}
  

export function NewXnd(
    tag: string, opts: XmlNdOpts = {}, children: IXmlNd[] | string = []
) {


    let attributes: [string, string][] = [];
    if (opts.attrs == undefined) {
        attributes = []
    } else if (opts.attrs instanceof Array) {
        attributes = opts.attrs ?? [];
    } else {
        let keys = Object.getOwnPropertyNames(opts.attrs);
        attributes = keys.map(n => {
            return [n, opts.attrs[n]];
        });
    }

    if (opts.id !== undefined && !IsNullOrWhitespace(opts.id)) {
        attributes.push(["id", opts.id])
    }
    if (opts.class !== undefined && !IsNullOrWhitespace(opts.class)) {
        attributes.push(["class", opts.class])
    }

    let childs: IXmlNd[] = [];
    if (typeof children === 'string' || children instanceof String) {
        childs = [new XmlNdText(children.toString())];
    } else {
        childs = children;
    }


    return new XmlNd(tag, 
        opts.selfTerminating ?? false, 
        attributes ?? [], 
        opts.props ?? [], 
        childs)
}

export function NewXNdText(text: string, splitTextTabs: boolean | null = null): XmlNdText {
    return new XmlNdText(text, splitTextTabs);
}


export class XmlNd implements IXmlNd {
    constructor(
        private tag: string, 
        public selfTerminating: boolean = false,
        private attributes: [string, string][] = [],
        private properties: string[] = [],
        private children: IXmlNd[] = []) {
    }

    type: 'node';

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

    public addChild(...childs: IXmlNd[]): XmlNd {
        for (let c of childs) {
            this.children.push(c);
        }
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

    type: 'txt';

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