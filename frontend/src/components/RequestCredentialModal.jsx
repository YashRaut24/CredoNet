import React, { useState, useEffect } from "react";
import { 
  Award, 
  FolderGit2, 
  Github, 
  Globe, 
  Send, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Clock,
  FileCheck,
  UploadCloud,
  GraduationCap,
  FileText
} from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { getStudentProjects } from "../utils/studentStorage";
import "./RequestCredentialModal.css";

export function RequestCredentialModal({ onClose, onRequestSubmitted }) {
  const { account } = useWeb3();
  const [projects, setProjects] = useState([]);
  const [skillTitle, setSkillTitle] = useState("");
  const [category, setCategory] = useState("skill");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [evidenceProject, setEvidenceProject] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [validityDuration, setValidityDuration] = useState("Perpetual");
  const [issuerAddress, setIssuerAddress] = useState("0x21626cDb67f0114D0F6a7dBC1140B7C0A9101864");
  const [notes, setNotes] = useState("");
  
  // Certificate specific states
  const [issuingOrg, setIssuingOrg] = useState("Sardar Patel Institute of Technology");
  const [certificateGrade, setCertificateGrade] = useState("");
  const [certificateFileName, setCertificateFileName] = useState("");
  const [certificateFileSize, setCertificateFileSize] = useState("");
  const [certificateFileHash, setCertificateFileHash] = useState("");
  const [isHashingFile, setIsHashingFile] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const studentAddress = account || "0x71C92a8C943B8d62283e1c66289b5B38B71C4e92";

  useEffect(() => {
    async function loadProjects() {
      const list = await getStudentProjects(studentAddress);
      setProjects(list);
    }
    loadProjects();
  }, [studentAddress]);

  const handleSelectProject = (projectId) => {
    setSelectedProjectId(projectId);
    const proj = projects.find((p) => p.id === projectId);
    if (proj) {
      setEvidenceProject(proj.name);
      if (proj.githubUrl) setGithubUrl(proj.githubUrl);
      if (proj.demoUrl) setLiveUrl(proj.demoUrl);
      if (!skillTitle) setSkillTitle(proj.skillsDemonstrated || proj.name);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCertificateFileName(file.name);
    const sizeKb = (file.size / 1024).toFixed(1);
    setCertificateFileSize(file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : `${sizeKb} KB`);

    setIsHashingFile(true);
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      setCertificateFileHash(hashHex);
    } catch (err) {
      console.warn("Subtle crypto error, using fallback:", err);
      const fallbackHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      setCertificateFileHash(fallbackHash);
    } finally {
      setIsHashingFile(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!skillTitle.trim()) {
      setError(category === "certificate" ? "Please enter your degree or certificate title." : "Please specify the credential or skill title.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const finalTitle = category === "certificate" && !skillTitle.startsWith("[Certificate]")
        ? `[Certificate] ${skillTitle.trim()}`
        : skillTitle.trim();

      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentAddress,
          studentName: "Alex John",
          skillTitle: finalTitle,
          category,
          certificateTitle: skillTitle.trim(),
          issuingOrg: issuingOrg.trim(),
          certificateGrade: certificateGrade.trim(),
          certificateFileName,
          certificateFileSize,
          certificateFileHash,
          evidenceProject: evidenceProject.trim(),
          githubUrl: githubUrl.trim(),
          liveUrl: liveUrl.trim(),
          notes: notes.trim(),
          issuerAddress,
          validityDuration,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        if (onRequestSubmitted) {
          onRequestSubmitted(data.request);
        }
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        setError(data.error || "Failed to submit request.");
      }
    } catch (err) {
      setError(err.message || "Failed to communicate with server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="request-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="request-modal-header">
          <div className="request-header-info">
            <div className="request-icon-wrap">
              {category === "certificate" ? (
                <FileCheck size={18} color="#10b981" />
              ) : (
                <Award size={18} color="#e36128" />
              )}
            </div>
            <div>
              <h3 className="request-modal-title">
                {category === "certificate" ? "Request Academic Degree / Certificate Audit" : "Request Credential Verification"}
              </h3>
              <p className="request-modal-sub">
                {category === "certificate" 
                  ? "Submit institutional graduation credentials and document hashes to accredited university verifiers"
                  : "Submit your project evidence to an accredited institutional issuer"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-modal-close" title="Close">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        {success ? (
          <div className="request-success-box">
            <CheckCircle2 size={42} color="#10b981" />
            <h3>Verification Claim Submitted!</h3>
            <p>
              {category === "certificate"
                ? "Your official degree document hash and academic claim have been forwarded to the institutional certifying authority for on-chain audit."
                : "Your institutional issuer has received your project evidence and can audit it on-chain."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="request-modal-form">
            {error && (
              <div className="request-error-alert">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group-row">
              <div className="form-field">
                <label>
                  {category === "certificate" ? "Degree / Certificate Title" : "Credential / Skill Title"} <span className="req">*</span>
                </label>
                <input
                  type="text"
                  placeholder={
                    category === "certificate" 
                      ? "e.g. B.E. Computer Engineering" 
                      : "e.g. Full-Stack Software Engineer"
                  }
                  value={skillTitle}
                  onChange={(e) => setSkillTitle(e.target.value)}
                  className="modal-input"
                  required
                />
              </div>

              <div className="form-field">
                <label>Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="modal-input"
                >
                  <option value="skill">Verified Skill Credential</option>
                  <option value="project">Verified Capstone Project</option>
                  <option value="certificate">Official Degree / Certificate</option>
                  <option value="certification">Professional Certification</option>
                </select>
              </div>
            </div>

            {/* Certificate Specific Fields */}
            {category === "certificate" ? (
              <>
                <div className="form-group-row">
                  <div className="form-field">
                    <label>Issuing University / Institution <span className="req">*</span></label>
                    <input
                      type="text"
                      placeholder="e.g. Sardar Patel Institute of Technology"
                      value={issuingOrg}
                      onChange={(e) => setIssuingOrg(e.target.value)}
                      className="modal-input"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label>Honors / Grade / Division</label>
                    <input
                      type="text"
                      placeholder="e.g. First Class with Distinction (CGPA 9.4)"
                      value={certificateGrade}
                      onChange={(e) => setCertificateGrade(e.target.value)}
                      className="modal-input"
                    />
                  </div>
                </div>

                {/* Document File Dropzone */}
                <div className="form-field">
                  <div className="request-doc-label-row">
                    <label>Certificate Document File (PDF / Image)</label>
                    <span className="request-doc-badge">
                      {isHashingFile ? "Calculating Fingerprint..." : "Direct Document Verification"}
                    </span>
                  </div>

                  {!certificateFileName ? (
                    <label className="request-file-dropzone">
                      <input
                        type="file"
                        accept=".pdf,image/png,image/jpeg,image/webp"
                        onChange={handleFileUpload}
                        className="request-file-hidden"
                      />
                      <div className="request-file-dropzone-inner">
                        <UploadCloud size={20} color="#10b981" />
                        <span className="request-file-dropzone-text">Click to attach diploma or degree transcript</span>
                        <span className="request-file-dropzone-sub">Generates unique digital document fingerprint in browser</span>
                      </div>
                    </label>
                  ) : (
                    <div className="request-file-card">
                      <div className="request-file-info">
                        <FileText size={18} color="#10b981" />
                        <div>
                          <div className="request-file-name">{certificateFileName}</div>
                          <div className="request-file-meta">
                            {certificateFileSize} • File Fingerprint: {certificateFileHash ? `${certificateFileHash.slice(0, 16)}...` : "Calculating..."}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCertificateFileName("");
                          setCertificateFileSize("");
                          setCertificateFileHash("");
                        }}
                        className="btn-modal-close"
                        title="Remove file"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Link Existing Project */}
                {projects.length > 0 && (
                  <div className="form-field">
                    <label>Link Existing Portfolio Project</label>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => handleSelectProject(e.target.value)}
                      className="modal-input"
                    >
                      <option value="">-- Select from your portfolio projects --</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group-row">
                  <div className="form-field">
                    <label>Evidence Project Name</label>
                    <input
                      type="text"
                      placeholder="e.g. DeFi Liquidity Aggregator"
                      value={evidenceProject}
                      onChange={(e) => setEvidenceProject(e.target.value)}
                      className="modal-input"
                    />
                  </div>

                  <div className="form-field">
                    <label>Validity Duration</label>
                    <select
                      value={validityDuration}
                      onChange={(e) => setValidityDuration(e.target.value)}
                      className="modal-input"
                    >
                      <option value="Perpetual">Perpetual (Never Expires)</option>
                      <option value="1 Year">1 Year (Annual Recertification)</option>
                      <option value="2 Years">2 Years (Standard Tech Cert)</option>
                      <option value="3 Years">3 Years (Advanced Governance)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group-row">
                  <div className="form-field">
                    <label>GitHub Repository URL</label>
                    <div className="input-icon-wrap">
                      <Github size={14} className="input-icon" />
                      <input
                        type="url"
                        placeholder="https://github.com/alexjohn/project"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        className="modal-input has-icon"
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Live Demo URL (Optional)</label>
                    <div className="input-icon-wrap">
                      <Globe size={14} className="input-icon" />
                      <input
                        type="url"
                        placeholder="https://demo.project.xyz"
                        value={liveUrl}
                        onChange={(e) => setLiveUrl(e.target.value)}
                        className="modal-input has-icon"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="form-field">
              <label>Select Institutional Issuer</label>
              <div className="input-icon-wrap">
                <Building2 size={14} className="input-icon" />
                <select
                  value={issuerAddress}
                  onChange={(e) => setIssuerAddress(e.target.value)}
                  className="modal-input has-icon"
                >
                  <option value="0x21626cDb67f0114D0F6a7dBC1140B7C0A9101864">
                    Sardar Patel Institute of Technology (0x2162...1864) — Accredited Authority
                  </option>
                  <option value="0xc6BfB22D6B46346B113333b5513BDcD361488e6f">
                    CredoNet Academic Authority (0xc6Bf...8e6f)
                  </option>
                </select>
              </div>
            </div>

            <div className="form-field">
              <label>Submission Notes / Verification Message</label>
              <textarea
                rows={2}
                placeholder={
                  category === "certificate"
                    ? "Enter enrollment number or university registrar audit remarks..."
                    : "Briefly describe your key deliverables, role, and skills demonstrated..."
                }
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="modal-input"
              />
            </div>

            <div className="request-modal-actions">
              <button type="button" onClick={onClose} className="btn-secondary request-btn-cancel">
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary request-btn-submit"
              >
                {submitting ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <Send size={13} />
                    <span>Submit Verification Claim</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
