
import { useEffect, useState } from "react";
import {
  User,
  GraduationCap,
  School,
  Heart,
  Save,
  RotateCcw
} from "lucide-react";
import {
  readStorage,
  writeStorage,
  subscribeToStorage
} from "../data/storage";

const STORAGE_KEY = "schoolsync-student-profile";

const defaultProfile = {
  name: "",
  grade: "",
  school: "",
  interests: "",
  goals: ""
};

function normalizeProfile(profile) {
  return {
    ...defaultProfile,
    ...(profile && typeof profile === "object" ? profile : {})
  };
}

function Profile() {
  const [profile, setProfile] = useState(() =>
    normalizeProfile(readStorage(STORAGE_KEY, defaultProfile))
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToStorage(({ key, value }) => {
      if (key === STORAGE_KEY) {
        setProfile(normalizeProfile(value));
        setSaved(false);
      }
    });

    return unsubscribe;
  }, []);

  function updateProfile(event) {
    const { name, value } = event.target;

    setProfile((current) => ({
      ...current,
      [name]: value
    }));

    setSaved(false);
  }

  function saveProfile(event) {
    event.preventDefault();

    const success = writeStorage(STORAGE_KEY, profile);
    setSaved(success);
  }

  function resetProfile() {
    const success = writeStorage(STORAGE_KEY, defaultProfile);

    setProfile({ ...defaultProfile });
    setSaved(false);

    if (!success) {
      console.error("Could not reset the student profile.");
    }
  }

  return (
    <div>
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">YOUR SCHOOLSYNC</p>
          <h1>My Profile</h1>
          <p className="subtitle">
            Personalize your SchoolSync experience with your student
            information, interests, and goals.
          </p>
        </div>
      </header>

      <section className="profile-hero">
        <div className="profile-avatar">
          <User size={34} />
        </div>

        <div>
          <p className="eyebrow">STUDENT PROFILE</p>
          <h2>{profile.name.trim() || "Welcome to SchoolSync"}</h2>
          <p>
            {profile.grade
              ? `${profile.grade} student`
              : "Complete your profile to personalize SchoolSync."}
          </p>
        </div>
      </section>

      <form className="profile-form-card" onSubmit={saveProfile}>
        <div className="profile-section-heading">
          <User size={21} />
          <div>
            <h2>Basic information</h2>
            <p>Tell SchoolSync a little about yourself.</p>
          </div>
        </div>

        <div className="profile-grid">
          <label className="profile-field">
            Name
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={updateProfile}
              placeholder="Your name"
              maxLength={100}
            />
          </label>

          <label className="profile-field">
            Grade
            <select
              name="grade"
              value={profile.grade}
              onChange={updateProfile}
            >
              <option value="">Select grade</option>
              <option value="9th grade">9th grade</option>
              <option value="10th grade">10th grade</option>
              <option value="11th grade">11th grade</option>
              <option value="12th grade">12th grade</option>
            </select>
          </label>

          <label className="profile-field profile-wide">
            School
            <input
              type="text"
              name="school"
              value={profile.school}
              onChange={updateProfile}
              placeholder="Your school"
              maxLength={150}
            />
          </label>
        </div>

        <div className="profile-section-heading">
          <Heart size={21} />
          <div>
            <h2>Interests &amp; goals</h2>
            <p>
              These can help personalize your SchoolSync recommendations.
            </p>
          </div>
        </div>

        <div className="profile-grid">
          <label className="profile-field profile-wide">
            Interests
            <textarea
              name="interests"
              value={profile.interests}
              onChange={updateProfile}
              placeholder="Examples: robotics, cybersecurity, medicine, art, business..."
              rows={4}
              maxLength={500}
            />
          </label>

          <label className="profile-field profile-wide">
            Goals
            <textarea
              name="goals"
              value={profile.goals}
              onChange={updateProfile}
              placeholder="Examples: find scholarships, prepare for college, join a club..."
              rows={4}
              maxLength={500}
            />
          </label>
        </div>

        <div className="profile-actions">
          <button
            type="button"
            className="profile-reset-button"
            onClick={resetProfile}
          >
            <RotateCcw size={17} />
            Reset
          </button>

          <button type="submit" className="profile-save-button">
            <Save size={17} />
            Save profile
          </button>
        </div>

        {saved && (
          <p className="profile-saved-message" role="status">
            Your profile was saved on this device.
          </p>
        )}
      </form>

      <div className="profile-info-grid">
        <article className="profile-info-card">
          <GraduationCap size={23} />
          <h3>College planning</h3>
          <p>
            Your interests and goals can help SchoolSync suggest relevant
            college resources.
          </p>
        </article>

        <article className="profile-info-card">
          <School size={23} />
          <h3>School community</h3>
          <p>
            Your profile can connect with clubs, events, and opportunities
            at your school.
          </p>
        </article>

        <article className="profile-info-card">
          <Heart size={23} />
          <h3>Personalized experience</h3>
          <p>
            Your preferences can help make your dashboard more useful.
          </p>
        </article>
      </div>

      <p className="demo-notice">
        Your profile is currently stored in this browser on this device.
        SchoolSync does not have accounts or cloud synchronization yet.
      </p>
    </div>
  );
}

export default Profile;
