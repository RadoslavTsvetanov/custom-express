import { createTab, FakeBrowser } from "@blazyts/simple-browser-mock";
import { beforeEach, expect } from "bun:test";
import { describe, it } from "node:test";
import  { TabService } from "~application/services/TabService";
import  { EventHooker } from "~eventHooker";

describe("EventHooker integration", () => {
    let browser: FakeBrowser;
    let hooker: EventHooker;
    let service: TabService;
  
    beforeEach(() => {
      browser = new FakeBrowser();
      service = new TabService();
      hooker = new EventHooker(browser, service);
      hooker.registerAllHooks();
    });
  
    it("should track tab on startup", async () => {
      browser.mockTabs.push(createTab(1));
      browser.triggerStartup();
  
      const graph = await service.getTabGraph(1);
      const allTabs = graph.windows.flatMap(w => [...w.tabs]);
      expect(allTabs.length).toBe(1);
    });
  
    it("should track tab activation correctly", async () => {
      browser.mockTabs.push(createTab(1));
      browser.triggerStartup();
  
      browser.utilities.openTab(createTab(2), 1);
      browser.triggerActivated(2);
      await new Promise((r) => setTimeout(r, 0));
  
      const graph = await service.getTabGraph(2);
      expect(graph.tabs.length).toBe(2);
    });
  
    it("should track tab updates correctly", async () => {
      browser.mockTabs.push(createTab(1));
      browser.utilities.openTab(createTab(2), 1);
      browser.triggerStartup();
      browser.triggerActivated(2);
      await new Promise((r) => setTimeout(r, 0));
  
      const updatedTab = {
        id: 2,
        windowId: 101,
        url: "https://google.bg",
        title: "Google BG",
        active: true,
        status: "complete",
      };
      browser.mockTabs[1] = updatedTab;
      browser.triggerUpdated(updatedTab);
      await new Promise((r) => setTimeout(r, 0));
  
      const graph = await service.getTabGraph(2);
      expect(graph.tabs.find((t) => t.id === 2)?.info.url).toBe("https://google.bg");
    });
  
    it("should remove closed tab from graph", async () => {
      browser.mockTabs.push(createTab(1), createTab(2));
      browser.triggerStartup();
      browser.triggerActivated(2);
      await new Promise((r) => setTimeout(r, 0));
  
      browser.triggerRemoved(1);
      await new Promise((r) => setTimeout(r, 0));
  
      const graph = await service.getTabGraph(2);
      expect(graph.tabs.some((t) => t.id === 1)).toBe(false);
    });
  });
  