/*
 * QBadge
 * Questor Achievement System
 *
 * Copyright (c) 2013 Questor GmbH
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/*
    Proposed Leaderboard API

    LEADERBOARD
    {
        leaderboardId: "uniqueid",
        name: {
        de: "DE name",
        en: "EN name",
        },
        type: "absolute"|"time"|"fraction"
        order: "ascending"|"descending"
        ownerId: owner,
        gameId: game
    }

    LEADERBOARD ENTRY
    {
        leaderboardEntryId: "uniqueid",
        leaderboardId: leaderboardId,
        userId: userId,
        gameId: gameId,
        ownerId: ownerId,
        timestamp: epoch,
        score: value
    }

    ENTRY RESULT
    {
        leaderboardId: leaderboardId,
        userId: userId,
        gameId: gameId,
        ownerId: ownerId,
        highscore : [
            {
                frame: DAY|WEEK|ALLTIME,
                type: PERSONAL|GLOBAL
            }
        ]
        standing: [
            {
                frame: DAY|WEEK|ALLTIME,
                position: 42
            }
        ]
    }

    PUT /leaderboards <- LEADERBOARD : leaderboardId
    DELETE /leaderboards/leaderboardId
    POST /leaderboards <- LEADERBOARD ENTRY : ENTRY RESULT
    GET /leaderboards/leaderboardId/timeframeMS : [LEADERBOARD ENTRY (ordered)]
    GET /leaderboards/leaderboardId/userId/timeframeMS : [LEADERBOARD ENTRY (ordered)]
    GET /leaderboards/html/leaderboardId/timeframeMS : HTML render
*/