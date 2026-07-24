export default {
  async afterCreate(event: any) {
    const { result } = event;
    const { name, email, subject, message } = result;

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.log("Telegram bot token or chat ID is missing. Skipping Telegram notification.");
      return;
    }

    const text = `🚨 *New Contact Submission* 🚨\n\n*Name:* ${name}\n*Email:* ${email}\n*Subject:* ${subject}\n*Message:*\n${message}`;

    // Run fetch in the background without blocking the Strapi response
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "Markdown",
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          console.error("Failed to send Telegram notification:", await response.text());
        } else {
          console.log("Telegram notification sent successfully!");
        }
      })
      .catch((error) => {
        console.error("Error sending Telegram notification:", error);
      });
  },
};
