import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import '../assets/style.css';

function ProblemDetails() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [input, setInput] = useState('');

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

  const handleCodeChange = (value) => {
    setCode(value);
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  const handleSubmit = () => {
    // Handle code submission logic here
  };

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  const handleRun = async () => {
    try {
      const response = await axios.post(`http://localhost:8080/problems/${id}/run`, {
        code,
        language,
        input,
      });
      console.log('response', response);
      setOutput(response.data.output);
    } catch (error) {
      console.error('Error running code:', error);
    }
  };

  const getLanguageExtension = () => {
    switch (language) {
      case 'javascript':
        return javascript();
      case 'python':
        return python();
      case 'cpp':
        return cpp();
      case 'java':
        return java();
      default:
        return null;
    }
  };

  return (
    <div className="problem-details-container">
      {problem && (
        <>
          <div className="problem-description">
            <h2>{problem.title}</h2>
            <p>{problem.description}</p>
            <p>Input: {problem.input}</p>
            <p>Output: {problem.output}</p>
          </div>
          <div className="code-editor">
            <div className="code-editor">
              <select value={language} onChange={handleLanguageChange}>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>
              <CodeMirror
                value={code}
                height="400px"
                extensions={[getLanguageExtension()]}
                onChange={handleCodeChange}
              />
              <textarea
                value={input}
                onChange={handleInputChange}
                placeholder="Write your input here"
              />
            </div>
            <button className="run-button" onClick={handleRun}>
              Run
            </button>
            <button className="submit-button" onClick={handleSubmit}>
              Submit
            </button>
            <div className="output-container">
              <h3>Output:</h3>
              <pre>{output}</pre>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ProblemDetails;
