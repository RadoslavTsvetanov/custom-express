import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FakeBrowser } from '..';

const createTab = (id: number, url = 'https://example.com'): browser.tabs.Tab => ({
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

describe('FakeBrowser', () => {
  let browser: FakeBrowser;

  beforeEach(() => {
    browser = new FakeBrowser();
    browser.mockTabs = [
      createTab(1),
      createTab(2, 'https://vitejs.dev'),
    ];
  });

  it('should trigger onActivated listeners', () => {
    const fn = vi.fn();
    browser.tabs.onActivated.addListener(fn);

    browser.triggerActivated(2);
    expect(fn).toHaveBeenCalledWith({ tabId: 2 });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should trigger onUpdated listeners', () => {
    const fn = vi.fn();
    browser.tabs.onUpdated.addListener(fn);

    const tab = createTab(1);
    browser.triggerUpdated(tab);

    expect(fn).toHaveBeenCalledWith(1, { status: 'complete' }, tab);
  });

  it('should trigger onRemoved listeners', () => {
    const fn = vi.fn();
    browser.tabs.onRemoved.addListener(fn);

    browser.triggerRemoved(1);
    expect(fn).toHaveBeenCalledWith(1);
  });

  it('should trigger onStartup listeners', () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    browser.tabs.onStartup.addListener(fn1);
    browser.runtime.onStartup.addListener(fn2);

    browser.triggerStartup();

    expect(fn1).toHaveBeenCalled();
    expect(fn2).toHaveBeenCalled();
  });

  it('should get a tab by id', async () => {
    const tab = await browser.tabs.get(2);
    expect(tab.url).toBe('https://vitejs.dev');
  });

  it('should throw when getting a non-existent tab', async () => {
    await expect(browser.tabs.get(999)).rejects.toThrow('Tab not found');
  });

  it('should query all tabs', async () => {
    const tabs = await browser.tabs.query({});
    expect(tabs).toHaveLength(2);
    expect(tabs[1].url).toBe('https://vitejs.dev');
  });

  it('should do nothing on runtime.onInstalled listener', () => {
    const fn = vi.fn();
    browser.runtime.onInstalled.addListener(fn);
    expect(fn).not.toHaveBeenCalled(); // it's a no-op by design
  });
 
  
  it("should correctly return that a tab is a child of another tab", () => {
    browser.utilities.openTab(createTab(3), 2)
    expect(browser.mockTabs[browser.mockTabs.length - 1].openerTabId).toBe(2)
  })

});
