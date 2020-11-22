/**
 * @file Log sleep diary events
 * @author Andrew Sayers (andrew-github.com@pileofstuff.org)
 * @copyright 2020
 * @license GPLv2
 */

browser_utils.fix_browser_issues();

var WAKE_time   = document.getElementById('WAKE-time'),
    SLEEP_time = document.getElementById('SLEEP-time'),
    times      = document.getElementById('guidance'),
    time_list  = document.getElementById('time-list'),
    class_prefix = ''
;

function update(event) {

    var diary = new Diary(),
        analysed_diary = diary.analyse(),
        latest_sleep = analysed_diary.sleeps[analysed_diary.sleeps.length-1],
        now = luxon.DateTime.local()
    ;

    // handle clicks on the icons:
    if ( event ) {
        diary.add_entry(event.target.id);
    }

    // update event times:
    if ( analysed_diary.sleeps.length ) {
        SLEEP_time.innerHTML = now.diff(luxon.DateTime.fromMillis(latest_sleep.estimated_sleep_time)).toFormat('hh:mm') + ' ago';
        WAKE_time.innerHTML  = now.diff(luxon.DateTime.fromMillis(latest_sleep.estimated_wake_time)).toFormat('hh:mm') + ' ago';
    }

    if ( analysed_diary.suggested_day_lengths ) {
        times.removeAttribute('style');
        time_list.innerHTML
            = analysed_diary.suggested_day_lengths
            .map(function(suggestion) {
                return (
                    '<tr><td>' + luxon.DateTime.fromMillis(suggestion.bed_time).toFormat('HH:mm') +
                        '<td>' +                           suggestion.days_remaining +
                        '<td>' + luxon.DateTime.fromMillis(suggestion.day_length).toFormat('HH:mm') +
                    '</tr>'
                );
            }).join('');
    } else {
        times.setAttribute('style','display:none');
    }

    // Set page mode:
    var mode = diary.mode();
    if ( !isNaN(mode) ) {
        document.body.className = class_prefix + diary.event_id_to_string[mode];
    }
    class_prefix = 'transition ';

    // So that queued updates are sent when we go online:
    diary.save();

}

document.getElementById('WAKE' ).addEventListener( 'click', update );
document.getElementById('SLEEP').addEventListener( 'click', update );

document.addEventListener( "visibilitychange", function() {
    if ( document.visibilityState == 'visible' ) update();
});
setInterval(update, 60000);
update();
