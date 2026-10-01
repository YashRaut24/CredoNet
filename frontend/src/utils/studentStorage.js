// SkillPassport Client-Side Storage & Evidence Derivation
// Syncs seamlessly with Express backend and falls back to localStorage

export const DEMO_ADDRESS = "0x71c92a8c943b8d62283e1c66289b5b38b71c4e92".toLowerCase();

const DEFAULT_PROFILE = {
  name: "Alex John",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  college: "Sardar Patel Institute of Technology",
  degree: "B.E. Computer Engineering",
  graduationYear: "2027",
  bio: "Full-Stack & Web3 Developer focused on smart contract architecture, EVM distributed systems, and verifiable credentials.",
  interests: ["Web Development", "Blockchain", "Distributed Systems", "Cryptography"],
};

// Profile
export async function getStudentProfile(address) {
  if (!address) return { ...DEFAULT_PROFILE, wallet: "" };
  const key = `skillpassport_profile_${address.toLowerCase()}`;
  
  // Try backend first
  try {
    const res = await fetch(`/api/profile/${address}`);
    if (res.ok) {
      const data = await res.json();
      if (data.profile && (data.profile.name || data.profile.college)) {
        localStorage.setItem(key, JSON.stringify(data.profile));
        return data.profile;
      }
    }
  } catch (e) {}

  // Fallback to localStorage
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }

  // Fallback default for demo address or empty profile
  if (address.toLowerCase() === DEMO_ADDRESS) {
    return { ...DEFAULT_PROFILE, wallet: address };
  }

  return {
    name: "",
    avatar: "",
    college: "",
    degree: "",
    graduationYear: "",
    bio: "",
    interests: [],
    wallet: address,
  };
}

export async function saveStudentProfile(address, profile) {
  if (!address) return;
  const key = `skillpassport_profile_${address.toLowerCase()}`;
  const dataToSave = { ...profile, wallet: address };
  localStorage.setItem(key, JSON.stringify(dataToSave));

  try {
    await fetch(`/api/profile/${address}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSave),
    });
  } catch (e) {}
  return dataToSave;
}

// Projects (Fetched from backend MongoDB, no dummy data)
export async function getStudentProjects(address) {
  if (!address) return [];
  const key = `skillpassport_projects_${address.toLowerCase()}`;

  // Try backend MongoDB
  try {
    const res = await fetch(`/api/projects/${address}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.projects)) {
        localStorage.setItem(key, JSON.stringify(data.projects));
        return data.projects;
      }
    }
  } catch (e) {}

  // Fallback localStorage
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }

  return [];
}

export async function addStudentProject(address, project) {
  if (!address) return null;
  const key = `skillpassport_projects_${address.toLowerCase()}`;
  const current = await getStudentProjects(address);
  const newProj = {
    id: "proj-" + Date.now(),
    name: project.name || "Untitled Project",
    description: project.description || "",
    githubUrl: project.githubUrl || "",
    demoUrl: project.demoUrl || "",
    technologies: project.technologies || "",
    skillsDemonstrated: project.skillsDemonstrated || "",
    createdAt: new Date().toISOString(),
  };

  const updated = [newProj, ...current];
  localStorage.setItem(key, JSON.stringify(updated));

  try {
    await fetch(`/api/projects/${address}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProj),
    });
  } catch (e) {}

  return newProj;
}

export async function deleteStudentProject(address, projectId) {
  if (!address) return;
  const key = `skillpassport_projects_${address.toLowerCase()}`;
  const current = await getStudentProjects(address);
  const updated = current.filter(p => p.id !== projectId);
  localStorage.setItem(key, JSON.stringify(updated));

  try {
    await fetch(`/api/projects/${address}/${projectId}`, {
      method: "DELETE",
    });
  } catch (e) {}
}

// Endorsements (Fetched from backend MongoDB, no dummy data)
export async function getStudentEndorsements(address) {
  if (!address) return [];
  const key = `skillpassport_endorsements_${address.toLowerCase()}`;

  try {
    const res = await fetch(`/api/endorsements/${address}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.endorsements)) {
        localStorage.setItem(key, JSON.stringify(data.endorsements));
        return data.endorsements;
      }
    }
  } catch (e) {}

  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }

  return [];
}

export async function addStudentEndorsement(address, endorsement) {
  if (!address) return null;
  const key = `skillpassport_endorsements_${address.toLowerCase()}`;
  const current = await getStudentEndorsements(address);
  const newEnd = {
    id: "end-" + Date.now(),
    skill: endorsement.skill || "General Competency",
    endorsementText: endorsement.endorsementText || "",
    endorserWallet: endorsement.endorserWallet || "0x0000000000000000000000000000000000000000",
    endorserName: endorsement.endorserName || "Project Mentor",
    date: new Date().toISOString().split("T")[0],
  };

  const updated = [newEnd, ...current];
  localStorage.setItem(key, JSON.stringify(updated));

  try {
    await fetch(`/api/endorsements/${address}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEnd),
    });
  } catch (e) {}

  return newEnd;
}

// Derive Real Achievements from Actual Data
export function calculateAchievements({ credentials = [], projects = [], endorsements = [] }) {
  const validCreds = credentials.filter(c => !c.revoked);
  const uniqueSkills = Array.from(new Set(validCreds.map(c => c.skill)));

  const hasWeb3Tech = projects.some(p => {
    const text = `${p.technologies} ${p.skillsDemonstrated} ${p.name}`.toLowerCase();
    return text.includes("solidity") || text.includes("web3") || text.includes("blockchain") || text.includes("monad") || text.includes("ethers");
  }) || validCreds.some(c => {
    const text = c.skill.toLowerCase();
    return text.includes("solidity") || text.includes("web3") || text.includes("blockchain");
  });

  const definitions = [
    {
      id: "first_credential",
      title: "First Verified Credential",
      description: "Received your first cryptographically signed credential from an authorized issuer on Monad.",
      icon: "🏆",
      unlocked: validCreds.length >= 1,
      requirement: "1 Verified Credential on Monad",
      current: `${validCreds.length}/1`,
    },
    {
      id: "portfolio_pioneer",
      title: "Portfolio Pioneer",
      description: "Added documented project evidence demonstrating practical technical competencies.",
      icon: "🚀",
      unlocked: projects.length >= 1,
      requirement: "1 Documented Project",
      current: `${projects.length}/1`,
    },
    {
      id: "web3_builder",
      title: "Web3 Builder",
      description: "Demonstrated skills or projects built on EVM smart contract architecture.",
      icon: "⛓️",
      unlocked: hasWeb3Tech,
      requirement: "Solidity/Web3 Project or Credential",
      current: hasWeb3Tech ? "Unlocked" : "Locked",
    },
    {
      id: "prolific_builder",
      title: "Prolific Builder",
      description: "Maintained a portfolio of 3 or more technical builds as verified evidence.",
      icon: "💻",
      unlocked: projects.length >= 3,
      requirement: "3 Project Builds",
      current: `${projects.length}/3`,
    },
    {
      id: "five_skills",
      title: "5 Verified Skills",
      description: "Earned 5 distinct skill certificates anchored to your wallet by accredited issuers.",
      icon: "🌟",
      unlocked: uniqueSkills.length >= 5,
      requirement: "5 Distinct Verified Skills",
      current: `${uniqueSkills.length}/5`,
    },
    {
      id: "mentor_endorsed",
      title: "Mentor Endorsed",
      description: "Received peer or mentor testimonial endorsement on a technical competency.",
      icon: "🤝",
      unlocked: endorsements.length >= 1,
      requirement: "1 Mentor Endorsement",
      current: `${endorsements.length}/1`,
    },
  ];

  return definitions;
}

// Build Evidence-Based Skill Map
export function buildEvidenceSkillMap({ credentials = [], projects = [], endorsements = [] }) {
  const validCreds = credentials.filter(c => !c.revoked);
  const skillMap = new Map();

  // 1. Ingest from verified credentials
  for (const cred of validCreds) {
    const rawSkill = cred.skill.replace(/^\[Project\]\s*/i, "").replace(/^project:\s*/i, "").trim();
    if (!skillMap.has(rawSkill.toLowerCase())) {
      skillMap.set(rawSkill.toLowerCase(), {
        name: rawSkill,
        isVerified: true,
        credentials: [],
        projects: [],
        endorsements: [],
      });
    }
    const entry = skillMap.get(rawSkill.toLowerCase());
    entry.credentials.push(cred);
  }

  // 2. Ingest demonstrated skills from projects
  for (const proj of projects) {
    const skills = `${proj.skillsDemonstrated || ""}, ${proj.technologies || ""}`
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    for (const s of skills) {
      if (!skillMap.has(s.toLowerCase())) {
        skillMap.set(s.toLowerCase(), {
          name: s,
          isVerified: false, // Student claim only until credential issued!
          credentials: [],
          projects: [],
          endorsements: [],
        });
      }
      const entry = skillMap.get(s.toLowerCase());
      if (!entry.projects.some(p => p.id === proj.id)) {
        entry.projects.push(proj);
      }
    }
  }

  // 3. Ingest from endorsements
  for (const end of endorsements) {
    const rawSkill = (end.skill || "").trim();
    if (!rawSkill) continue;
    if (!skillMap.has(rawSkill.toLowerCase())) {
      skillMap.set(rawSkill.toLowerCase(), {
        name: rawSkill,
        isVerified: false,
        credentials: [],
        projects: [],
        endorsements: [],
      });
    }
    const entry = skillMap.get(rawSkill.toLowerCase());
    entry.endorsements.push(end);
  }

  return Array.from(skillMap.values());
}
