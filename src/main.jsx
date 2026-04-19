import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Award,
  Check,
  Dice5,
  EyeOff,
  Github,
  IdCard,
  ListChecks,
  RefreshCcw,
  Search,
  Sparkles,
  Trophy,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import './styles.css';

const STORAGE_KEY = 'introduce-bingo-v2';

const squarePool = [
  '高校時代の得意科目',
  '犬派/猫派',
  '海派/山派',
  '好きなプログラミング言語',
  'Python経験',
  'HTML/CSS経験',
  'Java経験',
  'C言語経験',
  'Gitを使ったことがある',
  'Web開発経験',
  'ゲーム開発経験',
  '好きなAI',
  '好きなVTuber',
  '好きな声優',
  '自分で何か作ったことがある',
  'アプリを作ってみたい',
  'AIに興味がある',
  'ゲーム開発に興味がある',
  '好きなゲーム',
  '朝方/夜型',
  'インドア/アウトドア',
  '好きな店',
  '好きなアニメ',
  '好きな漫画',
  '好きな小説',
  '好きな音楽',
  '好きなYouTuber',
  '推し',
  '旅行に行きたい場所',
  '挑戦したいこと',
  'プログラミング経験',
  'バイト先',
  '好きな食べ物',
  '好きな動物',
  '苦手なもの',
  '得意なこと',
  '好きな授業',
  '通学に1時間以上かかる',
  '出身地',
  '学科',
  '趣味',
  '人見知り',
  '友達増やしたい',
];

const seedProfiles = [
  {
    id: 'seed-mika',
    name: 'ミカ',
    department: '情報系',
    grade: '1年',
    sns: '',
    snsPublic: false,
    createdAt: '2026-04-01T00:00:00.000Z',
  },
  {
    id: 'seed-haru',
    name: 'ハル',
    department: 'デザイン系',
    grade: '1年',
    sns: '@haru_design',
    snsPublic: true,
    createdAt: '2026-04-01T00:00:00.000Z',
  },
  {
    id: 'seed-ren',
    name: 'レン',
    department: '工学系',
    grade: '2年',
    sns: '',
    snsPublic: false,
    createdAt: '2026-04-01T00:00:00.000Z',
  },
];

const newId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

function shuffle(items) {
  const copied = [...items];
  for (let i = copied.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }
  return copied;
}

function makeBoard() {
  return shuffle(squarePool)
    .slice(0, 25)
    .map((label, index) => ({ id: `square-${Date.now()}-${index}`, label }));
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      profile: saved.profile || null,
      profiles: saved.profiles?.length ? saved.profiles : seedProfiles,
      board: saved.board?.length === 25 ? saved.board : makeBoard(),
      achievements: saved.achievements || [],
    };
  } catch {
    return {
      profile: null,
      profiles: seedProfiles,
      board: makeBoard(),
      achievements: [],
    };
  }
}

async function postJson(path, body) {
  try {
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

function countBingos(board, achievements) {
  const done = new Set(achievements.map((item) => item.squareId));
  const lines = [];

  for (let row = 0; row < 5; row += 1) {
    lines.push([0, 1, 2, 3, 4].map((col) => row * 5 + col));
  }
  for (let col = 0; col < 5; col += 1) {
    lines.push([0, 1, 2, 3, 4].map((row) => row * 5 + col));
  }
  lines.push([0, 6, 12, 18, 24], [4, 8, 12, 16, 20]);

  return lines.filter((line) => line.every((index) => done.has(board[index]?.id))).length;
}

function profileFromApi(apiProfile) {
  return {
    id: apiProfile.id,
    name: apiProfile.name,
    department: apiProfile.department,
    grade: apiProfile.grade,
    sns: apiProfile.sns,
    snsPublic: apiProfile.sns_public,
    createdAt: apiProfile.created_at,
  };
}

function App() {
  const initialState = useMemo(loadState, []);
  const [profile, setProfile] = useState(initialState.profile);
  const [profiles, setProfiles] = useState(initialState.profiles);
  const [board, setBoard] = useState(initialState.board);
  const [achievements, setAchievements] = useState(initialState.achievements);
  const [activeSquare, setActiveSquare] = useState(null);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ profile, profiles, board, achievements }),
    );
  }, [profile, profiles, board, achievements]);

  useEffect(() => {
    fetch('/api/profiles')
      .then((response) => (response.ok ? response.json() : null))
      .then((apiProfiles) => {
        if (!Array.isArray(apiProfiles) || apiProfiles.length === 0) return;
        setProfiles((current) => {
          const merged = new Map(current.map((item) => [item.id, item]));
          apiProfiles.map(profileFromApi).forEach((item) => merged.set(item.id, item));
          return [...merged.values()];
        });
      })
      .catch(() => {});
  }, []);

  const profileAchievements = useMemo(
    () => achievements.filter((item) => item.ownerId === profile?.id),
    [achievements, profile],
  );
  const achievedSquareIds = useMemo(
    () => new Set(profileAchievements.map((item) => item.squareId)),
    [profileAchievements],
  );
  const collectionCount = useMemo(
    () => new Set(profileAchievements.map((item) => item.partnerId)).size,
    [profileAchievements],
  );
  const bingoCount = useMemo(
    () => countBingos(board, profileAchievements),
    [board, profileAchievements],
  );
  const ranking = useMemo(() => {
    const counts = new Map();
    achievements.forEach((item) => counts.set(item.ownerId, (counts.get(item.ownerId) || 0) + 1));
    if (profile && !counts.has(profile.id)) counts.set(profile.id, 0);

    return [...counts.entries()]
      .map(([profileId, count]) => ({
        profile: profiles.find((item) => item.id === profileId),
        count,
      }))
      .filter((row) => row.profile)
      .sort((a, b) => b.count - a.count);
  }, [achievements, profile, profiles]);

  const handleProfileSave = async (formProfile) => {
    const nextProfile = {
      id: profile?.id || newId(),
      ...formProfile,
      createdAt: profile?.createdAt || new Date().toISOString(),
    };

    setProfile(nextProfile);
    setProfiles((current) => {
      const withoutDuplicate = current.filter((item) => item.id !== nextProfile.id);
      return [nextProfile, ...withoutDuplicate];
    });

    const apiProfile = await postJson('/api/profiles', {
      id: nextProfile.id,
      name: nextProfile.name,
      department: nextProfile.department,
      grade: nextProfile.grade,
      sns: nextProfile.sns,
      sns_public: nextProfile.snsPublic,
      created_at: nextProfile.createdAt,
    });
    if (apiProfile) {
      setProfile(profileFromApi(apiProfile));
    }
  };

  const handleAchievement = async (partnerId) => {
    if (!profile || !activeSquare) return;
    const partner = profiles.find((item) => item.id === partnerId);
    if (!partner) return;

    const achievement = {
      id: newId(),
      ownerId: profile.id,
      partnerId,
      squareId: activeSquare.id,
      square: activeSquare.label,
      createdAt: new Date().toISOString(),
    };

    setAchievements((current) => {
      const withoutSameSquare = current.filter(
        (item) => !(item.ownerId === profile.id && item.squareId === activeSquare.id),
      );
      return [achievement, ...withoutSameSquare];
    });
    setActiveSquare(null);

    await postJson('/api/achievements', {
      owner_id: profile.id,
      partner_id: partnerId,
      square: activeSquare.label,
    });
  };

  const resetBoard = () => {
    setBoard(makeBoard());
    setAchievements((current) => current.filter((item) => item.ownerId !== profile?.id));
  };

  return (
    <main className="appShell">
      <section className="hero">
        <div className="heroCopy">
          <p className="eyebrow">
            <Sparkles size={16} />
            新入生歓迎会
          </p>
          <h1>自己紹介ビンゴ</h1>
          <p>
            マスのお題を話して、共通点が見つかったら相手のアカウントを選んで達成。
            一緒に達成した相手のプロフィールカードがコレクションされます。
          </p>
        </div>
        <div className="heroStats">
          <Stat icon={<ListChecks />} label="達成マス" value={`${profileAchievements.length}/25`} />
          <Stat icon={<Trophy />} label="ビンゴ数" value={bingoCount} />
          <Stat icon={<UsersRound />} label="コレクション" value={collectionCount} />
        </div>
      </section>

      <div className="layout">
        <section className="panel profilePanel">
          <ProfileForm profile={profile} onSave={handleProfileSave} />
          {profile && <AccountCard profile={profile} />}
        </section>

        <section className="panel bingoPanel">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">
                <Dice5 size={16} />
                5x5 ランダム
              </p>
              <h2>ビンゴカード</h2>
            </div>
            <button className="iconButton" type="button" onClick={resetBoard} aria-label="ビンゴを作り直す">
              <RefreshCcw size={20} />
            </button>
          </div>
          <div className="bingoGrid" aria-label="自己紹介ビンゴ">
            {board.map((square) => (
              <button
                type="button"
                className={`bingoSquare ${achievedSquareIds.has(square.id) ? 'done' : ''}`}
                key={square.id}
                onClick={() => profile && setActiveSquare(square)}
                disabled={!profile}
              >
                <span>{square.label}</span>
                {achievedSquareIds.has(square.id) && <Check size={22} />}
              </button>
            ))}
          </div>
          {!profile && <p className="hint">先にプロフィールを作ると、マスを達成できます。</p>}
        </section>

        <section className="panel">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">
                <UsersRound size={16} />
                Collection
              </p>
              <h2>プロフィールカード</h2>
            </div>
          </div>
          <CollectionList achievements={profileAchievements} profiles={profiles} />
        </section>

        <section className="panel">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">
                <Award size={16} />
                Ranking
              </p>
              <h2>ランキング</h2>
            </div>
          </div>
          <Ranking rows={ranking} currentProfileId={profile?.id} />
        </section>
      </div>

      {activeSquare && (
        <AchievementModal
          square={activeSquare}
          profiles={profiles.filter((item) => item.id !== profile?.id)}
          onClose={() => setActiveSquare(null)}
          onChoose={handleAchievement}
        />
      )}
    </main>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="stat">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ProfileForm({ profile, onSave }) {
  const [form, setForm] = useState({
    name: profile?.name || '',
    department: profile?.department || '',
    grade: profile?.grade || '',
    sns: profile?.sns || '',
    snsPublic: profile?.snsPublic || false,
  });

  useEffect(() => {
    setForm({
      name: profile?.name || '',
      department: profile?.department || '',
      grade: profile?.grade || '',
      sns: profile?.sns || '',
      snsPublic: profile?.snsPublic || false,
    });
  }, [profile]);

  return (
    <form
      className="profileForm"
      onSubmit={(event) => {
        event.preventDefault();
        if (!form.name.trim()) return;
        onSave({ ...form, name: form.name.trim() });
      }}
    >
      <div className="panelHeader">
        <div>
          <p className="eyebrow">
            <UserRound size={16} />
            Profile
          </p>
          <h2>プロフィール作成</h2>
        </div>
      </div>

      <label>
        名前
        <input
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          maxLength={40}
          placeholder="ニックネーム可"
          required
        />
      </label>

      <div className="twoColumns">
        <label>
          学科
          <input
            value={form.department}
            onChange={(event) => setForm({ ...form, department: event.target.value })}
            maxLength={60}
            placeholder="情報系など"
          />
        </label>
        <label>
          学年
          <input
            value={form.grade}
            onChange={(event) => setForm({ ...form, grade: event.target.value })}
            maxLength={20}
            placeholder="1年"
          />
        </label>
      </div>

      <label>
        SNS
        <input
          value={form.sns}
          onChange={(event) => setForm({ ...form, sns: event.target.value })}
          maxLength={80}
          placeholder="任意"
        />
      </label>

      <label className="switchRow">
        <input
          type="checkbox"
          checked={form.snsPublic}
          onChange={(event) => setForm({ ...form, snsPublic: event.target.checked })}
        />
        <span>SNSをプロフィールカードに表示する</span>
        {!form.snsPublic && <EyeOff size={18} />}
      </label>

      <button className="primaryButton" type="submit">
        <Check size={18} />
        保存
      </button>
    </form>
  );
}

function AccountCard({ profile }) {
  return (
    <div className="accountCard">
      <IdCard size={34} />
      <div>
        <span>あなたのアカウント</span>
        <strong>{profile.name}</strong>
        <code>{profile.id.slice(0, 8)}</code>
      </div>
    </div>
  );
}

function AchievementModal({ square, profiles, onClose, onChoose }) {
  const [query, setQuery] = useState('');
  const filteredProfiles = profiles.filter((profile) =>
    `${profile.name} ${profile.department} ${profile.grade}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="modalBackdrop" role="presentation">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="achievement-title">
        <div className="modalHeader">
          <div>
            <p className="eyebrow">誰と一緒？</p>
            <h2 id="achievement-title">{square.label}</h2>
          </div>
          <button className="iconButton" type="button" onClick={onClose} aria-label="閉じる">
            <X size={20} />
          </button>
        </div>

        <p className="modalLead">
          このお題が同じだった相手のアカウントを選ぶと、マス達成とプロフィールカードのコレクションが記録されます。
        </p>

        <label className="searchBox">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="相手を検索" />
        </label>

        <div className="choiceList">
          {filteredProfiles.map((profile) => (
            <button type="button" key={profile.id} onClick={() => onChoose(profile.id)}>
              <ProfileCard profile={profile} compact />
            </button>
          ))}
        </div>
        {!filteredProfiles.length && <p className="emptyText">該当するアカウントがありません。</p>}
      </div>
    </div>
  );
}

function CollectionList({ achievements, profiles }) {
  const collections = useMemo(() => {
    const grouped = new Map();
    achievements.forEach((achievement) => {
      const current = grouped.get(achievement.partnerId) || [];
      grouped.set(achievement.partnerId, [...current, achievement]);
    });

    return [...grouped.entries()]
      .map(([partnerId, items]) => ({
        profile: profiles.find((profile) => profile.id === partnerId),
        items,
      }))
      .filter((row) => row.profile);
  }, [achievements, profiles]);

  if (!collections.length) {
    return <p className="emptyText">まだプロフィールカードはありません。マスをクリックして相手を選ぶと集まります。</p>;
  }

  return (
    <div className="collectionList">
      {collections.map(({ profile, items }) => (
        <article className="collectionItem" key={profile.id}>
          <ProfileCard profile={profile} />
          <div className="badgeList">
            {items.map((item) => (
              <span key={item.id}>{item.square}</span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function ProfileCard({ profile, compact = false }) {
  return (
    <div className={`profileCard ${compact ? 'compact' : ''}`}>
      <div className="avatar">{profile.name.slice(0, 1)}</div>
      <div>
        <strong>{profile.name}</strong>
        <span>{profile.department || '学科未入力'} / {profile.grade || '学年未入力'}</span>
        {profile.snsPublic && profile.sns && (
          <small>
            <Github size={14} />
            {profile.sns}
          </small>
        )}
      </div>
    </div>
  );
}

function Ranking({ rows, currentProfileId }) {
  if (!rows.length) return <p className="emptyText">プロフィール作成後に表示されます。</p>;

  return (
    <ol className="rankingList">
      {rows.map((row, index) => (
        <li key={row.profile.id} className={row.profile.id === currentProfileId ? 'current' : ''}>
          <span className="rank">{index + 1}</span>
          <ProfileCard profile={row.profile} compact />
          <strong>{row.count}</strong>
        </li>
      ))}
    </ol>
  );
}

createRoot(document.getElementById('root')).render(<App />);
