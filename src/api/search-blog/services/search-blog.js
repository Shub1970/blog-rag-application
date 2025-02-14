"use strict";

const { OpenAI } = require("openai");

// Response template for insufficient context
const insufficientContextResponse = {
  thought_process: [
    "Analyzed the available blog content",
    "Evaluated relevance to the question",
    "Determined insufficient information in database",
  ],
  answer:
    "I apologize, but I couldn't find enough relevant information in our blog database to provide a complete and accurate answer to your question. Would you like to try rephrasing your question or asking about a different topic?",
  enough_context: false,
};

module.exports = ({ strapi }) => ({
  async generateResponse(question, context) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      // Check if we have meaningful context
      if (
        !context ||
        context.length === 0 ||
        context.every((c) => c.similarity > 0.8)
      ) {
        return insufficientContextResponse;
      }

      const contextStr = JSON.stringify(context, null, 2);

      const systemPrompt = `
        You are an AI assistant for a blog-based product recommendation system. Your task is to synthesize a coherent and helpful answer
        based on the given question and relevant blog content.
        
        Your response must be in the following JSON format:
        {
          "thought_process": ["thought1", "thought2", ...],
          "answer": "your synthesized answer",
          "enough_context": boolean
        }
        
        Guidelines:
        1. thought_process should list your key thoughts while analyzing the context and forming the answer
        2. answer should be clear, concise, and based only on the provided context
        3. enough_context should be true only if the provided context is sufficient to fully answer the question
        4. If enough_context is false, provide a polite response explaining that you don't have enough information
        5. Do not make up or infer information not present in the provided context
      `;

      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Question: ${question}` },
        { role: "assistant", content: `Context: ${contextStr}` },
      ];

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages,
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error("No content returned from OpenAI.");
      }

      const parsedContent = JSON.parse(content);

      // If OpenAI indicates not enough context, use our standard insufficient context response
      if (!parsedContent.enough_context) {
        return insufficientContextResponse;
      }

      return parsedContent;
    } catch (error) {
      strapi.log.error("Error generating response:", error);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  },
});
