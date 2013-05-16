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

$(document).ready(function () {
    $('#modeltablecontainer').jtable({
        title: '&nbsp;',
        jqueryuiTheme: true,
        sorting: true,
        paging: true,
        pageSize: 5,
        actions: {
            listAction: '/frontend/model',
            createAction: '/frontend/model/create'
        },
        fields: {
            rules: {
                title: '',
                width: '1%',
                sorting: false,
                edit: false,
                create: false,
                display: function (data) {
                    var achievement = data.record;
                    var $img = $('<img src="images/details.png" width="24px" title="View Achievement Detail" />');
                    $img.click(function () {
                        $('#modeltablecontainer').jtable('openChildTable',
                            $img.closest('tr'),
                            {
                                title: 'Achievement Detail for "' + achievement.name.en + '"',
                                actions: {
                                    listAction: '/frontend/model'
                                },
                                fields: {
                                    name_en: {
                                        title: 'Achievement Title (en)',
                                        display: function (data) {
                                            return data.record.name.en;
                                        },
                                        width: '10%'
                                    },
                                    name_de: {
                                        title: 'Achievement Title (de)',
                                        display: function (data) {
                                            return data.record.name.de;
                                        },
                                        width: '10%'
                                    },
                                    description_en: {
                                        title: 'Description (en)',
                                        type: "textarea",
                                        display: function (data) {
                                            return data.record.description.en;
                                        },
                                        width: '30%'
                                    },
                                    description_de: {
                                        title: 'Description (de)',
                                        type: "textarea",
                                        display: function (data) {
                                            return data.record.description.de;
                                        },
                                        width: '30%'
                                    },
                                    imageURI: {
                                        title: 'Image URL',
                                        width: '10%'
                                    },
                                    frequencyCounterMax: {
                                        title: 'Max Frequency',
                                        width: '10%'
                                    }
                                }
                            }, function (data) { //opened handler
                                data.childTable.jtable('load', { id: achievement._id, ownerId: achievement.ownerId, gameId: achievement.gameId });
                            });
                    });
                    return $img;
                }
            },
            jsonProcess: {
                title: '',
                width: '1%',
                sorting: false,
                edit: false,
                create: false,
                display: function (data) {
                    var achievement = data.record;
                    var $img = $('<img src="images/details.png" width="24px" title="View Achievement Detail" />');
                    $img.click(function () {
                        $('#modeltablecontainer').jtable('openChildTable',
                            $img.closest('tr'),
                            {
                                title: 'Achievement Detail - JSON Rule View for "' + achievement.name.en + '"',
                                actions: {
                                    listAction: '/frontend/model/rules/process'
                                },
                                fields: {
                                    process: {
                                        title: 'JSON Process Definition',
                                        width: '100%',
                                        display: function (data) {
                                            return "<pre>" + syntaxHighlight(data.record.process) + "</pre>";
                                        }
                                    }
                                }
                            }, function (data) { //opened handler
                                data.childTable.jtable('load', { id: achievement._id, ownerId: achievement.ownerId, gameId: achievement.gameId });
                            });
                    });
                    return $img;
                }
            },
            ownerId: {
                defaultValue: ownerId,
                list: false,
                edit: false,
                type: "hidden"
            },
            gameId: {
                title: 'Game Id',
                options: '/frontend/game/idoptions?ownerId=' + ownerId,
                width: '10%'
            },
            name_en: {
                title: 'Achievement Title (en)',
                display: function (data) {
                    return data.record.name.en;
                },
                width: '90%'
            },
            name_de: {
                title: 'Achievement Title (de)',
                list: false
            },
            description_en: {
                title: 'Description (en)',
                list: false,
                type: "textarea"
            },
            description_de: {
                title: 'Description (de)',
                list: false,
                type: "textarea"
            },
            imageURI: {
                title: 'Image URL',
                list: false
            },
            frequencyCounterMax: {
                title: 'Max Frequency',
                list: false
            },
            process: {
                title: 'Process JSON Array',
                list: false,
                type: "textarea"
            }
        }
    });
    $('#modeltablecontainer').jtable('load', { ownerId: ownerId });
});
