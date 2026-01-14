import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// 🚀 TRANSPORTER CONFIGURATION (Optimized for 2026 Security)
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // SSL/TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // ⚠️ Use the 16-character App Password here
  },
  tls: {
    // Port block aagama irukka intha security layer mighavum mukkiyam
    rejectUnauthorized: false 
  }
});

// --- 🏛️ SHARED LUXURY TEMPLATE ENGINE ---
const luxuryLayout = (content, previewText) => `
  <div style="background-color: #050505; color: #ffffff; font-family: 'Times New Roman', serif; padding: 40px 20px; text-align: center; line-height: 1.6;">
    <div style="max-width: 600px; margin: 0 auto; border: 1px solid rgba(212, 163, 115, 0.2); padding: 40px; background: linear-gradient(145deg, #0a0a0a, #050505); border-radius: 40px;">
      <span style="display: none; visibility: hidden; font-size: 0; color: transparent;">${previewText}</span>
      
      <h2 style="color: #d4a373; font-style: italic; font-size: 28px; letter-spacing: -1px; margin-bottom: 30px; font-weight: normal;">Rahaa.</h2>
      <div style="height: 1px; width: 40px; background: #d4a373; margin: 0 auto 30px;"></div>
      
      ${content}
      
      <div style="margin-top: 50px; padding-top: 30px; border-top: 1px solid rgba(255,255,255,0.05);">
        <p style="font-size: 8px; text-transform: uppercase; letter-spacing: 5px; color: #444; margin-bottom: 5px;">House of Rahaa • Est 2026</p>
        <p style="font-size: 7px; color: #222; text-transform: uppercase; letter-spacing: 2px;">Premium Digital Archive Access</p>
      </div>
    </div>
  </div>
`;

// 1. WELCOME PROTOCOL
export const sendWelcomeEmail = async (email, name) => {
  try {
    const html = luxuryLayout(`
      <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 4px; color: #d4a373; font-weight: bold;">Authentication Successful</p>
      <h1 style="font-size: 32px; font-weight: normal; margin: 20px 0;">Welcome, ${name}</h1>
      <p style="color: #888; font-size: 14px; max-width: 400px; margin: 0 auto;">Your identity has been secured in our private vault. You now hold access to our most exclusive artifact collection.</p>
      <div style="margin-top: 40px;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" style="background: #ffffff; color: #000000; padding: 15px 35px; text-decoration: none; border-radius: 100px; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; display: inline-block;">Explore Archive</a>
      </div>
    `, "Welcome to the House of Rahaa Digital Vault");

    await transporter.sendMail({
      from: `"House of Rahaa" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Vault Access Granted 🏛️",
      html,
    });
    console.log("✅ Welcome Protocol Dispatched");
  } catch (error) {
    console.log("❌ Email Error (Welcome):", error.message);
  }
};

// 2. ACQUISITION PROTOCOL (Order Success)
export const sendOrderEmail = async (email, orderId, amount, products = []) => {
  try {
    const orderDetails = `
      <div style="text-align: left; margin: 40px 0; border: 1px solid rgba(255,255,255,0.05); padding: 20px; border-radius: 20px;">
        <p style="font-size: 9px; text-transform: uppercase; letter-spacing: 2px; color: #d4a373; margin-bottom: 15px;">Inventory Log:</p>
        ${products.map(p => `
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.03); padding: 10px 0;">
            <span style="font-size: 12px; color: #ccc;">${p.name}</span>
            <span style="font-size: 12px; color: #d4a373;">₹${p.price?.toLocaleString()}</span>
          </div>
        `).join('')}
        <div style="padding-top: 15px; text-align: right;">
          <p style="font-size: 10px; color: #555; margin: 0;">Net Valuation</p>
          <h2 style="font-size: 24px; color: #ffffff; margin: 5px 0;">₹${amount?.toLocaleString()}</h2>
        </div>
      </div>
    `;

    const userHtml = luxuryLayout(`
      <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 4px; color: #d4a373; font-weight: bold;">Acquisition Secured</p>
      <h1 style="font-size: 28px; font-weight: normal; margin: 20px 0;">Transaction Verified</h1>
      <p style="font-family: monospace; font-size: 11px; color: #555; background: rgba(255,255,255,0.02); padding: 10px; border-radius: 10px;">Token: #${orderId.slice(-10).toUpperCase()}</p>
      ${orderDetails}
    `, `Order Confirmed: ${orderId.slice(-6)}`);

    // A. Send to Collector (User)
    await transporter.sendMail({
      from: `"House of Rahaa" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Acquisition Confirmed #${orderId.slice(-6).toUpperCase()} 💎`,
      html: userHtml,
    });

    // B. Send to Curator (Admin)
    if (process.env.ADMIN_EMAIL) {
      const adminHtml = luxuryLayout(`
        <h2 style="color:#d4a373; font-weight: normal;">New Sale Alert</h2>
        <p style="color:#ccc; font-size: 12px;">Collector: <b>${email}</b></p>
        <p style="color:#888; font-size: 11px;">Token: ${orderId}</p>
        ${orderDetails}
      `, "New Asset Sold");

      await transporter.sendMail({
        from: `"Rahaa Vault" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `[ADMIN] New Acquisition: ₹${amount?.toLocaleString()} 🏛️`,
        html: adminHtml
      });
    }

    console.log("✅ Acquisition Logs Dispatched");
  } catch (error) {
    console.log("❌ Email Error (Acquisition):", error.message);
  }
};

// 3. LOGISTICS PROTOCOL (Status Update)
export const sendStatusEmail = async (email, status, orderId) => {
  try {
    const statusIcons = {
      "Shipped": "🚚",
      "Delivered": "🏛️",
      "Processing": "⚙️",
      "Cancel": "✕"
    };

    const content = `
      <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 4px; color: #d4a373; font-weight: bold;">Logistics Protocol</p>
      <h1 style="font-size: 28px; font-weight: normal; margin: 20px 0;">Artifact ${status}</h1>
      <div style="font-size: 50px; margin: 30px 0;">${statusIcons[status] || "❖"}</div>
      <p style="color: #888; font-size: 14px;">Your artifact for Acquisition <span style="color:#fff">#${orderId.slice(-6).toUpperCase()}</span> has moved to the <b>${status}</b> phase.</p>
      <div style="margin-top: 40px;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard/user/orders" style="border: 1px solid rgba(212,163,115,0.5); color: #d4a373; padding: 12px 30px; text-decoration: none; border-radius: 100px; font-size: 9px; text-transform: uppercase; letter-spacing: 2px; display: inline-block;">Trace Live</a>
      </div>
    `;

    // Send to User
    await transporter.sendMail({
      from: `"House of Rahaa" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Logistics Update: ${status} ${statusIcons[status] || ""}`,
      html: luxuryLayout(content, `Order ${status}`),
    });

    // Send to Admin Alert
    if (process.env.ADMIN_EMAIL) {
      await transporter.sendMail({
        from: `"Logistics Hub" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `[ADMIN] Status Sync: #${orderId.slice(-6).toUpperCase()} moved to ${status}`,
        html: luxuryLayout(`
          <h2 style="color:#d4a373; font-weight: normal;">Logistics Protocol Updated</h2>
          <p style="color:#888; font-size: 12px;">Order: #${orderId}</p>
          <p style="color:#888; font-size: 12px;">Collector: ${email}</p>
          <p style="font-size: 18px; color:#fff; margin-top: 20px;">Current Status: <b>${status}</b></p>
        `, `Status Update: ${status}`),
      });
    }

    console.log(`✅ Logistics Update Dispatched: ${status}`);
  } catch (error) {
    console.log("❌ Email Error (Logistics):", error.message);
  }
};