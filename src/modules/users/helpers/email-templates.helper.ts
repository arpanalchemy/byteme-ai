import { ConfigService } from '@nestjs/config';

interface EmailTemplateProps {
  configService: ConfigService;
}

export class EmailTemplates {
  private static getBaseTemplate() {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>B3TR - EV Rewards</title>
          <style>
            /* Reset styles */
            body, p, h1, h2, h3, h4, h5, h6 {
              margin: 0;
              padding: 0;
            }
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333333;
              background-color: #f5f5f5;
            }
            /* Container styles */
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
              border-radius: 16px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            /* Header styles */
            .header {
              text-align: center;
              padding: 25px 0;
              background: linear-gradient(135deg, #48BB78 0%, #38A169 100%);
              border-radius: 12px 12px 0 0;
              margin: -20px -20px 20px -20px;
            }
            .logo {
              width: 140px;
              height: auto;
              margin-bottom: 15px;
              filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
            }
            .header-title {
              color: #ffffff;
              font-size: 28px;
              font-weight: bold;
              text-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            /* Content styles */
            .content {
              padding: 30px 25px;
              background-color: #ffffff;
              border-radius: 12px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            .title {
              color: #2C5282;
              font-size: 24px;
              margin-bottom: 20px;
              text-align: center;
            }
            .message {
              font-size: 16px;
              color: #4A5568;
              margin-bottom: 25px;
              line-height: 1.8;
            }
            /* Stats Card styles */
            .stats-container {
              display: flex;
              justify-content: space-around;
              margin: 25px 0;
              flex-wrap: wrap;
            }
            .stat-card {
              background: linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%);
              border-radius: 12px;
              padding: 20px;
              text-align: center;
              min-width: 140px;
              margin: 10px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            .stat-value {
              font-size: 24px;
              font-weight: bold;
              color: #2B6CB0;
              margin-bottom: 8px;
            }
            .stat-label {
              color: #718096;
              font-size: 14px;
            }
            /* OTP styles */
            .otp-container {
              text-align: center;
              margin: 30px 0;
              padding: 25px;
              background: linear-gradient(145deg, #EBF8FF 0%, #E6FFFA 100%);
              border-radius: 12px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            .otp-code {
              font-size: 36px;
              font-weight: bold;
              color: #2B6CB0;
              letter-spacing: 8px;
              margin: 15px 0;
              text-shadow: 0 1px 2px rgba(0,0,0,0.1);
            }
            /* Button styles */
            .button {
              display: inline-block;
              padding: 14px 28px;
              background: linear-gradient(135deg, #48BB78 0%, #38A169 100%);
              color: #ffffff;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              margin: 20px 0;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              transition: transform 0.2s;
            }
            .button:hover {
              transform: translateY(-1px);
              box-shadow: 0 4px 6px rgba(0,0,0,0.15);
            }
            /* Achievement styles */
            .achievement-badge {
              width: 120px;
              height: 120px;
              margin: 20px auto;
              background: linear-gradient(135deg, #48BB78 0%, #38A169 100%);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 40px;
              color: white;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            /* Footer styles */
            .footer {
              text-align: center;
              padding: 25px;
              color: #718096;
              font-size: 14px;
              border-top: 2px solid #e0e0e0;
              background: linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%);
              border-radius: 0 0 12px 12px;
              margin: 20px -20px -20px -20px;
            }
            .eco-message {
              color: #48BB78;
              margin: 15px 0;
              font-style: italic;
              font-size: 16px;
              text-align: center;
              padding: 15px;
              background-color: #F0FFF4;
              border-radius: 8px;
            }
            /* Sustainability icon styles */
            .sustainability-icons {
              text-align: center;
              margin: 25px 0;
              font-size: 32px;
              filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
            }
            /* Progress bar styles */
            .progress-container {
              margin: 20px 0;
              background-color: #E2E8F0;
              border-radius: 8px;
              overflow: hidden;
            }
            .progress-bar {
              height: 20px;
              background: linear-gradient(135deg, #48BB78 0%, #38A169 100%);
              border-radius: 8px;
              transition: width 0.3s ease;
            }
            /* Responsive styles */
            @media only screen and (max-width: 480px) {
              .container {
                padding: 15px;
              }
              .content {
                padding: 20px 15px;
              }
              .title {
                font-size: 20px;
              }
              .otp-code {
                font-size: 28px;
                letter-spacing: 6px;
              }
              .stat-card {
                min-width: 120px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            {{content}}
          </div>
        </body>
      </html>
    `;
  }

  public static getOTPEmailTemplate(otp: string, { configService }: EmailTemplateProps) {
    const content = `
      <div class="header">
        <h1 class="header-title">Secure Login</h1>
      </div>
      
      <div class="content">
        <h2 class="title">Verify Your Login</h2>
        <p class="message">Welcome back to B3TR EV Rewards! To ensure the security of your account, please use the following verification code:</p>
        
        <div class="otp-container">
          <div class="otp-code">${otp}</div>
          <p>This code will expire in 10 minutes</p>
        </div>

        <div class="sustainability-icons">
          🌱 🚗 ⚡
        </div>

        <p class="message">
          Thank you for being part of our mission to create a more sustainable future through electric vehicle adoption.
        </p>

        <p class="eco-message">
          Every EV mile driven contributes to a cleaner planet! 🌍
        </p>
      </div>

      <div class="footer">
        <p>This is an automated message, please do not reply.</p>
        <p>If you didn't request this code, please contact support immediately.</p>
        <p>&copy; ${new Date().getFullYear()} B3TR - Powered by VeChain</p>
      </div>
    `;

    return EmailTemplates.getBaseTemplate().replace('{{content}}', content);
  }
} 