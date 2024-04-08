import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../assets/style.css'; // Make sure to import the CSS file

function ProblemDetails() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('c');
  const [output, setOutput] = useState('');

  useEffect(() => {
    const fetchProblemDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8080/problems/${id}`);
        const data = await response.json();
        setProblem(data);
      } catch (error) {
        console.error('Error fetching problem details:', error);
      }
    };

    fetchProblemDetails();
  }, [id]);

  const handleCodeChange = (event) => {
    setCode(event.target.value);
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  const handleSubmit = () => {
    // Handle code submission logic here
  };

  const handleRun = async () => {
    try {
      const response = await axios.post(`http://localhost:8080/problems/${id}/run`, {
        code,
        language,
      });
      setOutput(response.data.output);
    } catch (error) {
      console.error('Error running code:', error);
    }
  };

  return (
    <div className="problem-details-container">
      {problem && (
        <>
          <div className="problem-description">
            <h2>{problem.title}</h2>
            <p>{problem.description}</p>
            <p>Input : {problem.input}</p>
            <p>Output : {problem.output}</p>
          </div>
          <div className="code-editor">
            <div className="code-editor">
              <select value={language} onChange={handleLanguageChange}>
                <option value="c">C</option>
                <option value="cpp">C++</option>
                <option value="js">JavaScript</option>
                <option value="py">Python</option>
                <option value="java">Java</option>
                {/* Add more language options as needed */}
              </select>
              <textarea
                value={code}
                onChange={handleCodeChange}
                placeholder="Write your code here"
              />
            </div>
            <button className="run-button" onClick={handleRun}>Run</button>
            <button className="submit-button" onClick={handleSubmit}>Submit</button>
          </div>
        </>
      )}
    </div>
  );
}

export default ProblemDetails;
