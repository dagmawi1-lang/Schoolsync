
import { useEffect, useState } from "react";
import {
  Bell,
  Megaphone,
  CalendarDays,
  GraduationCap,
  DollarSign,
  CheckCheck,
  Trash2,
  Inbox
} from "lucide-react";
import { readStorage, writeStorage } from "../data/storage";

const STORAGE_KEY = "schoolsync-notifications";
const SETTINGS_KEY = "schoolsync-settings";

const defaultNotifications = [];

const defaultSettings = {
  notifications: true,
  announcements: true,
  events: true,
  scholarships: true,
  opportunities: true
};

const typeSettings = {
  announcement: "announcements",
  event: "events",
  scholarship: "scholarships",
  opportunity: "opportunities"
};

const typeIcons = {
  announcement: Megaphone,
  event: CalendarDays,
  college: GraduationCap,
  scholarship: DollarSign,
  opportunity: GraduationCap
};

function loadJSON(key, fallback) {
  return readStorage(key, fallback);
}

function Notifications() {
  const [notifications, setNotifications] = useState(() =>
    loadJSON(STORAGE_KEY, defaultNotifications)
  );

  const [settings, setSettings] = useState(() => ({
    ...defaultSettings,
    ...loadJSON(SETTINGS_KEY, {})
  }));

  useEffect(() => {
    writeStorage(STORAGE_KEY, notifications);
  }, [notifications]);

  useEffect(() => {
    const syncSettings = () => {
      setSettings({
        ...defaultSettings,
        ...loadJSON(SETTINGS_KEY, {})
      });
    };

    window.addEventListener("focus", syncSettings);
    window.addEventListener("storage", syncSettings);

    return () => {
      window.removeEventListener("focus", syncSettings);
      window.removeEventListener("storage", syncSettings);
    };
  }, []);

  const visibleNotifications = settings.notifications
    ? notifications.filter((notification) => {
        const settingKey = typeSettings[notification.type];

        return !settingKey || settings[settingKey] !== false;
      })
    : [];

  const unreadCount = visibleNotifications.filter(
    (notification) => !notification.read
  ).length;

  const markAsRead = (id) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    const visibleIds = new Set(
      visibleNotifications.map((notification) => notification.id)
    );

    setNotifications((current) =>
      current.map((notification) =>
        visibleIds.has(notification.id)
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const deleteNotification = (id) => {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== id)
    );
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">STAY UP TO DATE</p>
          <h1>Notifications</h1>
          <p className="subtitle">
            Your important updates in one place.
          </p>
        </div>
      </header>

      <section className="notifications-summary">
        <div>
          <strong>{unreadCount}</strong>
          <span>unread notifications</span>
        </div>

        <button
          type="button"
          className="mark-all-button"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
        >
          <CheckCheck size={17} />
          Mark all as read
        </button>
      </section>

      {!settings.notifications && (
        <div className="demo-notice">
          Notifications are disabled in Settings. Turn them back on to
          see your updates.
        </div>
      )}

      <div className="notifications-list">
        {visibleNotifications.map((notification) => {
          const Icon = typeIcons[notification.type] || Bell;

          return (
            <article
              key={notification.id}
              className={`notification-card ${
                notification.read ? "notification-read" : ""
              }`}
            >
              <div className={`notification-icon ${notification.type}`}>
                <Icon size={21} />
              </div>

              <div className="notification-content">
                <div className="notification-top">
                  <strong>{notification.title}</strong>
                  {!notification.read && (
                    <span className="notification-unread-dot" />
                  )}
                </div>

                <p>{notification.message}</p>
                <small>{notification.date}</small>

                <div className="notification-actions">
                  {!notification.read && (
                    <button
                      type="button"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark as read
                    </button>
                  )}

                  <button
                    type="button"
                    className="notification-delete"
                    onClick={() => deleteNotification(notification.id)}
                    aria-label={`Delete ${notification.title}`}
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {settings.notifications && visibleNotifications.length === 0 && (
        <div className="notifications-empty">
          <Inbox size={34} />
          <h2>You're all caught up</h2>
          <p>No notifications match your current preferences.</p>
        </div>
      )}

      <p className="demo-notice">
        New notifications will appear here as SchoolSync features generate them.
      </p>
    </div>
  );
}

export default Notifications;
