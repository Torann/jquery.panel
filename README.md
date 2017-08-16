# jQuery Panel

A CSS3 and jQuery powered slide-in panel, to quickly show side content, notifications or profile information. Make sure to read the **requirements** at the bottom.

## Required Element

The plugin does not create the panel for you. The reason for this is so that you can more easily customized the layout. The panel must have the id of `quick-panel`.

```
<div id="quick-panel">
    <header>
        <div>
            <h1></h1>
            <a data-panel="close" class="btn icon-close">
                Cancel
            </a>
        </div>
    </header>
    <div class="quick-panel-container">
        <div class="quick-panel-content"></div>
    </div>
</div>
```

### Basic SASS

```
// Variables

$zindex-modal:    3040 !default;
$base-gutter:     1.5rem !default;


// Panel Style

#quick-panel {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: $zindex-modal;

  &:after {
    position: absolute;
    content: '';
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(#000, 0);
    transition: background 0s 0s;
  }

  // Forms variants

  &.no-form {
    // Any non-form specific tweks
  }

  &.with-form > header {
    // Any form specific tweks
  }


  // Content

  .quick-panel-container {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    background: #fff;
    z-index: 1;
    transition-property: transform;
    transition-duration: 0.3s;
    transition-delay: 0.2s;
  }

  .quick-panel-content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: (6rem + $base-gutter) $base-gutter $base-gutter;
    overflow: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;

    .loading {
      position: absolute;
      top: 50%;
      margin-top: -5%;
      left: 0;
      right: 0;
      text-align: center;

      a {
        color: #3c3c3c;
        text-decoration: underline;
      }

      .icon-spin {
        display: block;
        font-size: 4rem;
        line-height: 1;
        margin: 0 0 1rem;
        opacity: 0.6;

        &:before {
          animation: spin 2s infinite linear;
        }
      }
    }
  }


  // Position

  &.from-right {
    .quick-panel-container {
      right: 0;
      transform: translate3d(100%, 0, 0);
    }
  }

  &.from-left {
    .quick-panel-container {
      left: 0;
      transform: translate3d(-100%, 0, 0);
    }
  }

  // Reveal Event

  &.is-visible {
    &:after {
      background: rgba(#000, .6);
      transition: background .3s 0s;
    }

    .quick-panel-container {
      transform: translate3d(0, 0, 0);
      transition-delay: 0s;
    }
  }

  // Responsive

  @media only screen and (min-width: 577px) {
    .quick-panel-container {
      width: 70%;
    }
  }

  @media only screen and (min-width: 769px) {
    .quick-panel-container {
      width: 50%;
    }
  }
}
```

## Trigger

### Remote Content

To load remote content simple add the data attribute `data-panel="open"` to a link and the plugin show event will fire when the link is clicked.

### Manually trigger

```
$.panel(element, {
    pos: 'from-right',
    reload: false,
    afterClose: null,
    formSuccess: null
});
```

## Element Attributes

### `href`

This is required for the page fetching.

### `data-pos`

Used to to specify the location where the panel will appear from. (default `from-right`)

### `data-reload`

When set to `true` this will reload the page after a form is successfully submitted. (default `false`)

## Callbacks

 - `afterReveal($panel, this)` - fired after the panel is revealed
 - `formSuccess(data, $form, this)` - fired after the a successful form submission
 - `afterClose(this)` - fired after the panel closes

## Override Defaults

```
    $.panel.setDefaults({
        reload: true
    });
```

## Request Header

When a panel AJAX request is made `X-HTML-PARTIAL` is included in header. This can be used to determine what part of the page to send back.

# Requirements

This plugin is closely tied into my projects, and because of this their are certain dependency requirements that must be met.

## Required Plugins

 - jquery-trans
 - jquery.form

## Translation Keys Used (jquery-trans)

 - `messages.Update successful`
 - `messages.Creation successful`
 - `messages.Are you sure you want to close this?`
 - `messages.Unable to load page`
 - `buttons.Cancel`

## Required Functions

This is built to use a simple snackbar helper function:

```
$.snackbar({
    message: 'Message from the panel event',
    style: 'error',
    timeout: null
});
```

This helper function toggles an on page load indicator.

```
$.toggleLoader(int) // Int: 1 = show, 0 = hide
```

Dirty form function and event. This takes the current form chunk and determines if the content has changed from when it was loaded. If it did then the event `dirty.form` if fired on the element.

```
$.fn.dirtyForm()
```