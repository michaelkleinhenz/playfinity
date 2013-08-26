/*
 * Playfinity
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
    Engine for timed events.
 */

ACHV.timerEngine = function (spec) {
    "use strict";
    var that = ACHV.engine(spec);

    that.stateChanged = function () {
        var changed = false;
        return {
            setChanged: function (isChanged) {
                changed = isChanged;
            },
            getValue: function () {
                return changed;
            }
        };
    }();

    that.process = function (event, rule, valueChanged) {
        that.processStartEvent(event, rule);
        that.processCurrentEvent(event, rule);
        valueChanged(that.stateChanged.getValue());
    };

    that.processStartEvent = function (event, rule) {
        function setTimeProperties() {
            if (event.hasOwnProperty("tsInit") && !rule.hasOwnProperty("startTime")) {
                rule.startTime = event.tsInit;
                rule.state = "inProgress";
                that.stateChanged.setChanged(true);
            }
        }
        if (rule.hasOwnProperty("startTimerEvents")) {
            if (Utils.arrayContains(rule.startTimerEvents, event.eventId)) {
                setTimeProperties();
            }
        } else {
            setTimeProperties();
        }
    };

    that.processCurrentEvent = function (event, rule) {
        if (event.hasOwnProperty("tsInit")) {
            rule.lastEventTime = event.tsInit;
            rule.timer = rule.lastEventTime - rule.startTime;
            if (rule.timer <= rule.timerMaxMs) {
                rule.state = "satisfied";
            } else {
                rule.state = "broken";
            }
            that.stateChanged.setChanged(true);
        }
    };

    that.reset = function (rule) {
        rule.timer = 0;
        rule.state = "inProgress";
        delete rule.startTime;
    };

    return that;
};

exports.timerEngine = ACHV.timerEngine;