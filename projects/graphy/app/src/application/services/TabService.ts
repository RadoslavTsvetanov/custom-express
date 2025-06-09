import type { ITab, TabInfo, TabRelation } from "../../domain/tabs/entities/Tab";
import type { IBrowserWindow } from "../../domain/tabs/entities/BrowserWindow";
import { ifNotNone, map, Optionable, tap, Try } from "@blazyts/better-standard-library";
import { watch } from "node:fs";
import { createTab } from "@blazyts/simple-browser-mock";

type VPromise = Promise<void>;



class TabGraphNode {
  constructor(
    public relations: {
      children: TabGraphNode[]
      parents: TabGraphNode[]
    },
    public tabInfo: ITab
  ) { }

}


class TabGraph {
  public elements: Record<browser.tabs.Tab["id"], TabGraphNode>

  getNode(id: browser.tabs.Tab["id"]): Optionable<TabGraphNode> {
    return Optionable.new(() => {
      if (this.elements[id]) {
        return this.elements[id];
      }

      // Otherwise, search recursively in children of all nodes in elements
      const visited = new Set<browser.tabs.Tab["id"]>();

      // Helper recursive function to traverse children
      const dfs = (node: TabGraphNode): TabGraphNode | null => {
        if (visited.has(node.tabInfo.id)) {
          return null; // Avoid cycles
        }
        visited.add(node.tabInfo.id);

        for (const child of node.relations.children) {
          if (child.tabInfo.id === id) {
            return child;
          }
          const found = dfs(child);
          if (found) {
            return found;
          }
        }

        return null;
      }
    })
  }
}


export class TabService {
  public windows: IBrowserWindow[] = [] // make private for non debugging purposes
  constructor() { }

  private getTab(tabId: ITab["id"]): Optionable<ITab> {
    let tab = null

    this.windows.forEach(w => w.tabs.forEach(t => t.id === tabId ? tab = t : "" /*no real meaning behind this it just shouldnt do anything  */));

    return new Optionable(tab)
  }


  async removeTab(tabId: number): VPromise {
    this.windows.forEach(window => {
      window.tabs = window.tabs.filter(tab => tab.id !== tabId);
    })
  }

  addTab(tab: ITab) {
    Try(
      this.windows.find(w => w.id === tab.windowId),
      {
        ifNotNone: w => w.addTab(tab),
        ifNone: () => {
          this.windows.push({ id: tab.windowId, tabs: [] })
          this.windows.find(w => w.id === tab.windowId).tabs.push(tab)
        }
      }
    )
  }


  async getTabGraph(): Promise<TabGraph> {
    const graph = new TabGraph()



    this.windows.forEach(w => w.tabs.forEach(tab => {
      Try(
        tab.info.openerTabId,
        {

          ifNotNone: async v => {
              graph.getNode(v).ifCanBeUnpacked(
              parentNode => {
                const node = parentNode
                const currentNode = new TabGraphNode({
                  children: [],
                  parents: [parentNode]
                }, tab)
                node.relations = {
                  children: [...node.relations.children,],
                  parents: [...node.relations.parents]
                }

              }
            )
          },
          ifNone: () => graph[tab.info.id] = tab
        }
      )
    }))


    return graph
  }
  async findRelatedTabs(tabId: number, relation: TabRelation): Promise<ITab[]> {

    return this.getTab(tabId).try({
      ifNone: () => [],
      ifNotNone: v => v.getRelations(relation)
    })

  }
}
