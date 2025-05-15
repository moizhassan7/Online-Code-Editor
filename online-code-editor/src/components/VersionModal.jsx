export default function CommitModal({ projectId, onClose }) {
    const [commitMessage, setCommitMessage] = useState('');
  
    const handleCommit = () => {
      saveVersion(projectId, commitMessage);
      onClose();
    };
  
    return (
      <div className="commit-modal-overlay">
        <div className="commit-modal">
          <h3>Save Version</h3>
          <input
            type="text"
            placeholder="Commit message..."
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
          />
          <div className="modal-actions">
            <button onClick={onClose}>Cancel</button>
            <button onClick={handleCommit}>Commit</button>
          </div>
        </div>
      </div>
    );
  }