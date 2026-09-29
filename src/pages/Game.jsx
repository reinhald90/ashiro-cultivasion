import { useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { logoutUser } from "../firebase/auth.js";
import { loadGame, saveGame } from "../firebase/saves.js";
import { initPlayer } from "../game/state.js";
import {
  meditate,
  qiPerSecond,
  canBreakthrough,
  tickAge,
} from "../game/systems/cultivation.js";
import {
  attemptBreakthrough,
  breakthroughChance,
} from "../game/systems/breakthrough.js";
import { applyOfflineProgress } from "../game/systems/offline.js";
import { getRealm, getSubLabel } from "../game/data/realms.js";
import { fmt, fmtAge, fmtTime } from "../game/format.js";
import BreakthroughScene from "../components/BreakthroughScene.jsx";

const AUTOSAVE_MS = 5000;

export default function Game() {
  const { user, profile } = useAuth();
  const [player, setPlayer] = useState(null);
  const [meditating, setMeditating] = useState(true);
  const [toast, setToast] = useState(null);
  const [offlineInfo, setOfflineInfo] = useState(null);
  const [btScene, setBtScene] = useState(null);

  const playerRef = useRef(null);
  const meditatingRef = useRef(true);

  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  useEffect(() => {
    meditatingRef.current = meditating;
  }, [meditating]);

  // ===== Load save + offline progress =====
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        console.log("[Game] Loading save for", user.uid);
        const saved = await loadGame(user.uid);
        const p = initPlayer(saved);
        if (!saved) p.name = profile?.username || "Cultivator";

        const off = applyOfflineProgress(p);
        if (off.gained > 0) setOfflineInfo(off);

        setPlayer(p);
        playerRef.current = p;
        console.log("[Game] Player ready:", p);
      } catch (err) {
        console.error("[Game] LOAD FAILED:", err);
        setToast({
          msg: `Load gagal: ${err.code || err.message || err}`,
          type: "danger",
        });
        const p = initPlayer(null);
        setPlayer(p);
        playerRef.current = p;
      }
    })();
  }, [user, profile]);

  // ===== Game tick (1 detik) =====
  useEffect(() => {
    const id = setInterval(() => {
      setPlayer((p) => {
        if (!p) return p;
        const next = { ...p };
        if (meditatingRef.current) meditate(next, 1);
        tickAge(next, 1);
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // ===== Autosave =====
  useEffect(() => {
    if (!user) return;
    const id = setInterval(async () => {
      if (!playerRef.current) return;
      try {
        await saveGame(user.uid, playerRef.current);
      } catch (err) {
        console.error("[Game] SAVE FAILED:", err);
        showToast(`Save gagal: ${err.code || err.message}`, "danger");
      }
    }, AUTOSAVE_MS);
    return () => clearInterval(id);
  }, [user]);

  // ===== Save saat keluar tab / background =====
  useEffect(() => {
    const saveNow = () => {
      if (user && playerRef.current) {
        saveGame(user.uid, playerRef.current).catch((err) => {
          console.error("[Game] SAVE-ON-EXIT FAILED:", err);
        });
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") saveNow();
    };
    window.addEventListener("beforeunload", saveNow);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("beforeunload", saveNow);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [user]);

  // ===== Helpers =====
  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleBreakthrough = async () => {
    if (!player) return;
    const next = { ...player };
    const result = attemptBreakthrough(next);
    setPlayer(next);
    playerRef.current = next;

    try {
      if (user) await saveGame(user.uid, next);
    } catch (err) {
      console.error("[Game] BREAKTHROUGH SAVE FAILED:", err);
      showToast(`Save gagal: ${err.code || err.message}`, "danger");
    }

    if (result.ok) {
      setBtScene({
        realmName: result.realmName,
        levelLabel: result.levelLabel,
        type: result.type,
      });
    } else {
      showToast(result.msg, "danger");
    }
  };

  const handleLogout = async () => {
    if (user && playerRef.current) {
      try {
        await saveGame(user.uid, playerRef.current);
      } catch (err) {
        console.error("[Game] LOGOUT SAVE FAILED:", err);
      }
    }
    await logoutUser();
  };

  // ===== Loading =====
  if (!player) {
    return (
      <div className="game-loading">
        <img src="/logo.png" alt="logo" />
        <p>Menyiapkan dunia kultivasi...</p>
      </div>
    );
  }

  // ===== Derived values =====
  const realm = getRealm(player.realm);
  const subLabel = getSubLabel(player.realm, player.subLevel);
  const qiPct = Math.min(100, (player.qi / player.maxQi) * 100);
  const ready = canBreakthrough(player);
  const qps = qiPerSecond(player);
  const chance = breakthroughChance(player);

  return (
    <div className="game-page">
      {/* HEADER */}
      <header className="game-header">
        <img src="/title-small.png" alt="Ashiro" className="game-title-img" />
        <div className="game-header-right">
          <span className="username">{profile?.username || player.name}</span>
          <button className="btn-icon" onClick={handleLogout} title="Logout">
            ⏏
          </button>
        </div>
      </header>

      {/* CHARACTER STAGE */}
      <div className="char-stage">
        <div className="char-glow" data-active={meditating} />
        <img
          src="/characters/cultivate.png"
          alt="Cultivator"
          className="char-img"
          data-meditating={meditating}
        />
        <div className="realm-badge">
          <span className="realm-name">{realm.name}</span>
          <span className="realm-sub">{subLabel}</span>
        </div>
      </div>

      {/* STATS */}
      <div className="stats-panel">
        <div className="stat-row">
          <div className="stat">
            <span className="stat-label">Umur</span>
            <span className="stat-value">{fmtAge(player.age)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Lifespan</span>
            <span className="stat-value">{player.lifespan} thn</span>
          </div>
          <div className="stat">
            <span className="stat-label">Spirit Stones</span>
            <span className="stat-value">{fmt(player.spiritStones)}</span>
          </div>
        </div>

        {/* QI BAR */}
        <div className="qi-bar-wrap">
          <div className="qi-bar-header">
            <span>Qi</span>
            <span>
              {fmt(player.qi)} / {fmt(player.maxQi)}
            </span>
          </div>
          <div className="qi-bar">
            <div className="qi-bar-fill" style={{ width: `${qiPct}%` }} />
          </div>
          <div className="qi-bar-footer">
            <span>+{fmt(qps)} Qi/detik</span>
            <span>{qiPct.toFixed(1)}%</span>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="actions">
          <button
            className={`btn btn-meditate ${meditating ? "active" : ""}`}
            onClick={() => setMeditating((m) => !m)}
          >
            {meditating ? "🧘 Sedang Meditasi" : "▶ Mulai Meditasi"}
          </button>

          <button
            className={`btn btn-breakthrough ${ready ? "ready" : ""}`}
            onClick={handleBreakthrough}
            disabled={!ready}
          >
            {ready
              ? `⚡ Breakthrough (${(chance * 100).toFixed(0)}%)`
              : "Qi Belum Penuh"}
          </button>
        </div>
      </div>

      {/* TOAST */}
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

      {/* OFFLINE MODAL */}
      {offlineInfo && (
        <div className="modal-backdrop" onClick={() => setOfflineInfo(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>🌙 Saat Kamu Pergi</h3>
            <p>
              Kamu bermeditasi selama <b>{fmtTime(offlineInfo.seconds)}</b> dan
              mendapatkan <b>{fmt(offlineInfo.gained)} Qi</b>.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => setOfflineInfo(null)}
            >
              Lanjutkan
            </button>
          </div>
        </div>
      )}

      {/* BREAKTHROUGH SCENE */}
      {btScene && (
        <BreakthroughScene
          result={btScene}
          onDone={async () => {
            if (user && playerRef.current) {
              try {
                await saveGame(user.uid, playerRef.current);
              } catch (err) {
                console.error("[Game] POST-BT SAVE FAILED:", err);
              }
            }
            showToast(`Berhasil! ${btScene.realmName}`, "success");
            setBtScene(null);
          }}
        />
      )}
    </div>
  );
}
