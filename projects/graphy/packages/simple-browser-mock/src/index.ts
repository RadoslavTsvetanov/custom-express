interface TabsAPI {
    tabs: {
        onActivated: { addListener(fn: (info: { tabId: number }) => void): void };
        onUpdated: {
            addListener(
                fn: (
                    tabId: number,
                    changeInfo: { status?: string },
                    tab: browser.tabs.Tab
                ) => void
            ): void;
        };
        onRemoved: { addListener(fn: (tabId: number) => void): void };
        onStartup: { addListener(fn: () => void): void };
        get(tabId: number): Promise<browser.tabs.Tab>;
        query(query: Record<string, unknown>): Promise<browser.tabs.Tab[]>;
    };
    runtime: {
        onInstalled: { addListener(fn: () => void): void };
        onStartup: { addListener(fn: () => void): void };
    };
}

type TabListener = (info: any) => void;
type TabUpdatedListener = (tabId: number, changeInfo: any, tab: browser.tabs.Tab) => void;
export const createTab = (id: number, url = 'https://example.com'): browser.tabs.Tab => ({
    id,
    url,
    active: true,
    discarded: false,
    favIconUrl: '',
    height: 800,
    width: 1200,
    incognito: false,
    index: 0,
    pinned: false,
    highlighted: false,
    status: 'complete',
    title: `Tab ${id}`,
    windowId: 1,
  });
export class FakeBrowser implements TabsAPI {

    public mockTabs: browser.tabs.Tab[] = [];

    private activatedListeners: TabListener[] = [];
    private updatedListeners: TabUpdatedListener[] = [];
    private removedListeners: TabListener[] = [];
    private startupListeners: (() => void)[] = [];
    utilities = {
        openTab: (tabInfo: browser.tabs.Tab, openerTabId: browser.tabs.Tab["id"]) => {
            this.mockTabs.push({
                ...tabInfo,
                openerTabId
            })
        }
    }
    tabs = {
        onActivated: {
            addListener: (fn: TabListener) => this.activatedListeners.push(fn),
        },
        onUpdated: {
            addListener: (fn: TabUpdatedListener) => this.updatedListeners.push(fn),
        },
        onRemoved: {
            addListener: (fn: TabListener) => this.removedListeners.push(fn),
        },
        onStartup: {
            addListener: (fn: () => void) => this.startupListeners.push(fn),
        },
        get: async (tabId: number) => {
            const tab = this.mockTabs.find((t) => t.id === tabId);
            if (!tab) throw new Error("Tab not found");
            return tab;
        },
        query: async () => [...this.mockTabs],
    };

    runtime = {
        onInstalled: {
            addListener: (_fn: () => void) => { },
        },
        onStartup: {
            addListener: (fn: () => void) => this.startupListeners.push(fn),
        },
    };

    // Trigger methods for testing
    triggerActivated(tabId: number) {
        this.activatedListeners.forEach((fn) => fn({ tabId }));
    }

    triggerUpdated(tab: browser.tabs.Tab) {
        this.updatedListeners.forEach((fn) =>
            fn(tab.id!, { status: "complete" }, tab)
        );
    }

    triggerRemoved(tabId: number) {
        this.removedListeners.forEach((fn) => fn(tabId));
    }

    triggerStartup() {
        this.startupListeners.forEach((fn) => fn());
    }
}