const { GoogleGenAI } = require("@google/genai");
const dotenv = require("dotenv");
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const generateAiResponse = async (code) => {
  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Give a short and crisp review of the following code. Then tell whether the code is correct or has any mistakes. 
              Also mention its time and space complexity. Check if the code is optimized — if not, suggest improvements in simple 
              and easy-to-understand language. Keep the overall response brief and beginner-friendly.
              Here is the code:
              ${code}`,
            },
          ],
        },
      ],
    });

    // ✅ Proper way to extract text
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;


    console.log("✅ AI Review Response:\n", text);
    return text;
  } catch (error) {
    console.error("❌ Error generating AI response:", error);
    return "Error: Failed to generate AI review.";
  }
};

module.exports = generateAiResponse;
