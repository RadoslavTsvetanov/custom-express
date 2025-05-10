// Firefox-compatible background script for Plasmo extension
// Handles: extension load, URL changes, and new tab events

import { Log } from "~custom-log"
console.log = Log
// Helper function to log the current tab URL
const logCurrentTab = async () => {
  try {
    // Get the current active tab
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true
    })
    if (tab && tab.url) {
      Log(`Current tab URL: ${tab.url}`)
      // Here you can do whatever processing you need with the URL
      // For example, store it in extension storage:
      await browser.storage.local.set({ lastVisitedUrl: tab.url })
    }
  } catch (error) {
    console.error("Error getting current tab:", error)
  }
}

// 1. EXTENSION LOAD HANDLER
// This runs when the extension is installed or the browser starts up
browser.runtime.onInstalled.addListener(async (details) => {
  console.log("Extension installed/updated:" + details.reason)
  await logCurrentTab()
})

// Also run when Firefox starts
browser.runtime.onStartup.addListener(async () => {
  console.log("Browser started")
  await logCurrentTab()
})

// 2. URL CHANGE HANDLER
// Using webNavigation API to detect URL changes
browser.webNavigation.onCommitted.addListener(async (details) => {
  // Filter out iframe navigations and focus on main frame
  if (details.frameId === 0) {
    console.log(`URL changed to: ${details.url} in tab ${details.tabId}`)

    // Get full tab information
    const tab = await browser.tabs.get(details.tabId)

    // Process the URL change
    // Example: Store the URL with timestamp
    await browser.storage.local.set({
      urlChange: {
        url: details.url,
        tabId: details.tabId,
        timestamp: Date.now()
      }
    })
  }
})

// 3. NEW TAB HANDLER
// This event fires when a new tab is created
browser.tabs.onCreated.addListener(async (tab) => {
  console.log(`New tab created: ${tab.id}`)

  // For new tabs, the URL might initially be about:blank or about:newtab
  // We can log the initial state
  console.log(`Initial new tab URL: ${tab.url || "unknown"}`)

  // Store information about the new tab
  await browser.storage.local.set({
    newTabCreated: {
      tabId: tab.id,
      initialUrl: tab.url,
      timestamp: Date.now()
    }
  })

  // You may want to wait for the tab to fully load if you need its final URL
  // This can be handled by the URL change handler above
})

// Optional: Keep the service worker alive with periodic alarms
// This helps maintain long-running background operation
browser.alarms.create("keepServiceWorkerAlive", { periodInMinutes: 1 })
browser.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "keepServiceWorkerAlive") {
    console.log("Background service worker ping")
    // You could perform periodic checks here
  }
})

// Export an empty object to make this a module
export {}
