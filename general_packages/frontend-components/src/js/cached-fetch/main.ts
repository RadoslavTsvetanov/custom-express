import * as b from  "@blazyts/better-standard-library"

console.log(b)

export class CachedFetch{
    private strategyToDetermineWhetherToExecuteRequestOrGetItFromCache: () => void  
    constructor(strategyToDetermineWhetherToExecuteRequestOrGetItFromCache: () => Promise<boolean>) {
        
    }
}