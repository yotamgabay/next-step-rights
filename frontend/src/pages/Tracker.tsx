import { useEffect, useMemo, useState, type JSX } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase';
import { useAuth } from '../hooks/useAuth';
import { colors, maxWidth } from '../theme';
import { PlusIcon, TrashIcon } from '../components/icons';

type Status = 'todo' | 'in_progress' | 'done';

interface Task {
  id: string;
  tracked_right_id: string;
  title: string;
  status: Status;
  is_custom: boolean;
}

interface TrackedRight {
  id: string;
  right_id: string;
  title: string;
  provider_authority: string;
}

const STATUSES: { key: Status; label: string }[] = [
  { key: 'todo', label: 'לביצוע' },
  { key: 'in_progress', label: 'בתהליך' },
  { key: 'done', label: 'הושלם' },
];

/** Tint / text colours per status, reused by columns, pills and the control. */
function statusColors(status: Status): { bg: string; fg: string; border: string } {
  switch (status) {
    case 'todo':
      return { bg: colors.blueTint, fg: colors.headerBlue, border: colors.blueTintBorder };
    case 'in_progress':
      return { bg: colors.orangeTint, fg: colors.orangeDeep, border: colors.orangeTintBorder };
    case 'done':
      return { bg: colors.greenTint, fg: colors.green, border: '#B7E4BF' };
  }
}

/** Resize-reactive viewport check (no stale one-shot read of innerWidth). */
function useIsMobile(): boolean {
  const query = '(max-width: 760px)';
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent): void => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

export function Tracker(): JSX.Element {
  const navigate = useNavigate();
  const { session, user, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();

  const [trackedRights, setTrackedRights] = useState<TrackedRight[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const uid = user?.id;

  useEffect(() => {
    let active = true;
    async function load(): Promise<void> {
      if (!uid) {
        setLoading(false);
        return;
      }
      try {
        const [{ data: trackedData, error: tErr }, { data: taskData, error: kErr }] =
          await Promise.all([
            supabase
              .from('user_tracked_rights')
              .select('id, right_id, rights(title, provider_authority)')
              .eq('user_id', uid)
              .order('created_at', { ascending: true }),
            supabase
              .from('user_tasks')
              .select('id, tracked_right_id, title, status, is_custom')
              .eq('user_id', uid)
              .order('created_at', { ascending: true }),
          ]);
        if (tErr) throw tErr;
        if (kErr) throw kErr;
        if (!active) return;

        const mapped: TrackedRight[] = (trackedData ?? []).map((row: Record<string, unknown>) => {
          const r = row.rights as { title?: string; provider_authority?: string } | Array<{ title?: string; provider_authority?: string }> | null;
          const right = Array.isArray(r) ? r[0] : r;
          return {
            id: row.id as string,
            right_id: row.right_id as string,
            title: right?.title ?? 'זכות',
            provider_authority: right?.provider_authority ?? '',
          };
        });
        setTrackedRights(mapped);
        setTasks((taskData as Task[]) ?? []);
      } catch (err) {
        console.error('Error loading tracker:', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [uid]);

  // --- Mutations -----------------------------------------------------------

  async function changeStatus(taskId: string, status: Status): Promise<void> {
    const prev = tasks;
    setTasks((ts) => ts.map((t) => (t.id === taskId ? { ...t, status } : t)));
    const { error } = await supabase.from('user_tasks').update({ status }).eq('id', taskId);
    if (error) {
      console.error('Error updating task status:', error);
      setTasks(prev); // revert
    }
  }

  async function deleteTask(taskId: string): Promise<void> {
    const prev = tasks;
    setTasks((ts) => ts.filter((t) => t.id !== taskId));
    const { error } = await supabase.from('user_tasks').delete().eq('id', taskId);
    if (error) {
      console.error('Error deleting task:', error);
      setTasks(prev); // revert
    }
  }

  async function addCustomTask(trackedRightId: string, title: string): Promise<void> {
    const trimmed = title.trim();
    if (!trimmed || !uid) return;
    const { data, error } = await supabase
      .from('user_tasks')
      .insert({
        user_id: uid,
        tracked_right_id: trackedRightId,
        title: trimmed,
        status: 'todo',
        is_custom: true,
      })
      .select('id, tracked_right_id, title, status, is_custom')
      .single();
    if (error || !data) {
      console.error('Error adding task:', error);
      return;
    }
    setTasks((ts) => [...ts, data as Task]);
  }

  // --- Guards / loading ----------------------------------------------------

  if (!authLoading && !session) return <Navigate to="/login" replace />;

  if (loading || authLoading) {
    return (
      <div style={{ maxWidth, margin: '0 auto', padding: '56px 24px', color: colors.textMuted, fontSize: 16 }}>
        טוען את המעקב שלך...
      </div>
    );
  }

  return (
    <div style={{ maxWidth, margin: '0 auto', padding: isMobile ? '32px 16px 24px' : '48px 24px' }}>
      <h1
        style={{
          fontSize: 'clamp(26px,3vw,34px)',
          color: colors.darkBlue,
          fontWeight: 800,
          margin: '0 0 8px',
        }}
      >
        המעקב שלי
      </h1>
      <p style={{ fontSize: 18, color: colors.textMuted, margin: '0 0 36px', maxWidth: 680, lineHeight: 1.5 }}>
        כאן מנהלים את ההתקדמות במימוש הזכויות: כל משימה ניתנת לסימון כ"לביצוע", "בתהליך" או "הושלם", ואפשר להוסיף משימות משלך.
      </p>

      {trackedRights.length === 0 ? (
        <EmptyState onGoToRights={() => navigate('/rights')} />
      ) : isMobile ? (
        <MobileAccordion
          trackedRights={trackedRights}
          tasks={tasks}
          onChangeStatus={changeStatus}
          onDeleteTask={deleteTask}
          onAddTask={addCustomTask}
        />
      ) : (
        <DesktopBoard
          trackedRights={trackedRights}
          tasks={tasks}
          onChangeStatus={changeStatus}
          onDeleteTask={deleteTask}
          onAddTask={addCustomTask}
        />
      )}
    </div>
  );
}

// ===========================================================================
// Empty state
// ===========================================================================

function EmptyState({ onGoToRights }: { onGoToRights: () => void }): JSX.Element {
  return (
    <div
      style={{
        background: colors.blueTint,
        border: `1px solid ${colors.blueTintBorder}`,
        borderRadius: 16,
        padding: '36px 28px',
        textAlign: 'center',
      }}
    >
      <p style={{ fontSize: 18, color: colors.darkBlue, fontWeight: 700, margin: '0 0 8px' }}>
        עדיין לא הוספת זכויות למעקב
      </p>
      <p style={{ fontSize: 16, color: colors.textMuted, margin: '0 0 22px', lineHeight: 1.5 }}>
        עברו לרשימת הזכויות המגיעות לכם, ולחצו "הוסף למעקב" כדי לקבל רשימת משימות מוכנה לכל זכות.
      </p>
      <button
        onClick={onGoToRights}
        style={{
          minHeight: 44,
          padding: '12px 28px',
          border: 'none',
          borderRadius: 24,
          background: colors.orange,
          color: colors.white,
          fontSize: 16,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        לזכויות שלי
      </button>
    </div>
  );
}

// ===========================================================================
// Shared task helpers
// ===========================================================================

interface TaskActions {
  onChangeStatus: (taskId: string, status: Status) => void;
  onDeleteTask: (taskId: string) => void;
}

function DeleteTaskButton({ task, onDeleteTask }: { task: Task } & Pick<TaskActions, 'onDeleteTask'>): JSX.Element {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={() => onDeleteTask(task.id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      aria-label={`מחק/י את המשימה: ${task.title}`}
      title="מחיקת משימה"
      style={{
        flex: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        borderRadius: 9,
        border: 'none',
        background: hover ? colors.errorBg : 'transparent',
        color: hover ? colors.error : colors.textFaint,
        cursor: 'pointer',
        transition: 'background .15s, color .15s',
      }}
    >
      <TrashIcon size={18} />
    </button>
  );
}

/** Small right-context label so a task card reads on its own in the board. */
function RightChip({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <span
      style={{
        alignSelf: 'flex-start',
        background: colors.sectionBg,
        color: colors.textMuted,
        fontSize: 12.5,
        fontWeight: 600,
        padding: '3px 9px',
        borderRadius: 12,
        lineHeight: 1.3,
      }}
    >
      {children}
    </span>
  );
}

// ===========================================================================
// Desktop: Kanban board with click-to-move
// ===========================================================================

interface BoardProps extends TaskActions {
  trackedRights: TrackedRight[];
  tasks: Task[];
  onAddTask: (trackedRightId: string, title: string) => void;
}

function DesktopBoard({ trackedRights, tasks, onChangeStatus, onDeleteTask, onAddTask }: BoardProps): JSX.Element {
  const rightById = useMemo(
    () => new Map(trackedRights.map((r) => [r.id, r])),
    [trackedRights],
  );

  return (
    <>
      <AddTaskBar trackedRights={trackedRights} onAddTask={onAddTask} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          alignItems: 'start',
        }}
      >
        {STATUSES.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          const c = statusColors(col.key);
          return (
            <section
              key={col.key}
              aria-label={`עמודת ${col.label}`}
              style={{
                background: colors.sectionBg,
                borderRadius: 14,
                padding: 12,
                minHeight: 120,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  padding: '4px 6px 12px',
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 700, color: colors.darkBlue }}>{col.label}</span>
                <span
                  style={{
                    background: c.bg,
                    color: c.fg,
                    fontSize: 13,
                    fontWeight: 700,
                    borderRadius: 11,
                    padding: '2px 9px',
                    minWidth: 24,
                    textAlign: 'center',
                  }}
                >
                  {colTasks.length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {colTasks.length === 0 ? (
                  <p style={{ color: colors.textFaint, fontSize: 14, padding: '6px 6px 10px', margin: 0 }}>
                    אין משימות כאן
                  </p>
                ) : (
                  colTasks.map((task) => (
                    <DesktopCard
                      key={task.id}
                      task={task}
                      rightTitle={rightById.get(task.tracked_right_id)?.title ?? ''}
                      onChangeStatus={onChangeStatus}
                      onDeleteTask={onDeleteTask}
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

function DesktopCard({
  task,
  rightTitle,
  onChangeStatus,
  onDeleteTask,
}: { task: Task; rightTitle: string } & TaskActions): JSX.Element {
  return (
    <article
      style={{
        background: colors.white,
        border: `1px solid ${colors.borderSoft}`,
        borderRadius: 12,
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        boxShadow: '0 1px 2px rgba(13,61,94,.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        {rightTitle ? <RightChip>{rightTitle}</RightChip> : <span />}
        <DeleteTaskButton task={task} onDeleteTask={onDeleteTask} />
      </div>
      <span style={{ fontSize: 15, color: colors.text, lineHeight: 1.45, fontWeight: 600 }}>{task.title}</span>
      <StatusControl task={task} onChangeStatus={onChangeStatus} />
    </article>
  );
}

function AddTaskBar({
  trackedRights,
  onAddTask,
}: {
  trackedRights: TrackedRight[];
  onAddTask: (trackedRightId: string, title: string) => void;
}): JSX.Element {
  const [rightId, setRightId] = useState(trackedRights[0]?.id ?? '');
  const [title, setTitle] = useState('');

  const submit = (): void => {
    if (!rightId || !title.trim()) return;
    onAddTask(rightId, title);
    setTitle('');
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      style={{
        display: 'flex',
        gap: 10,
        flexWrap: 'wrap',
        alignItems: 'center',
        background: colors.white,
        border: `1px solid ${colors.borderSoft}`,
        borderRadius: 12,
        padding: 12,
        marginBottom: 18,
      }}
    >
      <label htmlFor="add-task-right" style={{ fontSize: 14, fontWeight: 600, color: colors.textMuted }}>
        משימה חדשה עבור:
      </label>
      <select
        id="add-task-right"
        value={rightId}
        onChange={(e) => setRightId(e.target.value)}
        style={{
          minHeight: 44,
          padding: '0 12px',
          borderRadius: 10,
          border: `1px solid ${colors.border}`,
          background: colors.white,
          color: colors.text,
          fontSize: 15,
          cursor: 'pointer',
        }}
      >
        {trackedRights.map((r) => (
          <option key={r.id} value={r.id}>
            {r.title}
          </option>
        ))}
      </select>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="תיאור המשימה..."
        aria-label="תיאור המשימה החדשה"
        style={{
          flex: 1,
          minWidth: 180,
          minHeight: 44,
          padding: '0 14px',
          borderRadius: 10,
          border: `1px solid ${colors.border}`,
          fontSize: 15,
        }}
      />
      <button
        type="submit"
        disabled={!title.trim()}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          minHeight: 44,
          padding: '0 18px',
          borderRadius: 22,
          border: 'none',
          background: title.trim() ? colors.headerBlue : colors.disabledControl,
          color: colors.white,
          fontSize: 15,
          fontWeight: 700,
          cursor: title.trim() ? 'pointer' : 'not-allowed',
        }}
      >
        <PlusIcon size={18} color={colors.white} />
        הוסף משימה
      </button>
    </form>
  );
}

// ===========================================================================
// Mobile: vertical accordion grouped by right
// ===========================================================================

function MobileAccordion({ trackedRights, tasks, onChangeStatus, onDeleteTask, onAddTask }: BoardProps): JSX.Element {
  const [openId, setOpenId] = useState<string | null>(trackedRights[0]?.id ?? null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {trackedRights.map((right) => {
        const rightTasks = tasks.filter((t) => t.tracked_right_id === right.id);
        const done = rightTasks.filter((t) => t.status === 'done').length;
        const open = openId === right.id;
        const panelId = `tracker-panel-${right.id}`;
        return (
          <section
            key={right.id}
            style={{
              background: colors.white,
              border: `1px solid ${colors.borderSoft}`,
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            <h2 style={{ margin: 0 }}>
              <button
                onClick={() => setOpenId(open ? null : right.id)}
                aria-expanded={open}
                aria-controls={panelId}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '16px 16px',
                  textAlign: 'right',
                }}
              >
                <span style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                  <span style={{ fontSize: 16.5, fontWeight: 700, color: colors.darkBlue, lineHeight: 1.3 }}>
                    {right.title}
                  </span>
                  <span style={{ fontSize: 13.5, color: colors.textMuted }}>
                    {done}/{rightTasks.length} הושלמו
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  style={{
                    flex: 'none',
                    fontSize: 18,
                    color: colors.headerBlue,
                    transform: open ? 'rotate(-90deg)' : 'rotate(0deg)',
                    transition: 'transform .2s',
                  }}
                >
                  ‹
                </span>
              </button>
            </h2>
            <div id={panelId} hidden={!open} style={{ padding: open ? '0 14px 14px' : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {rightTasks.map((task) => (
                  <MobileTaskRow
                    key={task.id}
                    task={task}
                    onChangeStatus={onChangeStatus}
                    onDeleteTask={onDeleteTask}
                  />
                ))}
              </div>
              <MobileAddTask trackedRightId={right.id} onAddTask={onAddTask} />
            </div>
          </section>
        );
      })}
    </div>
  );
}

function MobileTaskRow({ task, onChangeStatus, onDeleteTask }: { task: Task } & TaskActions): JSX.Element {
  return (
    <div
      style={{
        background: colors.sectionBg,
        borderRadius: 12,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 15, color: colors.text, lineHeight: 1.45, fontWeight: 600 }}>{task.title}</span>
        <DeleteTaskButton task={task} onDeleteTask={onDeleteTask} />
      </div>
      <StatusControl task={task} onChangeStatus={onChangeStatus} />
    </div>
  );
}

/**
 * 3-state segmented control: לביצוע / בתהליך / הושלם, laid out right→left so the
 * segments sit in the same positions as the board columns. The active stage is
 * filled ("you are here"); tapping another segment moves the task there — its
 * position is the affordance, so no directional arrows are needed.
 */
function StatusControl({ task, onChangeStatus }: { task: Task } & Pick<TaskActions, 'onChangeStatus'>): JSX.Element {
  return (
    <div
      role="group"
      aria-label={`סטטוס המשימה: ${task.title}`}
      style={{
        display: 'flex',
        background: colors.white,
        border: `1px solid ${colors.border}`,
        borderRadius: 10,
        padding: 3,
        gap: 3,
      }}
    >
      {STATUSES.map((s) => (
        <SegmentButton
          key={s.key}
          status={s.key}
          label={s.label}
          active={task.status === s.key}
          taskTitle={task.title}
          onClick={() => onChangeStatus(task.id, s.key)}
        />
      ))}
    </div>
  );
}

function SegmentButton({
  status,
  label,
  active,
  taskTitle,
  onClick,
}: {
  status: Status;
  label: string;
  active: boolean;
  taskTitle: string;
  onClick: () => void;
}): JSX.Element {
  const [hover, setHover] = useState(false);
  const c = statusColors(status);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      aria-pressed={active}
      aria-label={active ? `${label} (הסטטוס הנוכחי)` : `העבר/י את "${taskTitle}" ל${label}`}
      style={{
        flex: 1,
        minHeight: 40,
        border: 'none',
        borderRadius: 8,
        // Active = filled tint (current stage); inactive = quiet, lighting up on
        // hover/focus so it clearly reads as a click target on desktop.
        background: active ? c.bg : hover ? colors.sectionBg : 'transparent',
        color: active ? c.fg : hover ? c.fg : colors.textMuted,
        fontSize: 14,
        fontWeight: active ? 700 : 600,
        cursor: active ? 'default' : 'pointer',
        transition: 'background .15s, color .15s',
      }}
    >
      {label}
    </button>
  );
}

function MobileAddTask({
  trackedRightId,
  onAddTask,
}: {
  trackedRightId: string;
  onAddTask: (trackedRightId: string, title: string) => void;
}): JSX.Element {
  const [title, setTitle] = useState('');
  const submit = (): void => {
    if (!title.trim()) return;
    onAddTask(trackedRightId, title);
    setTitle('');
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      style={{ display: 'flex', gap: 8, marginTop: 12 }}
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="הוספת משימה משלך..."
        aria-label="הוספת משימה משלך"
        style={{
          flex: 1,
          minHeight: 44,
          padding: '0 14px',
          borderRadius: 10,
          border: `1px solid ${colors.border}`,
          fontSize: 15,
        }}
      />
      <button
        type="submit"
        disabled={!title.trim()}
        aria-label="הוסף משימה"
        style={{
          flex: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 44,
          height: 44,
          borderRadius: 12,
          border: 'none',
          background: title.trim() ? colors.headerBlue : colors.disabledControl,
          color: colors.white,
          cursor: title.trim() ? 'pointer' : 'not-allowed',
        }}
      >
        <PlusIcon size={20} color={colors.white} />
      </button>
    </form>
  );
}
