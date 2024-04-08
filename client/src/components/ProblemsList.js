import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // Make sure to install and import axios
import '../assets/style.css'; // Make sure to import the CSS file

function ProblemsList() {
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    // Fetch problems from the backend
    const fetchProblems = async () => {
      try {
        const response = await axios.get('http://localhost:8080/problems/');
        setProblems(response.data); // Assuming the backend returns an array of problems
      } catch (error) {
        console.error('Failed to fetch problems:', error);
        // Handle error (e.g., show error message)
      }
    };

    fetchProblems();
  }, []);

  return (
    <div className="problems-container">
      {problems.length > 0 ? (
        problems.map((problem) => (
          <div key={problem._id} className="problem-item">
            <span className="problem-title">{problem.title}</span>
            <Link to={`/problem/${problem._id}`} className="solve-button">Solve</Link>
          </div>
        ))
      ) : (
        <p>No problems found.</p> // Display a message if no problems are found
      )}
    </div>
  );
}

export default ProblemsList;
