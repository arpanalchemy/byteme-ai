import { Injectable } from "@nestjs/common";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import * as matter from "gray-matter";
import hljs from "highlight.js";
import * as MarkdownIt from "markdown-it";

@Injectable()
export class DocsService {
  private docsPath = join(process.cwd(), "docs");
  private md: MarkdownIt;

  constructor() {
    // Initialize markdown-it with options
    this.md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
      highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(str, { language: lang }).value;
          } catch (__) {}
        }
        return ""; // use external default escaping
      },
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

  async getDocContent(filename: string) {
    const filePath = join(this.docsPath, `${filename}.md`);

    if (!existsSync(filePath)) {
      throw new Error("Document not found");
    }

    const content = readFileSync(filePath, "utf-8");
    const { data: frontMatter, content: markdown } = matter(content);

    // Use markdown-it to render markdown to HTML
    const html = this.md.render(markdown);

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
      "07_BLOCKCHAIN_CONTRACT": "Blockchain Contract Documentation",
      "08_FRONTEND_SPECIFICATION": "Frontend Specification",
      "09_MOBILE_APP_DOCUMENTATION": "Mobile App Documentation",
    };

    return (
      nameMap[filename] ||
      filename.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    );
  }

  getEmailSamples() {
    const mediaPath = join(process.cwd(), "media");

    if (!existsSync(mediaPath)) {
      return [];
    }

    const files = readdirSync(mediaPath, { withFileTypes: true });
    return files
      .filter((file) => file.isFile() && file.name.endsWith(".png"))
      .map((file) => {
        const filename = file.name;
        const title = this.getEmailSampleTitle(filename);
        return {
          filename,
          title,
        };
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  private getEmailSampleTitle(filename: string): string {
    // Remove file extension and convert to title case
    return filename
      .replace(/\.[^/.]+$/, "") // Remove file extension
      .replace(/-/g, " ") // Replace hyphens with spaces
      .replace(/\b\w/g, (l) => l.toUpperCase()); // Convert to title case
  }
}
