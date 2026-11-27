/**
 * Keep MediaElement's frame and video renderer within the size chosen by Xerte.
 * @license Apache-2.0
 */
(function($) {
    function isFullscreen(video, frame, player) {
        var active = document.fullscreenElement || document.webkitFullscreenElement ||
            document.mozFullScreenElement || document.msFullscreenElement;
        // MediaElement 4 can leave isNativeFullScreen=true after its button
        // exits fullscreen. The browser's actual state takes precedence.
        return player.isFullScreen || video.webkitDisplayingFullscreen === true ||
            !!(active && (active === frame || frame.contains(active)));
    }

    function pixels(value, available) {
        if (typeof value === 'string' && /%$/.test(value)) {
            return parseFloat(value) * available / 100;
        }
        return parseFloat(value);
    }

    // Accept a video, its MediaElement frame, or a holder containing videos.
    // Width and height are the content size, excluding the panel's padding.
    $.fn.mediaPlayerSize = function(width, height) {
        return this.each(function() {
            var $videos = $(this).is('video') ? $(this) : $(this).find('video');
            $videos.each(function() {
                var $video = $(this),
                    $frame = $video.closest('.mejs-container'),
                    player = $video.data('mediaelementplayer') || this.player;
                if (!$frame.length || !player || !player.media) return;

                var state = $frame.data('xertePanelSizing');
                if (!state) {
                    state = { width: 0, height: 0, returnPending: false };
                    state.restore = function() {
                        if (!state.returnPending || !document.documentElement.contains($frame[0]) ||
                            isFullscreen($video[0], $frame[0], player)) return;
                        player.isNativeFullScreen = false;
                        state.returnPending = false;
                        $video.mediaPlayerSize(state.width, state.height);
                    };
                    $frame.data('xertePanelSizing', state)
                        .on('controlsresize.xertePanelSizing', function() { this.style.minWidth = '0'; })
                        .on('enteredfullscreen.xertePanelSizing', function() { state.returnPending = true; })
                        .on('exitedfullscreen.xertePanelSizing', function() {
                            state.returnPending = true;
                            // The player's event can precede the browser's actual
                            // exit. fullscreenchange below handles that ordering.
                            requestAnimationFrame(state.restore);
                        });
                }

                if (isFullscreen($video[0], $frame[0], player)) return;
                player.isNativeFullScreen = false;

                var $holder = $frame.parent(),
                    w = pixels(width, $holder.width()),
                    h = pixels(height, $holder.height());
                // Hidden panels are sized when shown, rather than overwriting a
                // working player with zero/NaN dimensions during page changes.
                if (!(w > 0 && h > 0 && isFinite(w) && isFinite(h))) return;

                // Once the page supplies dimensions, metadata and native resize
                // events must not replace them with the file's aspect ratio.
                player.options.stretching = 'none';
                player.options.enableAutosize = false;
                // MediaElement's controls can impose a minimum wider than a
                // narrow panel. The page's available space takes precedence.
                $frame.css('min-width', 0);
                player.setPlayerSize(w, h);
                // Respect any page/theme max-size constraints on the frame.
                var actualWidth = $frame.width(), actualHeight = $frame.height();
                if (actualWidth !== w || actualHeight !== h) {
                    w = actualWidth;
                    h = actualHeight;
                    player.setPlayerSize(w, h);
                }
                if (typeof player.media.setSize === 'function') player.media.setSize(w, h);
                $video.css({ width: w, height: h, 'object-fit': 'contain' });
                state.width = w;
                state.height = h;
                player.setControlsSize();
            });
        });
    };

    $(document).on('fullscreenchange.xertePanelSizing webkitfullscreenchange.xertePanelSizing ' +
        'mozfullscreenchange.xertePanelSizing MSFullscreenChange.xertePanelSizing', function() {
        $('.mejs-container').each(function() {
            var state = $(this).data('xertePanelSizing');
            if (state) requestAnimationFrame(state.restore);
        });
    });
})(jQuery);
