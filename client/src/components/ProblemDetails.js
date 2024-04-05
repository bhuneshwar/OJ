import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../assets/style.css'; // Make sure to import the CSS file

function ProblemDetails() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);

  useEffect(() => {
    // Fetch problem details logic here
  }, [id]);

  return (
    <div className="problem-details-container">
      {problem && (
        <>
          <div className="problem-description">
            <h2>{problem.title}</h2>
            <p>{problem.description}</p>
          </div>
          <div className="code-editor">
            {/* IDE component here */}
            <button className="run-button">Run</button>
          </div>
        </>
      )}
    </div>
  );
}

export default ProblemDetails;
