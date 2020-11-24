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

    var diary = new Diary(); // DO NOT combine this with the following "var" statement

    // handle clicks on the icons:
    if ( event ) {
        diary.add_entry(event.target.id);
    }

    /*
     * We declate "now" after adding the entry, because otherwise the
     * interface sometimes thinks the latest diary entry was added in
     * the future.
     */
    var now = luxon.DateTime.local(),
        latest_sleep,
        latest_wake
    ;

    // update event times:
    diary.sleep_wake_periods()
        .records
        .forEach(function(p) {
            if ( p.status == 'asleep' ) latest_sleep = p.start_time;
            if ( p.status == 'awake'  ) latest_wake  = p.start_time;
        });

    if ( latest_sleep ) {
        SLEEP_time.innerHTML = now.diff(luxon.DateTime.fromMillis(latest_sleep)).toFormat('hh:mm') + ' ago';
    }
    if ( latest_wake ) {
        WAKE_time.innerHTML = now.diff(luxon.DateTime.fromMillis(latest_wake)).toFormat('hh:mm') + ' ago';
    }

    var suggested_day_lengths = diary.suggested_day_lengths();
    if ( suggested_day_lengths ) {
        times.removeAttribute('style');
        time_list.innerHTML = '';
        suggested_day_lengths.forEach(function(suggestion) {
            time_list.innerHTML += (
                '<tr><td>' + luxon.DateTime.fromMillis(suggestion.bed_time).toFormat('HH:mm') +
                    '<td>' +                          (suggestion.days_remaining||'-') +
                    '<td>' + luxon.Duration.fromMillis(suggestion.day_length).toFormat('hh:mm') +
                '</tr>'
            );
        });
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
