import { describe, it, expect, vi, beforeEach } from 'vitest';

import  { EventHooker } from '../../src/eventHooker';
import { TabService } from '../../src/application/services/TabService';
import { createTab, FakeBrowser } from '@blazyts/simple-browser-mock';

describe("EventHooker integration - end-to-end graph test", () => {
  let browser: FakeBrowser;
  let hooker: EventHooker;
  let service: TabService;

  beforeEach(() => {
    browser = new FakeBrowser();
    service = new TabService();
    hooker = new EventHooker(browser, service);
    hooker.registerAllHooks();
  });

  it("should construct a correct tab graph with multiple levels and an unrelated tab", async () => {
    // Step 1: Create base tab (tab 1) with no opener
    const tab1 = createTab(1); // no `openerTabId`
    browser.mockTabs.push(tab1);
    browser.triggerStartup();

    // Step 2: Open two tabs from tab 1
    const tab2 = createTab(2);
    const tab3 = createTab(3);
    browser.utilities.openTab(tab2, 1);
    browser.utilities.openTab(tab3, 1);
    browser.triggerActivated(2);
    browser.triggerActivated(3);
    await new Promise((r) => setTimeout(r, 0));

    // Step 3: Open a tab from one of tab 1's children (tab 2)
    const tab4 = createTab(4);
    browser.utilities.openTab(tab4, 2);
    browser.triggerActivated(4);
    await new Promise((r) => setTimeout(r, 0));

    // Step 4: Open an unrelated tab (tab 5)
    const tab5 = createTab(5);
    browser.utilities.openTab(tab5);
    browser.triggerActivated(5);
    await new Promise((r) => setTimeout(r, 0));

    // Fetch the full graph rooted at tab 1
    const graph = await service.getTabGraph();

    // Validate structure
    const allTabIds = graph

  });
});
