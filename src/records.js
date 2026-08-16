/*
 * keystro.ke
 * Copyright (C) 2026 Mike O'Riley
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */

/**
 * ============================================================================
 * Records: local persistence for XP, streak, and badges
 * ============================================================================
 *
 * The sole owner of one localStorage key. Arcade sessions (src/game/Game.js)
 * and lesson sessions (src/lesson.js) already compute real per-session stats
 * today - they just got shown once on a results screen and discarded. This
 * module is where that data actually accumulates, so the main-menu HUD,
 * Lesson Hall's completion state, and the Records Room page can all read the
 * same real numbers instead of the hardcoded placeholders they used before.
 *
 * XP and levels only, never currency or cost-implying language - matches
 * every other gamification surface on this site.
 *
 * Wrapped in try/catch throughout: a storage failure (private browsing,
 * quota, disabled storage) degrades to an in-memory-only session rather than
 * breaking the app, matching this project's local-first, no-hard-dependency
 * spirit (see ARCHITECTURE.md).
 * ============================================================================
 */

const STORAGE_KEY = "keystroke.records.v1";
const XP_PER_LEVEL = 100;
const ARCADE_BASE_XP = 10;
const LESSON_COMPLETION_XP = 15;

function emptyRecords() {
    return {
        version: 1,
        xp: 0,
        streak: { current: 0, longest: 0, lastPlayedDate: null },
        lessonSessions: [],
        arcadeSessions: []
    };
}

function loadRaw() {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return emptyRecords();
        }

        const parsed = JSON.parse(stored);
        if (parsed && parsed.version === 1) {
            return parsed;
        }

        return emptyRecords();
    } catch (error) {
        return emptyRecords();
    }
}

function saveRaw(records) {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (error) {
        /* Storage unavailable or full; the in-memory value for this page
           load is still correct, it just won't survive a reload. */
    }
}

function todayDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function isYesterday(dateString, today) {
    const previousDay = new Date(`${today}T00:00:00`);
    previousDay.setDate(previousDay.getDate() - 1);

    const year = previousDay.getFullYear();
    const month = String(previousDay.getMonth() + 1).padStart(2, "0");
    const day = String(previousDay.getDate()).padStart(2, "0");

    return dateString === `${year}-${month}-${day}`;
}

function touchStreak(records) {
    const today = todayDateString();
    const { lastPlayedDate } = records.streak;

    if (lastPlayedDate === today) {
        return;
    }

    if (lastPlayedDate !== null && isYesterday(lastPlayedDate, today)) {
        records.streak.current += 1;
    } else {
        records.streak.current = 1;
    }

    records.streak.longest = Math.max(records.streak.longest, records.streak.current);
    records.streak.lastPlayedDate = today;
}

/**
 * Records one completed arcade session: appends it to the log, awards XP,
 * and updates the daily streak.
 */
export function recordArcadeSession({ stageId, score, highestCombo, completedWords, perfectWords, mistakes }) {
    const records = loadRaw();

    records.arcadeSessions.push({
        stageId,
        score,
        highestCombo,
        completedWords,
        perfectWords,
        mistakes,
        timestamp: Date.now()
    });

    records.xp += ARCADE_BASE_XP + completedWords;
    touchStreak(records);

    saveRaw(records);
}

/**
 * Records one lesson session. First-time completion of a given lessonId
 * awards XP; replays are still logged (useful for badge criteria and future
 * stats) but don't award XP again, so revisiting an already-completed
 * lesson to practice doesn't inflate level progress.
 */
export function recordLessonSession({ lessonId, wpm, accuracy, mistakes, completed }) {
    const records = loadRaw();
    const alreadyCompleted = records.lessonSessions.some(
        (session) => session.lessonId === lessonId && session.completed
    );

    records.lessonSessions.push({
        lessonId,
        wpm,
        accuracy,
        mistakes,
        completed,
        timestamp: Date.now()
    });

    if (completed && !alreadyCompleted) {
        records.xp += LESSON_COMPLETION_XP;
    }

    if (completed) {
        touchStreak(records);
    }

    saveRaw(records);
}

/**
 * Canonical badge list. Exactly 5 - matches the main-menu HUD's existing
 * fixed 5 badge slots (index.html), so no markup restructuring is needed
 * there; Records Room shows the same 5, just with room for a description.
 * Each check() runs against the object getRecords() returns.
 */
export const BADGES = [
    {
        id: "first-steps",
        name: "First Steps",
        description: "Complete your first lesson.",
        check: (records) => records.lessonSessions.some((session) => session.completed)
    },
    {
        id: "arcade-rookie",
        name: "Arcade Rookie",
        description: "Play your first arcade session.",
        check: (records) => records.arcadeSessions.length > 0
    },
    {
        id: "home-row-hero",
        name: "Home Row Hero",
        description: "Complete both Home Row lessons.",
        check: (records) =>
            records.completedLessonIds.has("home-row") && records.completedLessonIds.has("home-row-2")
    },
    {
        id: "on-a-roll",
        name: "On a Roll",
        description: "Reach a 3-day streak.",
        check: (records) => records.streak.longest >= 3
    },
    {
        id: "perfect-run",
        name: "Perfect Run",
        description: "Finish an arcade session with zero mistakes.",
        check: (records) => records.arcadeSessions.some((session) => session.mistakes === 0)
    }
];

/**
 * Returns the stored records plus everything derived from them: level,
 * progress within the current level, the set of completed lesson ids, and
 * which badges are currently earned.
 */
export function getRecords() {
    const records = loadRaw();

    const completedLessonIds = new Set(
        records.lessonSessions.filter((session) => session.completed).map((session) => session.lessonId)
    );

    const derived = {
        ...records,
        completedLessonIds,
        level: Math.floor(records.xp / XP_PER_LEVEL) + 1,
        xpIntoLevel: records.xp % XP_PER_LEVEL,
        xpPerLevel: XP_PER_LEVEL
    };

    derived.badges = BADGES.map((badge) => ({
        ...badge,
        earned: badge.check(derived)
    }));

    return derived;
}
