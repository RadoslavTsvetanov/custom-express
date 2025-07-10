export class Entry{
    constructor(public name: string, public url: string) {}
}

export class NetworkingManager {
    constructor() { }
    addEntry(Entry: Entry) {
        // Logic to add an entry
        console.log(`Entry ${Entry.name} added with URL: ${Entry.url}`);
    }

    removeEntry(Entry: Entry) {
        // Logic to remove an entry
        console.log(`Entry ${Entry.name} removed.`);
    }

    listEntries() {
        // Logic to list all entries
        console.log("Listing all entries...");
    }
}