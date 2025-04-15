import * as b from  "@custom-express/better-standard-library"

console.log(b)

export class CachedFetch{
    private strategyToDetermineWhetherToExecuteRequestOrGetItFromCache: () => void  
    constructor(strategyToDetermineWhetherToExecuteRequestOrGetItFromCache: () => Promise<boolean>) {
        
    }
}