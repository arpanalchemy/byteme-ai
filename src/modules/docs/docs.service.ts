import { Injectable } from "@nestjs/common";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import { marked } from "marked";
import * as matter from "gray-matter";
import hljs from "highlight.js";

@Injectable()
export class DocsService {
  private docsPath = join(process.cwd(), "docs");

  constructor() {
    // Configure marked for basic rendering
    marked.setOptions({
      gfm: true,
      breaks: true,
    });
  }

  getDocsList() {
    if (!existsSync(this.docsPath)) {
      return [];
    }

    const files = readdirSync(this.docsPath, { withFileTypes: true });
    return files
      .filter((file) => file.isFile() && file.name.endsWith(".md"))
      .map((file) => {
        const name = file.name.replace(".md", "");
        const displayName = this.getDisplayName(name);
        return {
          name,
          displayName,
          path: file.name,
        };
      })
      .sort((a, b) => {
        // Sort by number prefix if present
        const aNum = parseInt(a.name.split("_")[0]) || 999;
        const bNum = parseInt(b.name.split("_")[0]) || 999;
        return aNum - bNum;
      });
  }

  getDocContent(filename: string) {
    const filePath = join(this.docsPath, `${filename}.md`);

    if (!existsSync(filePath)) {
      throw new Error("Document not found");
    }

    const content = readFileSync(filePath, "utf-8");
    const { data: frontMatter, content: markdown } = matter(content);
    const html = marked(markdown);

    return {
      frontMatter,
      content: html,
      filename,
      displayName: this.getDisplayName(filename),
    };
  }

  private getDisplayName(filename: string): string {
    // Convert filename to display name
    const nameMap: { [key: string]: string } = {
      README: "Documentation Overview",
      "01_PROJECT_TECH_STACK": "Project Tech Stack",
      "02_DETAILED_PROJECT_WORKFLOW": "Detailed Project Workflow",
      "03_MODULAR_ARCHITECTURE_OVERVIEW": "Modular Architecture Overview",
      "04_CORE_COMPONENTS_DEEP_DIVE": "Core Components Deep Dive",
      "05_AI_AND_EXTERNAL_SERVICES_INTEGRATION":
        "AI and External Services Integration",
      "06_CURSOR_PROMPTS_AND_SETUP_GUIDE": "Cursor Prompts and Setup Guide",
    };

    return (
      nameMap[filename] ||
      filename.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    );
  }
}
