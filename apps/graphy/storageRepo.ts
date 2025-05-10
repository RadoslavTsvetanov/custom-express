import type { VCallback } from "@custom-express/better-standard-library"
type TabInfo = {}

type VPromise = Promise<void>


const relations = ["parent","child"] as const

type TabRelation = keyof typeof relations 

type TabQuery = {}

export interface Tab {
    info: TabInfo
    addChange(TabChangeInfo: {}): VPromise
    addRelation(tab: Tab, type: TabRelation): VPromise
    getRelations(tabQuery: TabQuery): Tab[]
}

export type Change = {
    window: string,
    tab: string,
    payload: string
}

export interface History {
    addChange(change: Change): void
    get(): Change[]
    getWindowChanges(window: Change["window"]): Change[]
    getTabChanges(window: Change["window"], tab: Change["tab"]): Change[]
}

export interface BrowserWindow {
    tabs: Tab[]
}

export interface TabGraph {
    windows: BrowserWindow[] 
}