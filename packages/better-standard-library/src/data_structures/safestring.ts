type extractParts<T extends  string, Parts extends readonly [] = []> = T extends `${infer T} ${infer Rest}` 
? extractParts<Rest, [...Parts, T]>
: T extends "" 
    ? Parts
    :[...Parts, T]

type g = extractParts<"h k /">

class SmartString<T extends string>{
    private value: T
    constructor(v: T){
        this.value = v
    }

    getPart<desired extends extractParts<T>[number]>(v: desired): desired{
        return this.value.split(" ").find(value => value === v)
    }

    getParts(): extractParts<T> {
        this.value.split(" ")
    }
}

const g = new SmartString("g h   ")
const a = g.getPart("g")
const h = g.getParts()
