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

$(document).ready(function () {
    $('#usertablecontainer').jtable({
        title: '&nbsp;',
        jqueryuiTheme: true,
        sorting: true,
        paging: true,
        pageSize: 5,
        actions: {
            listAction: '/frontend/user',
            createAction: '/frontend/user/create'
        },
        fields: {
            gameId: {
                title: 'Game Id',
                options: '/frontend/game/idoptions?ownerId=' + ownerId,
                width: '15%'
            },
            userId: {
                title: 'User Id',
                width: '15%'
            },
            apiKey: {
                title: 'API Key',
                width: '70%',
                edit: false,
                create: false
            },
            ownerId: {
                defaultValue: ownerId,
                list: false,
                edit: false,
                type: "hidden"
            }
        }
    });
    $('#usertablecontainer').jtable('load', { ownerId: ownerId });
});
