(function ($, window, document) {
    "use strict";

    var THUMBNAIL_WIDTH = 320;
    var THUMBNAIL_HEIGHT = 180;
    var JPEG_QUALITY = 0.75;

    var thumbnailStatus = {};

    var rendererIframe = null;
    var rendererBusy = false;

    var RENDER_WIDTH = 640;
    var RENDER_HEIGHT = 360;
    var RENDER_SETTLE_DELAY = 500;
    var RENDER_TIMEOUT = 20000;

    var generationQueue = [];
    var queuedPages = {};
    var queueRunning = false;

    var rerunPages = {};

    /*
     * Some breathing room between complete
     * Xerte preview renders for slower machines
     */
    var QUEUE_PAUSE = 250;


    /**
     * Capture a same-origin iframe using iframe2image.
     *
     * callback(error, image)
     */
    function captureIframe(iframe, callback) {
        if (!iframe) {
            callback(new Error("No iframe supplied"));
            return;
        }

        if (typeof window.iframe2image !== "function") {
            callback(new Error("iframe2image is not loaded"));
            return;
        }

        try {
            window.iframe2image(iframe, function (err, image) {
                if (err) {
                    callback(err);
                    return;
                }

                if (!image) {
                    callback(new Error("iframe2image returned no image"));
                    return;
                }

                callback(null, image);
            });

        } catch (err) {
            callback(err);
        }
    }


    /**
     * Convert an iframe capture into a fixed-size JPEG thumbnail.
     *
     * callback(error, result)
     *
     * result:
     * {
     *     dataUrl: "...",
     *     width: 320,
     *     height: 180
     * }
     */
    function captureToJpeg(iframe, callback) {
        captureIframe(iframe, function (err, image) {
            if (err) {
                callback(err);
                return;
            }

            try {
                var canvas = document.createElement("canvas");
                var context = canvas.getContext("2d");

                canvas.width = THUMBNAIL_WIDTH;
                canvas.height = THUMBNAIL_HEIGHT;

                // JPEG has no transparency.
                context.fillStyle = "#ffffff";
                context.fillRect(
                    0,
                    0,
                    THUMBNAIL_WIDTH,
                    THUMBNAIL_HEIGHT
                );

                var sourceWidth =
                    image.naturalWidth ||
                    image.width;

                var sourceHeight =
                    image.naturalHeight ||
                    image.height;

                if (!sourceWidth || !sourceHeight) {
                    callback(
                        new Error("Captured image has invalid dimensions")
                    );
                    return;
                }

                /*
                 * Scale the captured preview down while preserving
                 * its aspect ratio.
                 */
                var scale = Math.min(
                    THUMBNAIL_WIDTH / sourceWidth,
                    THUMBNAIL_HEIGHT / sourceHeight
                );

                var targetWidth = Math.round(sourceWidth * scale);
                var targetHeight = Math.round(sourceHeight * scale);

                var targetX = Math.round(
                    (THUMBNAIL_WIDTH - targetWidth) / 2
                );

                var targetY = Math.round(
                    (THUMBNAIL_HEIGHT - targetHeight) / 2
                );

                context.drawImage(
                    image,
                    0,
                    0,
                    sourceWidth,
                    sourceHeight,
                    targetX,
                    targetY,
                    targetWidth,
                    targetHeight
                );

                var dataUrl = canvas.toDataURL(
                    "image/jpeg",
                    JPEG_QUALITY
                );

                callback(null, {
                    dataUrl: dataUrl,
                    width: THUMBNAIL_WIDTH,
                    height: THUMBNAIL_HEIGHT,
                    sourceWidth: sourceWidth,
                    sourceHeight: sourceHeight
                });

            } catch (err) {
                callback(err);
            }
        });
    }

    function getImageUrl(templateId, pageLinkId, revision) {
        var url =
            site_url +
            "website_code/php/thumbnails/image.php" +
            "?template_id=" +
            encodeURIComponent(templateId) +
            "&page_link_id=" +
            encodeURIComponent(pageLinkId);

        if (revision) {
            url +=
                "&v=" +
                encodeURIComponent(revision);
        }

        return url;
    }


    function storeThumbnail(options, callback) {
        options = options || {};

        if (!options.dataUrl) {
            callback(new Error("No thumbnail data supplied"));
            return;
        }

        $.ajax({
            url: rest_api_url + "?route=thumbnails/store",
            type: "POST",
            dataType: "json",
            cache: false,

            data: {
                template_id: options.templateId,
                page_link_id: options.pageLinkId,
                page_index: options.pageIndex,
                revision: options.revision,
                image: options.dataUrl
            }

        }).done(function (response) {

            if (!response || response.ok !== true) {
                callback(
                    new Error("Thumbnail API returned an error"),
                    response
                );
                return;
            }

            callback(null, response);

        }).fail(function (xhr) {

            console.error(
                "Thumbnail store failed:",
                xhr.status,
                xhr.responseText
            );

            callback(
                new Error(
                    "Thumbnail store HTTP error " +
                    xhr.status
                ),
                xhr
            );
        });
    }


    function captureAndStore(iframe, options, callback) {
        captureToJpeg(
            iframe,
            function (err, result) {

                if (err) {
                    callback(err);
                    return;
                }

                storeThumbnail(
                    {
                        templateId: options.templateId,
                        pageLinkId: options.pageLinkId,
                        pageIndex: options.pageIndex,
                        revision: options.revision,
                        dataUrl: result.dataUrl
                    },
                    callback
                );
            }
        );
    }

    /**
     * Load metadata for all existing thumbnails for an LO.
     *
     * callback(error, statusMap)
     *
     * statusMap is keyed by page LINK id:
     *
     * {
     *     "ID_123": {
     *         page_link_id: "ID_123",
     *         revision: "...",
     *         ...
     *     }
     * }
     */
    function loadStatus(templateId, callback) {

        $.ajax({
            url: rest_api_url + '?route=thumbnails/status',
            type: 'GET',
            dataType: 'json',
            cache: false,

            data: {
                template_id: templateId
            }

        }).done(function (response) {

            if (
                !response ||
                response.ok !== true ||
                !response.data
            ) {
                callback(
                    new Error('Invalid thumbnail status response')
                );
                return;
            }

            thumbnailStatus = {};

            var rows = response.data.thumbnails || [];

            rows.forEach(function (row) {
                thumbnailStatus[row.page_link_id] = row;
            });

            callback(null, thumbnailStatus);

        }).fail(function (xhr) {

            console.error(
                'Thumbnail status failed:',
                xhr.status,
                xhr.responseText
            );

            callback(
                new Error(
                    'Thumbnail status HTTP error ' +
                    xhr.status
                )
            );
        });
    }

    function getStatus(pageLinkId) {
        return thumbnailStatus[pageLinkId] || null;
    }


    function hasThumbnail(pageLinkId) {
        return !!thumbnailStatus[pageLinkId];
    }

    function getRendererIframe() {
        if (
            rendererIframe &&
            document.documentElement.contains(rendererIframe)
        ) {
            return rendererIframe;
        }

        rendererIframe = document.createElement("iframe");

        rendererIframe.id = "modern-thumbnail-renderer";
        rendererIframe.setAttribute("aria-hidden", "true");
        rendererIframe.setAttribute("tabindex", "-1");

        /*
         * Keep it rendered, but far outside the visible viewport.
         *
         * Do NOT use display:none because the preview needs real
         * dimensions for iframe2image.
         */
        rendererIframe.style.position = "fixed";
        rendererIframe.style.left = "-10000px";
        rendererIframe.style.top = "0";
        rendererIframe.style.width = RENDER_WIDTH + "px";
        rendererIframe.style.height = RENDER_HEIGHT + "px";
        rendererIframe.style.border = "0";
        rendererIframe.style.opacity = "0";
        rendererIframe.style.pointerEvents = "none";

        document.body.appendChild(rendererIframe);

        return rendererIframe;
    }

    function getRendererPreviewUrl(templateId, pageIndex) {
        return (
            site_url +
            "preview.php?template_id=" +
            encodeURIComponent(templateId) +
            "&_thumbnail=" +
            Date.now() +
            "#page" +
            encodeURIComponent(pageIndex)
        );
    }

    function loadRendererPage(templateId, pageIndex, callback) {
        var iframe = getRendererIframe();

        var completed = false;
        var timeout = null;

        function finish(err) {
            if (completed) {
                return;
            }

            completed = true;

            if (timeout) {
                clearTimeout(timeout);
            }

            iframe.onload = null;

            callback(err, iframe);
        }

        iframe.onload = function () {
            /*
             * iframe load means the HTML document loaded.
             *
             * Xerte still needs a short period to initialise and render
             * the requested page before we capture it.
             */
            setTimeout(function () {
                finish(null);
            }, RENDER_SETTLE_DELAY);
        };

        timeout = setTimeout(function () {
            finish(
                new Error(
                    "Thumbnail renderer timed out loading page " +
                    pageIndex
                )
            );
        }, RENDER_TIMEOUT);

        iframe.src = getRendererPreviewUrl(
            templateId,
            pageIndex
        );
    }

    function generatePageThumbnail(options, callback) {
        options = options || {};

        if (rendererBusy) {
            callback(
                new Error("Thumbnail renderer is currently busy")
            );
            return;
        }

        if (!options.templateId) {
            callback(
                new Error("No template id supplied")
            );
            return;
        }

        if (!options.pageLinkId) {
            callback(
                new Error("No page link id supplied")
            );
            return;
        }

        if (!options.pageIndex) {
            callback(
                new Error("No page index supplied")
            );
            return;
        }

        rendererBusy = true;

        loadRendererPage(
            options.templateId,
            options.pageIndex,
            function (err, iframe) {

                if (err) {
                    rendererBusy = false;
                    callback(err);
                    return;
                }

                captureAndStore(
                    iframe,
                    {
                        templateId: options.templateId,
                        pageLinkId: options.pageLinkId,
                        pageIndex: options.pageIndex,
                        revision: options.revision
                    },
                    function (storeErr, result) {

                        rendererBusy = false;

                        if (storeErr) {
                            callback(storeErr);
                            return;
                        }

                        callback(null, result);
                    }
                );
            }
        );
    }

    function destroyRenderer() {
        if (rendererIframe) {
            rendererIframe.onload = null;

            if (rendererIframe.parentNode) {
                rendererIframe.parentNode.removeChild(
                    rendererIframe
                );
            }
        }

        rendererIframe = null;
        rendererBusy = false;
    }

    function queuePageThumbnail(options, callback) {
        options = options || {};

        if (!options.templateId) {
            if (callback) {
                callback(new Error("No template id supplied"));
            }
            return false;
        }

        if (!options.pageLinkId) {
            if (callback) {
                callback(new Error("No page link id supplied"));
            }
            return false;
        }

        if (!options.pageIndex) {
            if (callback) {
                callback(new Error("No page index supplied"));
            }
            return false;
        }

        /*
         * Already cached during this editor session.
         */
        if (
            thumbnailStatus &&
            thumbnailStatus[options.pageLinkId] &&
            !options.force
        ) {
            return false;
        }

        var key =
            String(options.templateId) +
            ":" +
            String(options.pageLinkId);

        if (queuedPages[key]) {

            /*
             * The page is already waiting/rendering, but another edit
             * happened afterwards.
             *
             * Remember only the newest request and render it once more
             * when the current job finishes.
             */
            if (options.force) {
                rerunPages[key] = {
                    options: options,
                    callback: callback
                };
            }

            return false;
        }

        queuedPages[key] = true;

        generationQueue.push({
            key: key,
            options: options,
            callback: callback
        });

        processGenerationQueue();

        return true;
    }

    function processGenerationQueue() {
        if (queueRunning) {
            return;
        }

        if (!generationQueue.length) {
            return;
        }

        var job = generationQueue.shift();

        queueRunning = true;

        generatePageThumbnail(
            job.options,
            function (err, result) {

                delete queuedPages[job.key];

                if (!err) {
                    thumbnailStatus[job.options.pageLinkId] = {
                        page_link_id: job.options.pageLinkId,
                        page_index: job.options.pageIndex,
                        revision: job.options.revision,
                        mime_type: "image/jpeg",
                        width: THUMBNAIL_WIDTH,
                        height: THUMBNAIL_HEIGHT
                    };
                }

                if (typeof job.callback === "function") {
                    job.callback(err, result);
                }


                /*
                 * Did another edit occur while this page was already
                 * queued/rendering?
                 *
                 * If so, queue exactly one newer render.
                 */
                var rerun = rerunPages[job.key];

                if (rerun) {

                    delete rerunPages[job.key];

                    queuedPages[job.key] = true;

                    generationQueue.unshift({
                        key: job.key,
                        options: rerun.options,
                        callback: rerun.callback
                    });
                }

                queueRunning = false;

                setTimeout(
                    processGenerationQueue,
                    QUEUE_PAUSE
                );
            }
        );
    }

    function getQueueStatus() {
        return {
            waiting: generationQueue.length,
            running: queueRunning,
            rendererBusy: rendererBusy
        };
    }

    function deleteThumbnail(templateId, pageLinkId, callback) {

        $.ajax({
            url: rest_api_url + '?route=thumbnails/delete',
            type: 'POST',
            dataType: 'json',
            cache: false,

            data: {
                template_id: templateId,
                page_link_id: pageLinkId
            }

        }).done(function (response) {

            delete thumbnailStatus[pageLinkId];

            if (typeof callback === 'function') {
                callback(null, response);
            }

        }).fail(function (xhr) {

            console.error(
                'Thumbnail deletion failed:',
                xhr.status,
                xhr.responseText
            );

            if (typeof callback === 'function') {
                callback(
                    new Error(
                        'Thumbnail deletion HTTP error ' +
                        xhr.status
                    )
                );
            }
        });
    }

    function deleteAllThumbnails(templateId, callback) {

        $.ajax({
            url: rest_api_url + '?route=thumbnails/delete-all',
            type: 'POST',
            dataType: 'json',
            cache: false,

            data: {
                template_id: templateId
            }

        }).done(function (response) {

            thumbnailStatus = {};

            if (typeof callback === 'function') {
                callback(null, response);
            }

        }).fail(function (xhr) {

            console.error(
                'Thumbnail delete-all failed:',
                xhr.status,
                xhr.responseText
            );

            if (typeof callback === 'function') {
                callback(
                    new Error(
                        'Thumbnail delete-all HTTP error ' +
                        xhr.status
                    )
                );
            }
        });
    }

    function cancelPendingGeneration(callback) {

        /*
         * Discard jobs that have not started yet.
         */
        generationQueue = [];
        queuedPages = {};
        rerunPages = {};

        /*
         * One job may already be rendering.
         *
         * Let that one finish safely, then continue. It will be deleted
         * by deleteAllThumbnails immediately afterwards.
         */
        function waitForRenderer() {

            if (queueRunning || rendererBusy) {
                setTimeout(
                    waitForRenderer,
                    100
                );
                return;
            }

            if (typeof callback === 'function') {
                callback();
            }
        }

        waitForRenderer();
    }

    window.modernEditorThumbnails = {
        captureIframe: captureIframe,
        captureToJpeg: captureToJpeg,

        storeThumbnail: storeThumbnail,
        captureAndStore: captureAndStore,

        getImageUrl: getImageUrl,

        loadStatus: loadStatus,
        getStatus: getStatus,
        hasThumbnail: hasThumbnail,

        getRendererIframe: getRendererIframe,
        generatePageThumbnail: generatePageThumbnail,
        destroyRenderer: destroyRenderer,

        queuePageThumbnail: queuePageThumbnail,
        getQueueStatus: getQueueStatus,

        deleteThumbnail: deleteThumbnail,
        deleteAllThumbnails: deleteAllThumbnails,
        cancelPendingGeneration: cancelPendingGeneration
    };

})(jQuery, window, document);