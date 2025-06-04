// simple wrapper which creates the crud scaffold and allows extra properties too

type CrudMethods<Name extends string> = {

};

function CrudifyStrict<Name extends string, Model>(name: Name, model: Model, methods: {
    getOne: (query: Partial<Model>) => Model;
    getAll: (() => Model[]) | (() => Record<string, Model>);
    delete: (query: Partial<Model>) => void;
    update: (query: Partial<Model>) => void;
}) {

}

function Curdify<Name extends string, getOne extends Function>(method: {
    getOne: getOne;
}) {}
