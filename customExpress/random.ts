class A { 
    constructor(params) {
        this.params = params
    }

    [Symbol.toPrimitive]{ 
        return "f"
    }
}

console.log(new A(4))