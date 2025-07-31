import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Drive & Earn - AI-Powered Sustainable Transportation Platform</title>
  
  <!-- SEO Meta Tags -->
  <meta name="description" content="Drive & Earn - A revolutionary AI-powered platform that rewards eco-friendly driving practices with VeChain-based tokens. Track your carbon savings and earn rewards for sustainable transportation.">
  <meta name="keywords" content="sustainable transportation, blockchain rewards, VeChain, AI OCR, carbon tracking, electric vehicles, green driving, token rewards">
  <meta name="author" content="Drive & Earn Platform">
  <meta name="robots" content="index, follow">
  
  <!-- Open Graph Meta Tags -->
  <meta property="og:title" content="Drive & Earn - AI-Powered Sustainable Transportation Platform">
  <meta property="og:description" content="Reward eco-friendly driving with blockchain tokens. AI-powered odometer reading, carbon tracking, and VeChain-based rewards.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://byteme-ai.alchemytech.in">
  <meta property="og:image" content="https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?q=80&w=1200&h=630&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D">
  <meta property="og:site_name" content="Drive & Earn Platform">
  
  <!-- Twitter Card Meta Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Drive & Earn - AI-Powered Sustainable Transportation Platform">
  <meta name="twitter:description" content="Reward eco-friendly driving with blockchain tokens. AI-powered odometer reading and carbon tracking.">
  <meta name="twitter:image" content="https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?q=80&w=1200&h=630&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D">
  
  <!-- Theme Color -->
  <meta name="theme-color" content="#667eea">
  <meta name="msapplication-TileColor" content="#667eea">
  
  <!-- Bootstrap CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
  
  <!-- Custom CSS -->
  <style>
    :root {
      --primary-color: #667eea;
      --secondary-color: #764ba2;
      --accent-color: #f093fb;
      --success-color: #4facfe;
      --warning-color: #43e97b;
      --text-dark: #2d3748;
      --text-light: #718096;
      --bg-light: #f7fafc;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: var(--text-dark);
      background: var(--bg-light);
    }
    
    .hero-section {
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
      color: white;
      padding: 80px 0;
      position: relative;
      overflow: hidden;
    }
    
    .hero-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?q=80&w=1920&h=1080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D') center/cover;
      opacity: 0.1;
      z-index: 1;
    }
    
    .hero-content {
      position: relative;
      z-index: 2;
    }
    
    .hero-title {
      font-size: 3.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    
    .hero-subtitle {
      font-size: 1.3rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }
    
    .feature-card {
      background: white;
      border-radius: 15px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      border: none;
    }
    
    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    }
    
    .feature-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .stats-section {
      background: white;
      padding: 4rem 0;
    }
    
    .stat-card {
      text-align: center;
      padding: 2rem;
    }
    
    .stat-number {
      font-size: 3rem;
      font-weight: 700;
      color: var(--primary-color);
      margin-bottom: 0.5rem;
    }
    
    .stat-label {
      font-size: 1.1rem;
      color: var(--text-light);
      font-weight: 500;
    }
    
    .tech-stack {
      background: var(--bg-light);
      padding: 4rem 0;
    }
    
    .tech-item {
      background: white;
      border-radius: 10px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      box-shadow: 0 5px 15px rgba(0,0,0,0.08);
      transition: transform 0.2s ease;
    }
    
    .tech-item:hover {
      transform: translateY(-2px);
    }
    
    .btn-custom {
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      border: none;
      color: white;
      padding: 12px 30px;
      border-radius: 25px;
      font-weight: 600;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-block;
    }
    
    .btn-custom:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
      color: white;
    }
    
    .btn-outline-custom {
      background: transparent;
      border: 2px solid var(--primary-color);
      color: var(--primary-color);
      padding: 12px 30px;
      border-radius: 25px;
      font-weight: 600;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-block;
    }
    
    .btn-outline-custom:hover {
      background: var(--primary-color);
      color: white;
      transform: translateY(-2px);
    }
    
    .preview-image {
      border-radius: 15px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
      transition: transform 0.3s ease;
    }
    
    .preview-image:hover {
      transform: scale(1.02);
    }
    
    .section-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      text-align: center;
    }
    
    .section-subtitle {
      font-size: 1.2rem;
      color: var(--text-light);
      text-align: center;
      margin-bottom: 3rem;
    }
    
    .navbar-custom {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      box-shadow: 0 2px 20px rgba(0,0,0,0.1);
    }
    
    .footer {
      background: var(--text-dark);
      color: white;
      padding: 3rem 0 1rem;
    }
    
    @media (max-width: 768px) {
      .hero-title {
        font-size: 2.5rem;
      }
      
      .hero-subtitle {
        font-size: 1.1rem;
      }
      
      .section-title {
        font-size: 2rem;
      }
    }
  </style>
</head>
<body>
  <!-- Navigation -->
  <nav class="navbar navbar-expand-lg navbar-custom fixed-top">
    <div class="container">
      <a class="navbar-brand fw-bold" href="#">
        <i class="fas fa-leaf text-success me-2"></i>
        Drive & Earn
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <a class="nav-link" href="#features">Features</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#tech">Technology</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/docs">Documentation</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/api">API</a>
          </li>
          <li class="nav-item">
            <a class="btn btn-custom ms-2" href="/docs">Get Started</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <!-- Hero Section -->
  <section class="hero-section">
    <div class="container">
      <div class="row align-items-center">
        <div class="col-lg-6 hero-content">
          <h1 class="hero-title">Drive & Earn</h1>
          <p class="hero-subtitle">Revolutionary AI-powered platform that rewards eco-friendly driving practices with VeChain-based tokens. Track your carbon savings and earn rewards for sustainable transportation.</p>
          <div class="d-flex flex-wrap gap-3">
            <a href="/docs" class="btn-custom">
              <i class="fas fa-rocket me-2"></i>Get Started
            </a>
            <a href="/api" class="btn-outline-custom">
              <i class="fas fa-code me-2"></i>View API
            </a>
          </div>
        </div>
        <div class="col-lg-6">
          <img src="https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?q=80&w=600&h=400&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
               alt="Electric Vehicle Dashboard" 
               class="img-fluid preview-image">
        </div>
      </div>
    </div>
  </section>

  <!-- Stats Section -->
  <section class="stats-section">
    <div class="container">
      <div class="row">
        <div class="col-md-3 col-6">
          <div class="stat-card">
            <div class="stat-number">10K+</div>
            <div class="stat-label">Active Users</div>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="stat-card">
            <div class="stat-number">50K+</div>
            <div class="stat-label">Odometer Uploads</div>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="stat-card">
            <div class="stat-number">100K+</div>
            <div class="stat-label">B3TR Tokens Distributed</div>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="stat-card">
            <div class="stat-number">500+</div>
            <div class="stat-label">Tons CO2 Saved</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section id="features" class="py-5">
    <div class="container">
      <h2 class="section-title">🚀 Key Features</h2>
      <p class="section-subtitle">Discover how our platform revolutionizes sustainable transportation</p>
      
      <div class="row">
        <div class="col-lg-4">
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-brain"></i>
            </div>
            <h4>AI-Powered OCR</h4>
            <p>Advanced image recognition technology that automatically reads odometer readings from photos with high accuracy using OpenAI GPT-4 Vision and AWS Textract.</p>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-link"></i>
            </div>
            <h4>Blockchain Integration</h4>
            <p>Seamless VeChain blockchain integration for secure, transparent token distribution. Earn B3TR tokens for your sustainable driving practices.</p>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-leaf"></i>
            </div>
            <h4>Carbon Tracking</h4>
            <p>Real-time calculation of carbon savings based on your driving distance. Track your environmental impact and contribute to a greener future.</p>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-trophy"></i>
            </div>
            <h4>Gamification</h4>
            <p>Earn badges, compete on leaderboards, and participate in challenges. Make sustainable driving fun and rewarding with our gamified experience.</p>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-mobile-alt"></i>
            </div>
            <h4>Mobile & Web</h4>
            <p>Access the platform from anywhere with our responsive web application and mobile app. Upload odometer readings on the go.</p>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <h4>Analytics Dashboard</h4>
            <p>Comprehensive analytics and insights into your driving patterns, carbon savings, and token earnings. Make data-driven decisions.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Technology Stack Section -->
  <section id="tech" class="tech-stack">
    <div class="container">
      <h2 class="section-title">🛠️ Technology Stack</h2>
      <p class="section-subtitle">Built with cutting-edge technologies for maximum performance and scalability</p>
      
      <div class="row">
        <div class="col-lg-3 col-md-6">
          <div class="tech-item">
            <h5><i class="fab fa-node-js text-success me-2"></i>Backend</h5>
            <p>NestJS, TypeScript, PostgreSQL, Redis</p>
          </div>
        </div>
        <div class="col-lg-3 col-md-6">
          <div class="tech-item">
            <h5><i class="fab fa-react text-info me-2"></i>Frontend</h5>
            <p>Next.js, React, Tailwind CSS, Redux</p>
          </div>
        </div>
        <div class="col-lg-3 col-md-6">
          <div class="tech-item">
            <h5><i class="fas fa-robot text-warning me-2"></i>AI/ML</h5>
            <p>OpenAI GPT-4, AWS Textract, TensorFlow</p>
          </div>
        </div>
        <div class="col-lg-3 col-md-6">
          <div class="tech-item">
            <h5><i class="fas fa-link text-primary me-2"></i>Blockchain</h5>
            <p>VeChain, Thor DevKit, Smart Contracts</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Preview Images Section -->
  <section class="py-5">
    <div class="container">
      <h2 class="section-title">📱 Platform Preview</h2>
      <p class="section-subtitle">See our platform in action</p>
      
      <div class="row g-4">
                 <div class="col-lg-6">
           <img src="https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?q=80&w=600&h=400&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt="EV Dashboard Interface" 
                class="img-fluid preview-image">
           <h5 class="mt-3 text-center">EV Analytics Dashboard</h5>
         </div>
         <div class="col-lg-6">
           <img src="https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?q=80&w=600&h=400&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt="Electric Vehicle Interface" 
                class="img-fluid preview-image">
           <h5 class="mt-3 text-center">Electric Vehicle Integration</h5>
         </div>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="py-5" style="background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%); color: white;">
    <div class="container text-center">
      <h2 class="section-title">Ready to Start Earning?</h2>
      <p class="section-subtitle">Join thousands of users already earning rewards for sustainable driving</p>
      <div class="d-flex flex-wrap justify-content-center gap-3">
        <a href="/docs" class="btn-custom">
          <i class="fas fa-book me-2"></i>View Documentation
        </a>
        <a href="/api" class="btn-outline-custom">
          <i class="fas fa-code me-2"></i>Explore API
        </a>
        <a href="/docs/healthcheck" class="btn-outline-custom">
          <i class="fas fa-heartbeat me-2"></i>System Status
        </a>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="footer">
    <div class="container">
      <div class="row">
        <div class="col-lg-4">
          <h5><i class="fas fa-leaf text-success me-2"></i>Drive & Earn</h5>
          <p>Revolutionizing sustainable transportation through blockchain technology and AI-powered solutions.</p>
        </div>
        <div class="col-lg-4">
          <h5>Quick Links</h5>
          <ul class="list-unstyled">
            <li><a href="/docs" class="text-light text-decoration-none">Documentation</a></li>
            <li><a href="/api" class="text-light text-decoration-none">API Reference</a></li>
            <li><a href="/docs/healthcheck" class="text-light text-decoration-none">System Status</a></li>
          </ul>
        </div>
        <div class="col-lg-4">
          <h5>Technology</h5>
          <ul class="list-unstyled">
            <li><span class="text-light">NestJS Backend</span></li>
            <li><span class="text-light">VeChain Blockchain</span></li>
            <li><span class="text-light">AI-Powered OCR</span></li>
          </ul>
        </div>
      </div>
      <hr class="my-4">
      <div class="text-center">
        <p class="mb-0">&copy; 2024 Drive & Earn Platform. All rights reserved.</p>
      </div>
    </div>
  </footer>

  <!-- Bootstrap JS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  
  <!-- Smooth Scrolling -->
  <script>
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
          behavior: 'smooth'
        });
      });
    });
  </script>
</body>
</html>
    `;
  }
}
