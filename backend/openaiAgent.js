const { OpenAI } = require("openai");
const pool = require("./db");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

async function queryAgent(question) {
  const prompt = `
 You are a SQL expert working with the following PostgreSQL database schema:

Tables:

- regions(id INTEGER PRIMARY KEY, name TEXT)
- customers(id INTEGER PRIMARY KEY, name TEXT, email TEXT, region_id INTEGER REFERENCES regions(id))
- products(id INTEGER PRIMARY KEY, name TEXT, category TEXT, price NUMERIC)
- orders(id INTEGER PRIMARY KEY, customer_id INTEGER REFERENCES customers(id), product_id INTEGER REFERENCES products(id), quantity INTEGER, order_date DATE)

Relationships:
- customers.region_id → regions.id
- orders.customer_id → customers.id
- orders.product_id → products.id

Your job is to take a user’s natural language question and return a **valid PostgreSQL query** to answer it. Also return a **plain English explanation** of the result.

**Rules:**
- If the data exists, return the matching rows.
- If no rows are found, return a message like: "No data available for this query."
- Do NOT assume columns exist unless they’re part of the schema above.
- Always JOIN tables when necessary (e.g., to filter customers by region or product name).
- Respond ONLY in the following JSON format:

{
  "sql": "SELECT ...;",
  "answer": "Human-friendly explanation of the result or a fallback message if no data exists."
}

Examples:

Question: "Which products have never been ordered?"
Response:
{
  "sql": "SELECT p.name FROM products p LEFT JOIN orders o ON p.id = o.product_id WHERE o.id IS NULL;",
  "answer": "These are the products that have never been ordered. If the list is empty, it means all products have been ordered at least once."
}

Question: "List customers from the South region"
Response:
{
  "sql": "SELECT c.name, c.email FROM customers c JOIN regions r ON c.region_id = r.id WHERE r.name = 'South';",
  "answer": "These are the customers who are located in the South region. If no customers are shown, then no one is assigned to that region."
}

Question: "${question}"
`;
  

  try {
    const completion = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    // ✅ SAFELY access message content
    const message = completion?.choices?.[0]?.message?.content;
    if (!message) throw new Error("No message content returned.");

    console.log("OpenRouter raw response:", message);

    // ✅ Try to parse the content as JSON
    let parsed;
    try {
      parsed = JSON.parse(message);
    } catch (err) {
      throw new Error("Failed to parse model response as JSON: " + err.message);
    }

    const { sql, answer } = parsed;
    if (!sql) throw new Error("No SQL found in response.");

    // ✅ Execute SQL
    let result;
    try {
      result = await pool.query(sql);
    } catch (dbErr) {
      throw new Error("Database error: " + dbErr.message);
    }

    return {
      sql,
      answer,
      data: result.rows,
    };
  } catch (err) {
    console.error("❌ Error in queryAgent:", err);
    return { error: err.message };
  }
}

module.exports = { queryAgent };
