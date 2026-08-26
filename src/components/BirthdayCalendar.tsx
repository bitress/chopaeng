import React, { useMemo } from 'react';
import { playChimeClick } from '../utils/kkAudioSynthesizer';

interface BirthdayEntry {
    name: string;
    icon: string;
    birthday: string; // "M/D" format
    personality?: string;
    species?: string;
    isNpc?: boolean;
}

interface BirthdayCalendarProps {
    entries: BirthdayEntry[];
    selectedMonth: number; // 0-indexed
    onMonthChange: (month: number) => void;
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FALLBACK_IMAGE = 'https://acnhcdn.com/latest/FtrIcon/FtrLeaf.png';

const parseBirthday = (birthday: string): { month: number; day: number } | null => {
    const parts = birthday.split('/');
    if (parts.length !== 2) return null;
    const month = parseInt(parts[0]);
    const day = parseInt(parts[1]);
    if (isNaN(month) || isNaN(day)) return null;
    return { month, day }; // month is 1-indexed
};

const BirthdayCalendar: React.FC<BirthdayCalendarProps> = ({ entries, selectedMonth, onMonthChange }) => {
    const today = useMemo(() => new Date(), []);
    const currentMonth = today.getMonth(); // 0-indexed
    const currentDay = today.getDate();

    // Filter entries for the selected month
    const monthEntries = useMemo(() => {
        return entries
            .map(entry => {
                const parsed = parseBirthday(entry.birthday);
                if (!parsed) return null;
                return { ...entry, parsedMonth: parsed.month, parsedDay: parsed.day };
            })
            .filter(e => e !== null && e.parsedMonth === selectedMonth + 1)
            .sort((a, b) => a!.parsedDay - b!.parsedDay) as (BirthdayEntry & { parsedMonth: number; parsedDay: number })[];
    }, [entries, selectedMonth]);

    // Today's birthdays
    const todayBirthdays = useMemo(() => {
        return entries
            .map(entry => {
                const parsed = parseBirthday(entry.birthday);
                if (!parsed) return null;
                return { ...entry, parsedMonth: parsed.month, parsedDay: parsed.day };
            })
            .filter(e => e !== null && e.parsedMonth === currentMonth + 1 && e.parsedDay === currentDay) as (BirthdayEntry & { parsedMonth: number; parsedDay: number })[];
    }, [entries, currentMonth, currentDay]);

    return (
        <div>
            {/* Today's Birthdays Spotlight */}
            {todayBirthdays.length > 0 && (
                <div className="ac-spotlight-box mb-4 animate-up">
                    <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                        <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-warning text-dark rounded-pill px-3 py-2 fw-black text-uppercase tracking-wider" style={{ fontSize: '0.75rem' }}>
                                <i className="fa-solid fa-cake-candles me-1" aria-hidden="true" /> Today's Birthdays
                            </span>
                            <span className="tiny-text fw-bold text-muted">
                                {today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                            </span>
                        </div>
                        <span className="badge bg-white text-dark border rounded-pill px-3 py-1 fw-bold tiny-text">
                            {todayBirthdays.length} {todayBirthdays.length === 1 ? 'celebration' : 'celebrations'}
                        </span>
                    </div>

                    <div className="d-flex flex-wrap gap-2">
                        {todayBirthdays.map((entry, i) => (
                            <div key={i} className="ac-spotlight-chip">
                                <img
                                    src={entry.icon}
                                    alt={entry.name}
                                    className="rounded-circle flex-shrink-0"
                                    style={{ width: 44, height: 44, objectFit: 'contain', backgroundColor: '#f8fafc', padding: 2 }}
                                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
                                />
                                <div>
                                    <div className="fw-black text-dark" style={{ fontSize: '0.88rem' }}>{entry.name}</div>
                                    <div className="tiny-text text-muted fw-bold">
                                        {entry.species ? entry.species : (entry.isNpc ? 'Special NPC' : '')}
                                        {entry.personality && ` · ${entry.personality}`}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Month Selector */}
            <div className="text-center mb-4">
                <div className="ac-nav-tabs-pill d-inline-flex flex-wrap justify-content-center">
                    {MONTH_SHORT.map((month, idx) => {
                        const isSelected = selectedMonth === idx;
                        const isCurrent = idx === currentMonth;
                        return (
                            <button
                                key={month}
                                type="button"
                                className={`ac-tab-btn ${isSelected ? 'active' : ''}`}
                                style={!isSelected && isCurrent ? { border: '1.5px solid var(--nook-green)', color: 'var(--nook-green)' } : undefined}
                                onClick={() => { playChimeClick(); onMonthChange(idx); }}
                            >
                                <span>{month}</span>
                                {isCurrent && !isSelected && (
                                    <span className="d-inline-block rounded-circle bg-success" style={{ width: 5, height: 5 }} />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="d-flex align-items-center justify-content-between mb-3 px-1">
                <h3 className="h6 fw-black text-dark mb-0 ac-font">
                    <i className="fa-solid fa-calendar-heart text-danger me-2" aria-hidden="true" />
                    {MONTH_NAMES[selectedMonth]} Birthdays
                </h3>
                <span className="badge bg-light text-muted border rounded-pill px-3 py-1 fw-bold tiny-text">
                    {monthEntries.length} {monthEntries.length === 1 ? 'villager' : 'villagers'}
                </span>
            </div>

            {/* Birthday Grid */}
            {monthEntries.length === 0 ? (
                <div className="ac-filter-bar text-center py-5 text-muted animate-fade-in">
                    <i className="fa-solid fa-cake-candles fs-1 mb-2 opacity-50 text-warning" aria-hidden="true" />
                    <p className="fw-bold mb-0">No birthdays in {MONTH_NAMES[selectedMonth]}.</p>
                </div>
            ) : (
                <div className="row g-3">
                    {monthEntries.map((entry, idx) => {
                        const isToday = entry.parsedMonth === currentMonth + 1 && entry.parsedDay === currentDay;
                        return (
                            <div key={idx} className="col-6 col-md-4 col-lg-3">
                                <div className={`ac-grid-card ${isToday ? 'border-warning border-2' : ''}`} style={isToday ? { backgroundColor: '#fffdf5' } : undefined}>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="position-relative flex-shrink-0">
                                            <img
                                                src={entry.icon}
                                                alt={entry.name}
                                                className="rounded-circle"
                                                style={{ width: 44, height: 44, objectFit: 'contain', backgroundColor: '#f8fafc', padding: 2 }}
                                                onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
                                            />
                                        </div>
                                        <div className="min-w-0 flex-grow-1">
                                            <div className="fw-black text-dark text-truncate" style={{ fontSize: '0.9rem' }}>{entry.name}</div>
                                            <div className="d-flex align-items-center gap-1 mt-1 flex-wrap">
                                                <span className="badge bg-light text-dark border rounded-pill px-2 py-1 fw-bold" style={{ fontSize: '0.68rem' }}>
                                                    {MONTH_SHORT[entry.parsedMonth - 1]} {entry.parsedDay}
                                                </span>
                                                {isToday && (
                                                    <span className="badge bg-warning text-dark rounded-pill px-2 py-1 fw-black" style={{ fontSize: '0.65rem' }}>Today!</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {(entry.species || entry.personality) && (
                                        <div className="tiny-text text-muted mt-2 pt-2 border-top d-flex justify-content-between text-truncate">
                                            <span>{entry.species || (entry.isNpc ? 'Special NPC' : '')}</span>
                                            {entry.personality && <span className="fw-bold">{entry.personality}</span>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

};

export default BirthdayCalendar;
