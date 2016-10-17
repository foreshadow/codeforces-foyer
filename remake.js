foyer = new function() {
    var cid = location.href.match(/contest\/(.*)\/problems/)[1];
    var handle;
    var codeforces = {
        rank_color_class: function(rating) {
            if (rating >= 2900) {
                return 'user-legendary';
            } else if (rating >= 2600) {
                return 'user-red';
            } else if (rating >= 2400) {
                return 'user-red';
            } else if (rating >= 2200) {
                return 'user-orange';
            } else if (rating >= 1900) {
                return 'user-violet';
            } else if (rating >= 1600) {
                return 'user-blue';
            } else if (rating >= 1400) {
                return 'user-cyan';
            } else if (rating >= 1200) {
                return 'user-green';
            } else {
                return 'user-gray';
            }
        },
        verdict_class: function(verdict) {
            if (!verdict || verdict == 'TESTING') {
                return 'verdict-waiting';
            } else if (verdict == 'SKIPPED') {
                return '';
            } else if (verdict == 'CHALLENGED') {
                return 'verdict-failed';
            } else if (verdict == 'OK') {
                return 'verdict-accepted';
            } else {
                return 'verdict-rejected';
            }
        },
        verdict: function(verdict, testcase, testset) {
            if (!verdict) {
                if (testset == 'TESTS' && testcase) {
                    return 'Testing on test ' + (testcase + 1);
                } else {
                    return 'In queue';
                }
            } else if (verdict == 'TESTING') {
                return 'Running';
            } else if (verdict == 'CHALLENGED') {
                return 'Hacked';
            } else if (verdict == 'SKIPPED') {
                return 'Skipped';
            } else if (verdict == 'OK') {
                if (testset == 'PRETESTS') {
                    return 'Pretest passed';
                } else {
                    return 'Accepted';
                }
            } else {
                return verdict.replace(/_/g, ' ').toLowerCase()
                    .replace(/\b[a-z]/g, l => l.toUpperCase()) +
                    ' on test ' + (testcase + 1);
            }
        }
    };
    var stime = function(relative, absolute) {
        relative *= 1000;
        absolute *= 1000;
        var date = new Date(absolute);
        var time = '';
        if (relative == 2147483647 * 1000) {
            // time = (date.getYear() + 1900) + '/' +
            time = (date.getMonth() + 1) + '/' +
                (date.getDate()) + '&nbsp;';
        } else {
            date = new Date(relative + date.getTimezoneOffset() * 60 * 1000);
        }
        time += date.getHours() + ':';
        if (date.getMinutes() < 10) {
            time += '0';
        }
        time += date.getMinutes();
        time += ':';
        if (date.getSeconds() < 10) {
            time += '0';
        }
        time += date.getSeconds();
        return time;
    };
    var fetch = {
        status: function() {
            $('#loading').fadeIn();
            if (typeof handle != 'undefined') {
                $.get('http://codeforces.com/api/user.status?handle=' + handle + '&from=1&count=100', function(data) {
                    var lastpid;
                    var retry = false;
                    var st = '';
                    $.each(data.result, function(k, s) {
                        if (s.problem.contestId == cid) {
                            var pid = s.problem.index;
                            if (pid != lastpid) {
                                st +=
                                    '<hr></div><div class="pname">' +
                                    pid + '. ' + s.problem.name +
                                    '</div>';
                            }
                            st +=
                                '<div class="stime">' +
                                stime(s.relativeTimeSeconds, s.creationTimeSeconds) +
                                '</div>' +
                                '<div class="' + codeforces.verdict_class(s.verdict) + '">' +
                                codeforces.verdict(s.verdict, s.passedTestCount, s.testset) +
                                '</div>'
                                // timeConsumedMillis memoryConsumedBytes
                            lastpid = pid;
                        }
                        if (!s.verdict || s.verdict == 'TESTING') {
                            console.log('Retry');
                            retry = true;
                        }
                    });
                    $('#st').html(st);
                    $('#loading').fadeOut();
                    if (retry) {
                        console.log('Retry set');
                        setTimeout(this.status, 1000);
                    }
                });
                setTimeout(fetch.status, 60 * 1000);
            } else {
                setTimeout(fetch.status, 5 * 1000);
            }
        },
        passed: function() {
            $.get('http://codeforces.com/contest/' + cid, function(data) {
                var $html = $('<div></div>').append(data);
                $.each($html.find("a[title='Participants solved the problem']"), function(k, v) {
                    var pid = $(this).parent().html().match(/status\/(\w)/)[1];
                    var passed = $(this).html().replace(/.*&nbsp;x/, '');
                    $('#passed-' + pid).html('(' + passed + ')');
                });
            });
            setTimeout(fetch.passed, 5 * 1000);
        }
    };
    var timer = function() {
        var now = Date.parse(new Date()) / 1000;
        var display;
        if ($('#contest-status').html() == 'Finished' ||
            typeof cst == "undefined" || typeof cdt == "undefined") {
            display = stime(2147483647, now);
        } else {
            display = stime(cst + cdt - now, now);
        }
        $('#time').html(display);
        setTimeout(timer, 1000);
    };

    this.remake = function() {
        $('.lang').hide();
        $('#body').children().attr('style', '');
        $('#body').children().attr('id', 'leftside');
        $('#body').children().after('<div id="vr"></div><div id="rightside"></div>');
        //$('#body').prepend('<div id="leftbar"></div>');
        //$('#leftbar').append('<div id="prob" class="primary">Problems</div>');
        //$('#leftbar').append('<div id="hack">Hacks</div>');
        //$('#leftbar').append('<div id="room">Room</div>');
        //$('#leftbar').append('<div id="rank">Standings</div>');
        //$('#leftbar').append('<div id="cust">Custom Invocation</div>');
        $('#leftbar div').click(function() {
            $(this).attr('class', 'primary');
            $('#leftbar div[id!="' + $(this).attr('id') + '"]').attr('class', '');
        });
        $('#header').css('position', 'fixed');
        $('#header').next().attr('id', 'title');
        $('#header').children().first().after('<div id="navigation"></div>');
        $('#header').append('<hr>');
        $('#title').css('text-align', 'left');
        $('#rightside').append('<div id="submit"></div>');
        $('#submit').after('<ul id="status"></ul>');
        $('#status').append(
            '<link href="http://st.codeforces.com/s/19764/css/status.css" rel="stylesheet">' +
            '<div id="loading" style="text-align: center;"><hr>Updating status ...</div>' +
            '<div id="st"></div>'
        );
        $(".problemindexholder[problemindex!='A']").parent().fadeOut();
        $.each($('.problemindexholder'), function(k, v) {
            if ($(this).find('.time-limit').html().replace(/.*?<\/div>/, '') != '1 second') {
                $(this).find('.time-limit').attr('class', 'unusual');
            }
            if ($(this).find('.memory-limit').html().replace(/.*?<\/div>/, '') != '256 megabytes') {
                $(this).find('.memory-limit').attr('class', 'unusual');
            }
            if ($(this).find('.input-file').html().replace(/.*?<\/div>/, '') != 'standard input') {
                $(this).find('.input-file').attr('class', 'unusual');
            }
            if ($(this).find('.output-file').html().replace(/.*?<\/div>/, '') != 'standard output') {
                $(this).find('.output-file').attr('class', 'unusual');
            }
            $(this).parent().css('margin-top', 80);
            var pid = $(this).attr('problemindex');
            var title = $(".problemindexholder[problemindex='" + pid + "'] .title").html();
            $('#navigation').append(
                '<div class="problem-navigation">' +
                '<div class="navigation-title"><a id="problem-' + pid + '" href="#">' + title + '</a></div>' +
                '<div id="passed-' + pid + '" class="navigation-passed"></div></div>'
            );
            $('#problem-' + pid).click(function() {
                $(".problemindexholder[problemindex='" + pid + "']").parent().show();
                $(".problemindexholder[problemindex!='" + pid + "']").parent().hide();
            });
        });
        $.get('http://codeforces.com/contest/' + cid + '/submit', function(data) {
            var $submit = $('<div></div>').append(data);
            handle = $submit.find('.lang-chooser').children().first().next().find('a').first().html();
            $submit.find('.second-level-menu').next().css('padding-bottom', 0);
            $submit.find('form').prev().html('Your handle: ' + handle);
            $submit.find('form.submit-form').attr('action',
                'submit' + $submit.find('form.submit-form').attr('action')
            );
            $submit.find('div.second-level-menu').hide();
            $submit.find('td.field-name').hide();
            $submit.find('tr.subscription-row td').first().hide();
            $submit.find('#editor').css('height', 60);
            $submit.find('textarea#sourceCodeTextarea').css('height', 60);
            $submit.find('td.aceEditorTd input').hide();
            $submit.find('td.aceEditorTd label').hide();
            $submit.find("td:contains('Be careful')").children().css('height', 30);
            $submit.find("td:contains('Be careful')").children().css('overflow-y', 'scroll');
            $submit.find('td[colspan=2]').attr('colspan', 1);
            $submit.find('#pageContent script').first().remove();
            $submit.find('#pageContent script').first().html(
                $submit.find('#pageContent script').first().html()
                .replace(/\n/g, '')
                .replace(/function updateProblemLockInfo.*/, '});')
            );
            $submit.find('#pageContent script').last().remove();
            $('.caption').html(
                $('.caption').html() +
                '<span class="timer"><span id="contest-status">' + 
                $submit.find('.contest-state-phase').html() + 
                '</span> <span id="time"></span></span>'
            );
            $('#submit').append($submit.find('#pageContent').html());
            console.log('hahahaha!');
            $('#submit').append(
                "<script>$('textarea#sourceCodeTextarea').show();$('#editor').hide();$('div.tabSizeDiv').hide();</script>"
            );
            $('form.submit-form').submit(function() {
                console.log('Override');
                var form = $('form.submit-form');
                $.ajax({
                    type: form.attr('method'),
                    url: form.attr('action'),
                    data: form.serialize()
                }).success(function() {
                    console.log('Success');
                    $('textarea').val('// submit success');
                    fetch_status(cid);
                }).fail(function(jqXHR, textStatus, errorThrown) {
                    console.log('Failed');
                    console.log(textStatus);
                });
                $('textarea').val('// submit sent');
                return false;
            });
        });
        $.get('http://codeforces.com/api/contest.list', function(data) {
            $.each(data.result, function(k, c) {
                if (c.id == cid) {
                    cst = c.startTimeSeconds;
                    cdt = c.durationSeconds;
                    console.log('Start: ' + cst);
                    console.log('Duration: ' + cdt);
                }
            });
        });
        fetch.status();
        fetch.passed();
        timer();
    }
};
foyer.remake();
