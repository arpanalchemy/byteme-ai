import { Controller, Get, Param, Res, HttpStatus } from "@nestjs/common";
import { Response } from "express";
import { join } from "path";
import { existsSync } from "fs";
import { DocsService } from "./docs.service";

@Controller("docs")
export class DocsController {
  constructor(private readonly docsService: DocsService) {}

  @Get()
  async getDocsIndex(@Res() res: Response) {
    try {
      const docs = this.docsService.getDocsList();

      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Drive & Earn - Documentation Hub</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: #f5f5f5; 
              line-height: 1.6;
            }
            .container { 
              max-width: 1200px; 
              margin: 0 auto; 
              background: white; 
              border-radius: 8px; 
              box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
            }
            .header { 
              padding: 30px; 
              border-bottom: 1px solid #eee; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border-radius: 8px 8px 0 0;
            }
            .header h1 { 
              margin: 0; 
              font-size: 2.5em;
              font-weight: 300;
            }
            .header p {
              margin: 10px 0 0 0;
              opacity: 0.9;
              font-size: 1.1em;
            }
            .nav { 
              padding: 20px 30px; 
              background: #f8f9fa; 
              border-bottom: 1px solid #eee; 
            }
            .nav a { 
              display: inline-block; 
              margin-right: 8px; 
              margin-bottom: 8px;
              color: #007bff; 
              text-decoration: none; 
              padding: 10px 16px;
              border-radius: 6px;
              transition: all 0.2s ease;
              border: 1px solid #e9ecef;
              background-color: white;
              font-weight: 500;
            }
            .nav a:hover { 
              background-color: #007bff;
              color: white;
              text-decoration: none;
              border-color: #007bff;
              transform: translateY(-1px);
              box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
            }
            .content { 
              padding: 30px; 
            }
            .doc-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: 20px;
              margin: 30px 0;
            }
            .doc-card {
              background: #f8f9fa;
              border: 1px solid #e9ecef;
              border-radius: 8px;
              padding: 20px;
              transition: transform 0.2s, box-shadow 0.2s;
            }
            .doc-card:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .doc-card h3 {
              margin: 0 0 10px 0;
              color: #333;
            }
            .doc-card p {
              margin: 0;
              color: #666;
            }
            .doc-card a {
              color: #007bff;
              text-decoration: none;
              font-weight: 500;
            }
            .doc-card a:hover {
              text-decoration: underline;
            }
            .feature-list {
              background: #e8f4fd;
              border-left: 4px solid #007bff;
              padding: 20px;
              margin: 20px 0;
              border-radius: 0 4px 4px 0;
            }
            .feature-list h3 {
              margin: 0 0 15px 0;
              color: #0056b3;
            }
            .feature-list ul {
              margin: 0;
              padding-left: 20px;
            }
            .feature-list li {
              margin: 8px 0;
            }
            .quick-links {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .quick-links h3 {
              margin: 0 0 15px 0;
              color: #333;
            }
            .quick-links a {
              display: inline-block;
              margin: 5px 10px 5px 0;
              padding: 8px 16px;
              background: #007bff;
              color: white;
              text-decoration: none;
              border-radius: 4px;
              transition: background-color 0.2s;
            }
            .quick-links a:hover {
              background: #0056b3;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Drive & Earn Platform</h1>
              <p>Complete documentation hub for the sustainability-focused blockchain platform</p>
            </div>
            <div class="nav">
              <a href="/api">📚 API Docs</a>
              <a href="/docs/healthcheck">💚 Health Check</a>
              <a href="/docs/01_PROJECT_TECH_STACK">🏗️ Tech Stack</a>
              <a href="/docs/03_MODULAR_ARCHITECTURE_OVERVIEW">🏛️ Architecture</a>
              <a href="/docs/02_DETAILED_PROJECT_WORKFLOW">🔄 Workflows</a>
              <a href="/docs/04_CORE_COMPONENTS_DEEP_DIVE">🧩 Components</a>
              <a href="/docs/05_AI_AND_EXTERNAL_SERVICES_INTEGRATION">🔗 Integrations</a>
              <a href="/docs/06_CURSOR_PROMPTS_AND_SETUP_GUIDE">📝 Setup Guide</a>
              <a href="/docs/email-samples">📧 Email Samples</a>
            </div>
            <div class="content">
              <h2>Welcome to Drive & Earn Documentation</h2>
              <p>This platform combines blockchain technology with sustainability initiatives to reward eco-friendly driving practices.</p>
              
              <div class="feature-list">
                <h3>🚀 Key Features</h3>
                <ul>
                  <li><strong>Blockchain Integration:</strong> VeChain-based token rewards</li>
                  <li><strong>AI-Powered OCR:</strong> Automated odometer reading</li>
                  <li><strong>Carbon Tracking:</strong> Real-time CO2 savings calculation</li>
                  <li><strong>Gamification:</strong> Challenges, badges, and leaderboards</li>
                  <li><strong>Smart Contracts:</strong> Automated reward distribution</li>
                </ul>
              </div>

              <h2>📖 Available Documentation</h2>
              <div class="doc-grid">
                ${docs
                  .map(
                    (doc) => `
                  <div class="doc-card">
                    <h3>📄 ${doc.displayName}</h3>
                    <p>Click to view the complete documentation for this section.</p>
                    <a href="/docs/${doc.name}">View Documentation →</a>
                  </div>
                `
                  )
                  .join("")}
              </div>

              <div class="quick-links">
                <h3>🔗 Quick Links</h3>
                <a href="/api">API Documentation</a>
                <a href="/docs/healthcheck">Health Check</a>
                ${docs
                  .slice(0, 3)
                  .map(
                    (doc) => `
                  <a href="/docs/${doc.name}">${doc.displayName}</a>
                `
                  )
                  .join("")}
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      res.send(html);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: "Error loading documentation",
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @Get("healthcheck")
  async getHealthCheck(@Res() res: Response) {
    try {
      // Use built-in fetch API instead of node-fetch
      const healthResponse = await fetch("http://localhost:3000/healthcheck");
      const healthData = (await healthResponse.json()) as {
        status: string;
        statusCode: number;
        timestamp: string;
        uptime: number;
        environment: string;
        version: string;
        port: string;
      };

      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Health Check - Drive & Earn</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: #f5f5f5; 
              line-height: 1.6;
            }
            .container { 
              max-width: 1200px; 
              margin: 0 auto; 
              background: white; 
              border-radius: 8px; 
              box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
            }
            .header { 
              padding: 20px 30px; 
              border-bottom: 1px solid #eee; 
              background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
              color: white;
              border-radius: 8px 8px 0 0;
            }
            .header h1 { 
              margin: 0; 
              font-size: 2em;
              font-weight: 300;
            }
            .nav { 
              padding: 20px 30px; 
              background: #f8f9fa; 
              border-bottom: 1px solid #eee; 
            }
            .nav a { 
              display: inline-block; 
              margin-right: 8px; 
              margin-bottom: 8px;
              color: #007bff; 
              text-decoration: none; 
              padding: 10px 16px;
              border-radius: 6px;
              transition: all 0.2s ease;
              border: 1px solid #e9ecef;
              background-color: white;
              font-weight: 500;
            }
            .nav a:hover { 
              background-color: #007bff;
              color: white;
              text-decoration: none;
              border-color: #007bff;
              transform: translateY(-1px);
              box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
            }
            .content { 
              padding: 30px; 
              line-height: 1.6; 
            }
            .status-card {
              background: ${healthData.status === "healthy" ? "#d4edda" : "#f8d7da"};
              border: 1px solid ${healthData.status === "healthy" ? "#c3e6cb" : "#f5c6cb"};
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              text-align: center;
            }
            .status-indicator {
              display: inline-block;
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background: ${healthData.status === "healthy" ? "#28a745" : "#dc3545"};
              margin-right: 10px;
              animation: pulse 2s infinite;
            }
            @keyframes pulse {
              0% { opacity: 1; }
              50% { opacity: 0.5; }
              100% { opacity: 1; }
            }
            .status-text {
              font-size: 1.2em;
              font-weight: 600;
              color: ${healthData.status === "healthy" ? "#155724" : "#721c24"};
              text-transform: uppercase;
            }
            .metrics-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px;
              margin: 30px 0;
            }
            .metric-card {
              background: #f8f9fa;
              border: 1px solid #e9ecef;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
            }
            .metric-value {
              font-size: 2em;
              font-weight: 600;
              color: #007bff;
              margin: 10px 0;
            }
            .metric-label {
              color: #666;
              font-size: 0.9em;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .breadcrumb {
              padding: 10px 30px;
              background: #f8f9fa;
              border-bottom: 1px solid #e9ecef;
              font-size: 14px;
            }
            .breadcrumb a {
              color: #007bff;
              text-decoration: none;
            }
            .breadcrumb a:hover {
              text-decoration: underline;
            }
            .uptime-display {
              font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
              background: #f1f3f4;
              padding: 10px;
              border-radius: 4px;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💚 System Health Check</h1>
            </div>
            <div class="breadcrumb">
            <a href="/docs" class="back-link">← Back to Documentation</a>
            / Health Check
            </div>
            <div class="nav">
              <a href="/api">📚 API Docs</a>
              <a href="/docs/healthcheck">💚 Health Check</a>
              <a href="/docs/01_PROJECT_TECH_STACK">🏗️ Tech Stack</a>
              <a href="/docs/03_MODULAR_ARCHITECTURE_OVERVIEW">🏛️ Architecture</a>
              <a href="/docs/02_DETAILED_PROJECT_WORKFLOW">🔄 Workflows</a>
              <a href="/docs/04_CORE_COMPONENTS_DEEP_DIVE">🧩 Components</a>
              <a href="/docs/05_AI_AND_EXTERNAL_SERVICES_INTEGRATION">🔗 Integrations</a>
              <a href="/docs/06_CURSOR_PROMPTS_AND_SETUP_GUIDE">📝 Setup Guide</a>
              <a href="/docs/email-samples">📧 Email Samples</a>
            </div>
            <div class="content">
              <div class="status-card">
                <span class="status-indicator"></span>
                <span class="status-text">${healthData.status}</span>
                <p>System Status: ${healthData.statusCode === 200 ? "All systems operational" : "Issues detected"}</p>
              </div>

              <h2>📊 System Metrics</h2>
              <div class="metrics-grid">
                <div class="metric-card">
                  <div class="metric-value">${healthData.statusCode}</div>
                  <div class="metric-label">HTTP Status</div>
                </div>
                <div class="metric-card">
                  <div class="metric-value">${healthData.environment}</div>
                  <div class="metric-label">Environment</div>
                </div>
                <div class="metric-card">
                  <div class="metric-value">${healthData.version}</div>
                  <div class="metric-label">Version</div>
                </div>
                <div class="metric-card">
                  <div class="metric-value">${healthData.port}</div>
                  <div class="metric-label">Port</div>
                </div>
              </div>

              <h2>⏱️ System Uptime</h2>
              <div class="uptime-display">
                ${Math.floor(healthData.uptime)} seconds (${(healthData.uptime / 60).toFixed(1)} minutes)
              </div>

              <h2>🕐 Last Check</h2>
              <p>Timestamp: ${new Date(healthData.timestamp).toLocaleString()}</p>

              <h2>🔗 Quick Actions</h2>
              <div style="margin: 20px 0;">
                <a href="/api" style="display: inline-block; margin: 5px 10px 5px 0; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 4px;">📚 View API Docs</a>
                <a href="/docs" style="display: inline-block; margin: 5px 10px 5px 0; padding: 10px 20px; background: #28a745; color: white; text-decoration: none; border-radius: 4px;">🏠 Documentation Hub</a>
                <button onclick="location.reload()" style="display: inline-block; margin: 5px 10px 5px 0; padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">🔄 Refresh Status</button>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      res.send(html);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: "Error fetching health check data",
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @Get("email-samples")
  async getEmailSamples(@Res() res: Response) {
    try {
      const emailSamples = this.docsService.getEmailSamples();

      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Drive & Earn - Email Samples</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: #f5f5f5; 
              line-height: 1.6;
            }
            .container { 
              max-width: 1200px; 
              margin: 0 auto; 
              background: white; 
              border-radius: 8px; 
              box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
            }
            .header { 
              padding: 30px; 
              border-bottom: 1px solid #eee; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border-radius: 8px 8px 0 0;
            }
            .header h1 { 
              margin: 0; 
              font-size: 2.5em;
              font-weight: 300;
            }
            .header p {
              margin: 10px 0 0 0;
              opacity: 0.9;
              font-size: 1.1em;
            }
            .content { 
              padding: 30px; 
            }
            .email-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
              gap: 30px;
              margin: 30px 0;
            }
            .email-card {
              background: #f8f9fa;
              border: 1px solid #e9ecef;
              border-radius: 8px;
              padding: 20px;
              transition: transform 0.2s, box-shadow 0.2s;
            }
            .email-card:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .email-card h3 {
              margin: 0 0 15px 0;
              color: #333;
              font-size: 1.3em;
            }
            .email-card img {
              width: 100%;
              height: auto;
              border-radius: 4px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .back-link {
              display: inline-block;
              margin-bottom: 20px;
              color: #007bff;
              text-decoration: none;
              font-weight: 500;
            }
            .back-link:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 Email Samples</h1>
              <p>Visual examples of email templates used in the Drive & Earn platform</p>
            </div>
            <div class="content">
              <a href="/docs" class="back-link">← Back to Documentation</a>
              
              <div class="email-grid">
                ${emailSamples
                  .map(
                    (sample) => `
                  <div class="email-card">
                    <h3>${sample.title}</h3>
                    <img src="/docs/email-samples/${sample.filename}" alt="${sample.title}" />
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      res.status(HttpStatus.OK).send(html);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: "Failed to get email samples",
        message: error.message,
      });
    }
  }

  @Get("email-samples/:filename")
  async getEmailSampleImage(
    @Param("filename") filename: string,
    @Res() res: Response
  ) {
    try {
      const filePath = join(process.cwd(), "media", filename);

      if (!existsSync(filePath)) {
        return res.status(HttpStatus.NOT_FOUND).json({
          error: "Email sample not found",
          message: `File ${filename} does not exist`,
        });
      }

      res.sendFile(filePath);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: "Failed to serve email sample",
        message: error.message,
      });
    }
  }

  @Get(":filename")
  async getDoc(@Param("filename") filename: string, @Res() res: Response) {
    // Prevent reserved/static pages from being handled as markdown docs
    const reserved = ["email-samples", "healthcheck"];
    if (reserved.includes(filename)) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: "Document not found",
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    try {
      const doc = await this.docsService.getDocContent(filename);

      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${doc.displayName} - Drive & Earn</title>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github.min.css">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: #f5f5f5; 
              line-height: 1.6;
            }
            .container { 
              max-width: 1200px; 
              margin: 0 auto; 
              background: white; 
              border-radius: 8px; 
              box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
            }
            .header { 
              padding: 20px 30px; 
              border-bottom: 1px solid #eee; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border-radius: 8px 8px 0 0;
            }
            .header h1 { 
              margin: 0; 
              font-size: 2em;
              font-weight: 300;
            }
            .nav { 
              padding: 20px 30px; 
              background: #f8f9fa; 
              border-bottom: 1px solid #eee; 
            }
            .nav a { 
              display: inline-block; 
              margin-right: 8px; 
              margin-bottom: 8px;
              color: #007bff; 
              text-decoration: none; 
              padding: 10px 16px;
              border-radius: 6px;
              transition: all 0.2s ease;
              border: 1px solid #e9ecef;
              background-color: white;
              font-weight: 500;
            }
            .nav a:hover { 
              background-color: #007bff;
              color: white;
              text-decoration: none;
              border-color: #007bff;
              transform: translateY(-1px);
              box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
            }
            .content { 
              padding: 30px; 
              line-height: 1.6; 
            }
            .content h1, .content h2, .content h3 { 
              color: #333; 
              margin-top: 30px;
              margin-bottom: 15px;
            }
            .content h1 {
              border-bottom: 2px solid #007bff;
              padding-bottom: 10px;
            }
            .content h2 {
              border-bottom: 1px solid #e9ecef;
              padding-bottom: 8px;
            }
            .content code { 
              background: #f1f3f4; 
              padding: 2px 4px; 
              border-radius: 3px; 
              font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
            }
            .content pre { 
              background: #f8f9fa; 
              padding: 15px; 
              border-radius: 5px; 
              overflow-x: auto; 
              border: 1px solid #e9ecef;
            }
            .content pre code { 
              background: none; 
              padding: 0; 
            }
            .content table { 
              border-collapse: collapse; 
              width: 100%; 
              margin: 20px 0; 
            }
            .content th, .content td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left; 
            }
            .content th { 
              background-color: #f8f9fa; 
              font-weight: 600;
            }
            .content p {
              margin: 15px 0;
            }
            .content ul, .content ol {
              margin: 15px 0;
              padding-left: 20px;
            }
            .content li {
              margin: 8px 0;
            }
            .content blockquote {
              border-left: 4px solid #007bff;
              margin: 20px 0;
              padding: 10px 20px;
              background: #f8f9fa;
              font-style: italic;
            }
            .breadcrumb {
              padding: 10px 30px;
              background: #f8f9fa;
              border-bottom: 1px solid #e9ecef;
              font-size: 14px;
            }
            .breadcrumb a {
              color: #007bff;
              text-decoration: none;
            }
            .breadcrumb a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${doc.displayName}</h1>
            </div>
            <div class="breadcrumb">
            <a href="/docs" class="back-link">← Back to Documentation</a>
            / ${doc.displayName}
            </div>
            <div class="nav">
              <a href="/api">📚 API Docs</a>
              <a href="/docs/healthcheck">💚 Health Check</a>
              <a href="/docs/01_PROJECT_TECH_STACK">🏗️ Tech Stack</a>
              <a href="/docs/03_MODULAR_ARCHITECTURE_OVERVIEW">🏛️ Architecture</a>
              <a href="/docs/02_DETAILED_PROJECT_WORKFLOW">🔄 Workflows</a>
              <a href="/docs/04_CORE_COMPONENTS_DEEP_DIVE">🧩 Components</a>
              <a href="/docs/05_AI_AND_EXTERNAL_SERVICES_INTEGRATION">🔗 Integrations</a>
              <a href="/docs/06_CURSOR_PROMPTS_AND_SETUP_GUIDE">📝 Setup Guide</a>
              <a href="/docs/email-samples">📧 Email Samples</a>
            </div>
            <div class="content">
              ${doc.content}
            </div>
          </div>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js"></script>
          <script>hljs.highlightAll();</script>
        </body>
        </html>
      `;

      res.send(html);
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).json({
        message: "Document not found",
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
  }
}
