define('chartutils', ['linechart', 'navigation', 'urls', 'utils', 'z'],
       function(linechart, nav, urls, utils, z) {

    // Get last `dayrange` days when no chart date range specified.
    var dayrange = 30;
    var interval = 'day';
    var start = getRecentTimeDelta().start;
    var end = getRecentTimeDelta().end;
    var paramRange = utils.getVars();
    var doRedirect = false;

    // Use range url params if found.
    if ('start' in paramRange && 'end' in paramRange) {
        start = paramRange.start;
        end = paramRange.end;
    } else {
        doRedirect = true;
    }

    // We need the first piece only. "2013-09-10T23:14:06.641Z" to "2013-09-10"
    function getISODate(date) {
        return date.toISOString().split('T')[0];
    }

    // Sets the date range in the 'to' and 'from' inputs.
    function updateRange(start, end) {
        $range = $('#range x-datepicker');
        $range[0].value = start;
        $range[1].value = end;
    }

    // lblValue...remember Visual Basic?
    function createChart(apiName, lblValue, lblYAxis) {
        var newURL = utils.urlparams(urls.reverse(apiName), {'start': start, 'end': end});

        if (doRedirect) {
            doRedirect = false; // Redirect loops joyous fun.
            z.page.trigger('divert', [newURL]);
            window.history.replaceState({}, '', newURL);

            return;
        }

        updateRange(start, end);
        z.page.off('submit.range');

        $range = $('#range x-datepicker');
        start = $range[0].submitValue;
        end = $range[1].submitValue;

        window.history.replaceState({}, '', newURL);

        linechart.createLineChart({tooltipValue: lblValue, yAxis: lblYAxis}, {
            url: urls.api.params(apiName,
                {'start': start, 'end': end, 'interval': interval})
        });

        z.page.on('submit.range', '#rangeform', utils._pd(function() {
            $rangeElms = $('#range x-datepicker');
            start = $rangeElms[0].submitValue;
            end = $rangeElms[1].submitValue;

            createChart(apiName, lblValue, lblYAxis);
        }));
    }

    function getRecentTimeDelta() {
        var today = new Date();
        var end = getISODate(today);
        var start = new Date();

        start.setDate(today.getDate() - dayrange);
        start = getISODate(start);

        return {start: start, end: end};
    }

    return {
        'createChart': createChart
    };

});
