if ((globalThis as any).File === undefined) {
  class NodeFile {
    name: string;
    lastModified: number;

    constructor(_bits: any[] = [], name = '', options: { lastModified?: number } = {}) {
      this.name = name;
      this.lastModified = options.lastModified ?? Date.now();
    }
  }

  (globalThis as any).File = NodeFile as any;
}

