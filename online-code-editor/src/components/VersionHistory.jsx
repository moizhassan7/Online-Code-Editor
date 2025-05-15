// components/VersionHistory.jsx
export default function VersionHistory({ projectId }) {
    const [versions, setVersions] = useState([]);
    
    useEffect(() => {
      const project = loadProject(projectId);
      setVersions(project?.versionHistory || []);
    }, [projectId]);
  
    return (
      <div className="version-history">
        <h3>Commit History</h3>
        <ul>
          {versions.map(version => (
            <li key={version.id} className="version-item">
              <div className="version-message">{version.message}</div>
              <div className="version-time">
                {new Date(version.timestamp).toLocaleString()}
              </div>
              <button 
                onClick={() => restoreVersion(projectId, version.id)}
                className="restore-btn"
              >
                Restore
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }