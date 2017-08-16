/**
 * @file jquery.panel.js
 * @copyright 2016-2017 Lulebe, Inc.
 * @author Daniel Stainback (Torann)
 * @version 0.1
 * @license Apache-2.0
 */

+function ($) {
    "use strict";


    // CREATE PANEL ON DOM
    // ===================

    var $panel = $('#quick-panel');


    // DEFAULT OPTIONS
    // ===============

    var default_options = {
        pos: 'from-right',
        reload: false,
        afterReveal: null,
        afterClose: null,
        formSuccess: null
    };


    // PANEL CLASS DEFINITION
    // ======================

    var Panel = {
        xhr: null,
        timeout: null,
        isActive: false,
        formDirty: false,
        afterReveal: null,
        afterClose: null,
        formSuccess: null,
        $node: $panel,

        show: function (el, options) {
            var that = this;

            // Prevent dup opens
            if (this.isActive === true) return;

            // Merge options
            options = $.extend({}, default_options, options);

            // Set ghetto events
            this.afterReveal = options.afterReveal;
            this.afterClose = options.afterClose;
            this.formSuccess = options.formSuccess;

            // Make visible and set position
            $panel.addClass(options.pos).show();

            // Reload on success
            $panel.data('reload', options.reload);

            // Add slight delay for transition
            setTimeout(function () {
                $panel.addClass('is-visible');
            }, 1);

            // Let everyone know!
            $('body').addClass('panel-open');

            // Set defaults
            this.isActive = true;
            this.formDirty = false;

            // Bind escape close
            $(document).on('keyup.panel', function(ev) {
                if (ev.keyCode === 27) that.close();
            });

            $panel.find('.quick-panel-content').html('<div class="loading"><i class="icon-spin"></i>' +
                '<a href="#" data-panel="close">' +
                    $.trans('buttons.Cancel') +
                '</a></div>');

            // Load content
            if (typeof(el) === 'function') {
                el(this, options);
            }
            else {
                this.load($(el).closest('a').attr('href'));
            }

            // Global event
            $(window).trigger('panel.opened', {
                el: $panel[0]
            });
        },

        load: function (url, partial) {
            var that = this;

            this.xhr = $.ajax({
                headers: {
                    'X-HTML-PARTIAL': partial || '#main-content'
                },
                url: url,
                dataType: 'json',
                success: function(response) {
                    that.reveal(response.title, response.html)
                }
            });

            this.startTimer();
        },

        reveal: function (title, html) {
            this.stopTimer();

            // Was canceled
            if (this.isActive === false) return;

            $panel.addClass('loaded')
                .find('.quick-panel-content').html(html);

            $panel.find('header h1').html(title);

            // Bind submit event
            this.setupForm($panel.find('.quick-panel-content form'));

            // Reveal callback
            if (typeof that.afterReveal === 'function') this.afterReveal($panel, this);

            // JavaScript Libraries used
            if($.fn.markdownEditor) $panel.find('textarea[data-provide="markdown"]').markdownEditor();
            if($.fn.multiselect) $panel.find('select[multiple]').multiselect();

            // Global event
            $(window).trigger('panel.revealed', {
                el: $panel[0]
            });
        },

        setupForm: function ($form) {
            if ($form.length === 0) {
                $panel.addClass('no-form');
                return false;
            }

            var that = this;

            // Setup panel for form
            var $button = $panel.addClass('with-form')
                .find('header button').attr('disabled', '');

            // Bind submission events
            $form.on('submit', this.submit.bind(this))
                .dirtyForm()
                .on('dirty.form', function(ev, state) {
                    $button.toggleProp('disabled', state === 'clean');
                    that.formDirty = state === 'dirty';
                });
        },

        submit: function (ev) {
            ev && ev.preventDefault();

            var that = this,
                $form = $(ev.target),
                method = $form.find('input[name="_method"]').val();

            return $form.ajaxSubmit({
                beforeSubmit: function(arr, $form) {
                    $.toggleLoader(1);

                    // Disable inputs
                    $form.find('input,select,textarea,button[type="submit"]').toggleProp('disabled', true);
                },
                success: function(data) {
                    // Form success callback
                    if (typeof that.formSuccess === 'function') that.formSuccess(data, $form, this);

                    // This is built into the AJAX stuff
                    if (typeof data.message !== 'string') {
                        $.snackbar({
                            message: $.trans(method ? 'messages.Update successful' : 'messages.Creation successful'),
                            style: 'success'
                        });
                    }

                    that.close(true);

                    // Reload the page if required. The timeout allows
                    // the panel to hide before the reload
                    if ($panel.data('reload')) {
                        setTimeout(function () {
                            window.location.reload();
                        }, 300);
                    }
                },
                complete: function(xhr, status) {
                    $.toggleLoader(0);

                    // Enable inputs
                    $form.find('input,select,textarea,button[type="submit"]').toggleProp('disabled', false);
                }
            });
        },

        close: function (skip) {
            var that = this;

            this.stopTimer();

            // Prevent dup closes
            if (this.isActive === false) return;

            // Check before closing
            if (skip !== true && this.formDirty === true) {
                this.confirm();
                return;
            }

            // This allows for any animations
            $panel.removeClass('is-visible loaded');
            setTimeout(function () {

                // Reset panel
                $panel.hide().attr('class', '');
                $panel.find('header h1').html('');

                // Close callback
                if (typeof that.afterClose === 'function') that.afterClose(this);

                // Global event
                $(window).trigger('panel.closed', {
                    el: $panel[0]
                });

                that.afterClose = null;
            }, 400);

            // Unbind events
            $panel.find('.quick-panel-content form').off('submit');

            this.isActive = false;

            $('body').removeClass('panel-open');

            // Abort old request
            if (this.xhr && typeof this.xhr.abort === 'function') {
                this.xhr.abort();
            }

            // Unbind escape close
            $(document).off('keyup.panel');
        },

        failed: function (msg) {
            $.snackbar({
                message: msg || $.trans('messages.Unable to load page'),
                style: 'error',
                timeout: null
            });

            this.close(true);
        },

        confirm: function () {
            var that = this;

            alertify.reset().confirm($.trans('messages.Are you sure you want to close this?'), function (e) {
                that.close(true)
            });

            return false;
        },

        startTimer: function () {
            this.timeout = setTimeout(this.failed.bind(this), 4000);
        },

        stopTimer: function () {
            clearTimeout(this.timeout);
        }
    };


    // PANEL PLUGIN DEFINITION
    // =======================

    $.panel = function (el, options) {
        Panel.show(el, options);
    };

    $.panel.prototype.setDefaults = function (options) {
        default_options = $.extend({}, default_options, options);
    };


    // PANEL DATA-API
    // ==============

    $panel.on('click', function (ev, data) {
        if ($(ev.target).closest('[data-panel=close]').length > 0) {
            ev && ev.preventDefault();
            Panel.close();
        }
    });

    $(document).on('touchend click.of.panel.data-api', '[data-panel=open]', function (ev, data) {
        ev && ev.preventDefault();

        var $target = $(ev.target);

        $.panel($target, $target.data());
    });

}(window.jQuery);