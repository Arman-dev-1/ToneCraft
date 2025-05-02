import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './DocumentList.css';

const DocumentList = () => {
  const [documents, setDocuments] = useState([
    { id: 1, title: 'Business Proposal', created: '2023-05-15', lastEdited: '2023-05-18' },
    { id: 2, title: 'Meeting Notes', created: '2023-05-10', lastEdited: '2023-05-12' },
    { id: 3, title: 'Project Plan', created: '2023-05-05', lastEdited: '2023-05-11' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // In a real app, you'd fetch documents from the backend
  useEffect(() => {
    // Simulating API call
    setLoading(true);
    // Mock API fetch
    setTimeout(() => {
      setLoading(false);
      // Data is already set in the initial state
    }, 500);
  }, []);

  const createNewDocument = () => {
    const newId = Math.max(...documents.map(doc => doc.id), 0) + 1;
    const newDoc = {
      id: newId,
      title: `Untitled Document ${newId}`,
      created: new Date().toISOString().split('T')[0],
      lastEdited: new Date().toISOString().split('T')[0]
    };
    setDocuments([newDoc, ...documents]);
  };

  return (
    <div className="document-list-container">
      <div className="document-list-header">
        <h1>My Documents</h1>
        <button 
          className="new-document-btn"
          onClick={createNewDocument}
        >
          New Document
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading documents...</div>
      ) : error ? (
        <div className="error">Error: {error}</div>
      ) : (
        <div className="document-grid">
          {documents.map(doc => (
            <Link 
              to={`/doc/${doc.id}`} 
              key={doc.id} 
              className="document-card"
            >
              <div className="document-title">{doc.title}</div>
              <div className="document-meta">
                <span>Created: {doc.created}</span>
                <span>Last edited: {doc.lastEdited}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentList; 