import React, { useState } from "react";
import "./App.css"; // Import the CSS file

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [data, setData] = useState(null);
  const [sql, setSql] = useState(null); // New state for SQL query
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const askQuestion = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    setAnswer(null);
    setData(null);
    setSql(null); // Reset SQL query

    try {
      const response = await fetch("http://localhost:5000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Server error: ${errText}`);
      }

      const result = await response.json();

      if (result.error) {
        setError(result.error);
      } else {
        setAnswer(result.answer);
        setData(result.data);
        setSql(result.sql); // Store the SQL query
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1 className="title">AI Data Agent</h1>

      <textarea
        rows={4}
        placeholder="Type your business question here..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="question-box"
      />

      <button
        onClick={askQuestion}
        disabled={loading}
        className={`ask-button ${loading ? "disabled" : ""}`}
      >
        {loading ? "Thinking..." : "Ask"}
      </button>

      {error && <p className="error-message">Error: {error}</p>}

      {sql && (
        <div className="answer-section">
          <h3>Generated SQL Query:</h3>
          <pre>{sql}</pre>
        </div>
      )}

      {answer && (
        <div className="answer-section">
          <h3>Answer:</h3>
          <p>{answer}</p>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="data-section">
          <h3>Data:</h3>
          <table className="data-table">
            <thead>
              <tr>
                {Object.keys(data[0]).map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx}>
                  {Object.values(row).map((val, i) => (
                    <td key={i}>{val?.toString()}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
