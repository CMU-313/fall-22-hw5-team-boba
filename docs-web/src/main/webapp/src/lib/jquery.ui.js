/*! jQuery UI - v1.12.1 - 2017-11-09
* http://jqueryui.com
* Includes: widget.js, data.js, scroll-parent.js, widgets/sortable.js, widgets/mouse.js
* Copyright jQuery Foundation and other contributors; Licensed MIT */

(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else {
    // Browser globals
    factory(jQuery);
  }
}(($) => {
  $.ui = $.ui || {};

  const version = $.ui.version = '1.12.1';

  /*!
   * jQuery UI Widget 1.12.1
   * http://jqueryui.com
   *
   * Copyright jQuery Foundation and other contributors
   * Released under the MIT license.
   * http://jquery.org/license
   */

  // >>label: Widget
  // >>group: Core
  // >>description: Provides a factory for creating stateful widgets with a common API.
  // >>docs: http://api.jqueryui.com/jQuery.widget/
  // >>demos: http://jqueryui.com/widget/

  let widgetUuid = 0;
  const widgetSlice = Array.prototype.slice;

  $.cleanData = (function (orig) {
    return function (elems) {
      let events; let elem; let
        i;
      for (i = 0; (elem = elems[i]) != null; i++) {
        try {
          // Only trigger remove when necessary to save time
          events = $._data(elem, 'events');
          if (events && events.remove) {
            $(elem).triggerHandler('remove');
          }

          // Http://bugs.jquery.com/ticket/8235
        } catch (e) {}
      }
      orig(elems);
    };
  }($.cleanData));

  $.widget = function (name, base, prototype) {
    let existingConstructor; let constructor; let
      basePrototype;

    // ProxiedPrototype allows the provided prototype to remain unmodified
    // so that it can be used as a mixin for multiple widgets (#8876)
    const proxiedPrototype = {};

    const namespace = name.split('.')[0];
    name = name.split('.')[1];
    const fullName = `${namespace}-${name}`;

    if (!prototype) {
      prototype = base;
      base = $.Widget;
    }

    if ($.isArray(prototype)) {
      prototype = $.extend.apply(null, [{}].concat(prototype));
    }

    // Create selector for plugin
    $.expr[':'][fullName.toLowerCase()] = function (elem) {
      return !!$.data(elem, fullName);
    };

    $[namespace] = $[namespace] || {};
    existingConstructor = $[namespace][name];
    constructor = $[namespace][name] = function (options, element) {
      // Allow instantiation without "new" keyword
      if (!this._createWidget) {
        return new constructor(options, element);
      }

      // Allow instantiation without initializing for simple inheritance
      // must use "new" keyword (the code above always passes args)
      if (arguments.length) {
        this._createWidget(options, element);
      }
    };

    // Extend with the existing constructor to carry over any static properties
    $.extend(constructor, existingConstructor, {
      version: prototype.version,

      // Copy the object used to create the prototype in case we need to
      // redefine the widget later
      _proto: $.extend({}, prototype),

      // Track widgets that inherit from this widget in case this widget is
      // redefined after a widget inherits from it
      _childConstructors: [],
    });

    basePrototype = new base();

    // We need to make the options hash a property directly on the new instance
    // otherwise we'll modify the options hash on the prototype that we're
    // inheriting from
    basePrototype.options = $.widget.extend({}, basePrototype.options);
    $.each(prototype, (prop, value) => {
      if (!$.isFunction(value)) {
        proxiedPrototype[prop] = value;
        return;
      }
      proxiedPrototype[prop] = (function () {
        function _super() {
          return base.prototype[prop].apply(this, arguments);
        }

        function _superApply(args) {
          return base.prototype[prop].apply(this, args);
        }

        return function () {
          const __super = this._super;
          const __superApply = this._superApply;
          let returnValue;

          this._super = _super;
          this._superApply = _superApply;

          returnValue = value.apply(this, arguments);

          this._super = __super;
          this._superApply = __superApply;

          return returnValue;
        };
      }());
    });
    constructor.prototype = $.widget.extend(basePrototype, {

      // TODO: remove support for widgetEventPrefix
      // always use the name + a colon as the prefix, e.g., draggable:start
      // don't prefix for widgets that aren't DOM-based
      widgetEventPrefix: existingConstructor ? (basePrototype.widgetEventPrefix || name) : name,
    }, proxiedPrototype, {
      constructor,
      namespace,
      widgetName: name,
      widgetFullName: fullName,
    });

    // If this widget is being redefined then we need to find all widgets that
    // are inheriting from it and redefine all of them so that they inherit from
    // the new version of this widget. We're essentially trying to replace one
    // level in the prototype chain.
    if (existingConstructor) {
      $.each(existingConstructor._childConstructors, (i, child) => {
        const childPrototype = child.prototype;

        // Redefine the child widget using the same prototype that was
        // originally used, but inherit from the new version of the base
        $.widget(
          `${childPrototype.namespace}.${childPrototype.widgetName}`,
          constructor,
          child._proto,
        );
      });

      // Remove the list of existing child constructors from the old constructor
      // so the old child constructors can be garbage collected
      delete existingConstructor._childConstructors;
    } else {
      base._childConstructors.push(constructor);
    }

    $.widget.bridge(name, constructor);

    return constructor;
  };

  $.widget.extend = function (target) {
    const input = widgetSlice.call(arguments, 1);
    let inputIndex = 0;
    const inputLength = input.length;
    let key;
    let value;

    for (; inputIndex < inputLength; inputIndex++) {
      for (key in input[inputIndex]) {
        value = input[inputIndex][key];
        if (input[inputIndex].hasOwnProperty(key) && value !== undefined) {
          // Clone objects
          if ($.isPlainObject(value)) {
            target[key] = $.isPlainObject(target[key])
              ? $.widget.extend({}, target[key], value)

              // Don't extend strings, arrays, etc. with objects
              : $.widget.extend({}, value);

            // Copy everything else by reference
          } else {
            target[key] = value;
          }
        }
      }
    }
    return target;
  };

  $.widget.bridge = function (name, object) {
    const fullName = object.prototype.widgetFullName || name;
    $.fn[name] = function (options) {
      const isMethodCall = typeof options === 'string';
      const args = widgetSlice.call(arguments, 1);
      let returnValue = this;

      if (isMethodCall) {
        // If this is an empty collection, we need to have the instance method
        // return undefined instead of the jQuery instance
        if (!this.length && options === 'instance') {
          returnValue = undefined;
        } else {
          this.each(function () {
            let methodValue;
            const instance = $.data(this, fullName);

            if (options === 'instance') {
              returnValue = instance;
              return false;
            }

            if (!instance) {
              return $.error(`cannot call methods on ${name
              } prior to initialization; `
                + `attempted to call method '${options}'`);
            }

            if (!$.isFunction(instance[options]) || options.charAt(0) === '_') {
              return $.error(`no such method '${options}' for ${name
              } widget instance`);
            }

            methodValue = instance[options].apply(instance, args);

            if (methodValue !== instance && methodValue !== undefined) {
              returnValue = methodValue && methodValue.jquery
                ? returnValue.pushStack(methodValue.get())
                : methodValue;
              return false;
            }
          });
        }
      } else {
        // Allow multiple hashes to be passed on init
        if (args.length) {
          options = $.widget.extend.apply(null, [options].concat(args));
        }

        this.each(function () {
          const instance = $.data(this, fullName);
          if (instance) {
            instance.option(options || {});
            if (instance._init) {
              instance._init();
            }
          } else {
            $.data(this, fullName, new object(options, this));
          }
        });
      }

      return returnValue;
    };
  };

  $.Widget = function (/* options, element */) {};
  $.Widget._childConstructors = [];

  $.Widget.prototype = {
    widgetName: 'widget',
    widgetEventPrefix: '',
    defaultElement: '<div>',

    options: {
      classes: {},
      disabled: false,

      // Callbacks
      create: null,
    },

    _createWidget(options, element) {
      element = $(element || this.defaultElement || this)[0];
      this.element = $(element);
      this.uuid = widgetUuid++;
      this.eventNamespace = `.${this.widgetName}${this.uuid}`;

      this.bindings = $();
      this.hoverable = $();
      this.focusable = $();
      this.classesElementLookup = {};

      if (element !== this) {
        $.data(element, this.widgetFullName, this);
        this._on(true, this.element, {
          remove(event) {
            if (event.target === element) {
              this.destroy();
            }
          },
        });
        this.document = $(element.style

          // Element within the document
          ? element.ownerDocument

          // Element is window or document
          : element.document || element);
        this.window = $(this.document[0].defaultView || this.document[0].parentWindow);
      }

      this.options = $.widget.extend(
        {},
        this.options,
        this._getCreateOptions(),
        options,
      );

      this._create();

      if (this.options.disabled) {
        this._setOptionDisabled(this.options.disabled);
      }

      this._trigger('create', null, this._getCreateEventData());
      this._init();
    },

    _getCreateOptions() {
      return {};
    },

    _getCreateEventData: $.noop,

    _create: $.noop,

    _init: $.noop,

    destroy() {
      const that = this;

      this._destroy();
      $.each(this.classesElementLookup, (key, value) => {
        that._removeClass(value, key);
      });

      // We can probably remove the unbind calls in 2.0
      // all event bindings should go through this._on()
      this.element
        .off(this.eventNamespace)
        .removeData(this.widgetFullName);
      this.widget()
        .off(this.eventNamespace)
        .removeAttr('aria-disabled');

      // Clean up events and states
      this.bindings.off(this.eventNamespace);
    },

    _destroy: $.noop,

    widget() {
      return this.element;
    },

    option(key, value) {
      let options = key;
      let parts;
      let curOption;
      let i;

      if (arguments.length === 0) {
        // Don't return a reference to the internal hash
        return $.widget.extend({}, this.options);
      }

      if (typeof key === 'string') {
        // Handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
        options = {};
        parts = key.split('.');
        key = parts.shift();
        if (parts.length) {
          curOption = options[key] = $.widget.extend({}, this.options[key]);
          for (i = 0; i < parts.length - 1; i++) {
            curOption[parts[i]] = curOption[parts[i]] || {};
            curOption = curOption[parts[i]];
          }
          key = parts.pop();
          if (arguments.length === 1) {
            return curOption[key] === undefined ? null : curOption[key];
          }
          curOption[key] = value;
        } else {
          if (arguments.length === 1) {
            return this.options[key] === undefined ? null : this.options[key];
          }
          options[key] = value;
        }
      }

      this._setOptions(options);

      return this;
    },

    _setOptions(options) {
      let key;

      for (key in options) {
        this._setOption(key, options[key]);
      }

      return this;
    },

    _setOption(key, value) {
      if (key === 'classes') {
        this._setOptionClasses(value);
      }

      this.options[key] = value;

      if (key === 'disabled') {
        this._setOptionDisabled(value);
      }

      return this;
    },

    _setOptionClasses(value) {
      let classKey; let elements; let
        currentElements;

      for (classKey in value) {
        currentElements = this.classesElementLookup[classKey];
        if (value[classKey] === this.options.classes[classKey]
          || !currentElements
          || !currentElements.length) {
          continue;
        }

        // We are doing this to create a new jQuery object because the _removeClass() call
        // on the next line is going to destroy the reference to the current elements being
        // tracked. We need to save a copy of this collection so that we can add the new classes
        // below.
        elements = $(currentElements.get());
        this._removeClass(currentElements, classKey);

        // We don't use _addClass() here, because that uses this.options.classes
        // for generating the string of classes. We want to use the value passed in from
        // _setOption(), this is the new value of the classes option which was passed to
        // _setOption(). We pass this value directly to _classes().
        elements.addClass(this._classes({
          element: elements,
          keys: classKey,
          classes: value,
          add: true,
        }));
      }
    },

    _setOptionDisabled(value) {
      this._toggleClass(this.widget(), `${this.widgetFullName}-disabled`, null, !!value);

      // If the widget is becoming disabled, then nothing is interactive
      if (value) {
        this._removeClass(this.hoverable, null, 'ui-state-hover');
        this._removeClass(this.focusable, null, 'ui-state-focus');
      }
    },

    enable() {
      return this._setOptions({ disabled: false });
    },

    disable() {
      return this._setOptions({ disabled: true });
    },

    _classes(options) {
      const full = [];
      const that = this;

      options = $.extend({
        element: this.element,
        classes: this.options.classes || {},
      }, options);

      function processClassString(classes, checkOption) {
        let current; let
          i;
        for (i = 0; i < classes.length; i++) {
          current = that.classesElementLookup[classes[i]] || $();
          if (options.add) {
            current = $($.unique(current.get().concat(options.element.get())));
          } else {
            current = $(current.not(options.element).get());
          }
          that.classesElementLookup[classes[i]] = current;
          full.push(classes[i]);
          if (checkOption && options.classes[classes[i]]) {
            full.push(options.classes[classes[i]]);
          }
        }
      }

      this._on(options.element, {
        remove: '_untrackClassesElement',
      });

      if (options.keys) {
        processClassString(options.keys.match(/\S+/g) || [], true);
      }
      if (options.extra) {
        processClassString(options.extra.match(/\S+/g) || []);
      }

      return full.join(' ');
    },

    _untrackClassesElement(event) {
      const that = this;
      $.each(that.classesElementLookup, (key, value) => {
        if ($.inArray(event.target, value) !== -1) {
          that.classesElementLookup[key] = $(value.not(event.target).get());
        }
      });
    },

    _removeClass(element, keys, extra) {
      return this._toggleClass(element, keys, extra, false);
    },

    _addClass(element, keys, extra) {
      return this._toggleClass(element, keys, extra, true);
    },

    _toggleClass(element, keys, extra, add) {
      add = (typeof add === 'boolean') ? add : extra;
      const shift = (typeof element === 'string' || element === null);
      const options = {
        extra: shift ? keys : extra,
        keys: shift ? element : keys,
        element: shift ? this.element : element,
        add,
      };
      options.element.toggleClass(this._classes(options), add);
      return this;
    },

    _on(suppressDisabledCheck, element, handlers) {
      let delegateElement;
      const instance = this;

      // No suppressDisabledCheck flag, shuffle arguments
      if (typeof suppressDisabledCheck !== 'boolean') {
        handlers = element;
        element = suppressDisabledCheck;
        suppressDisabledCheck = false;
      }

      // No element argument, shuffle and use this.element
      if (!handlers) {
        handlers = element;
        element = this.element;
        delegateElement = this.widget();
      } else {
        element = delegateElement = $(element);
        this.bindings = this.bindings.add(element);
      }

      $.each(handlers, (event, handler) => {
        function handlerProxy() {
          // Allow widgets to customize the disabled handling
          // - disabled as an array instead of boolean
          // - disabled class as method for disabling individual parts
          if (!suppressDisabledCheck
            && (instance.options.disabled === true
              || $(this).hasClass('ui-state-disabled'))) {
            return;
          }
          return (typeof handler === 'string' ? instance[handler] : handler)
            .apply(instance, arguments);
        }

        // Copy the guid so direct unbinding works
        if (typeof handler !== 'string') {
          handlerProxy.guid = handler.guid = handler.guid || handlerProxy.guid || $.guid++;
        }

        const match = event.match(/^([\w:-]*)\s*(.*)$/);
        const eventName = match[1] + instance.eventNamespace;
        const selector = match[2];

        if (selector) {
          delegateElement.on(eventName, selector, handlerProxy);
        } else {
          element.on(eventName, handlerProxy);
        }
      });
    },

    _off(element, eventName) {
      eventName = (eventName || '').split(' ').join(`${this.eventNamespace} `)
        + this.eventNamespace;
      element.off(eventName).off(eventName);

      // Clear the stack to avoid memory leaks (#10056)
      this.bindings = $(this.bindings.not(element).get());
      this.focusable = $(this.focusable.not(element).get());
      this.hoverable = $(this.hoverable.not(element).get());
    },

    _delay(handler, delay) {
      function handlerProxy() {
        return (typeof handler === 'string' ? instance[handler] : handler)
          .apply(instance, arguments);
      }
      var instance = this;
      return setTimeout(handlerProxy, delay || 0);
    },

    _hoverable(element) {
      this.hoverable = this.hoverable.add(element);
      this._on(element, {
        mouseenter(event) {
          this._addClass($(event.currentTarget), null, 'ui-state-hover');
        },
        mouseleave(event) {
          this._removeClass($(event.currentTarget), null, 'ui-state-hover');
        },
      });
    },

    _focusable(element) {
      this.focusable = this.focusable.add(element);
      this._on(element, {
        focusin(event) {
          this._addClass($(event.currentTarget), null, 'ui-state-focus');
        },
        focusout(event) {
          this._removeClass($(event.currentTarget), null, 'ui-state-focus');
        },
      });
    },

    _trigger(type, event, data) {
      let prop; let
        orig;
      const callback = this.options[type];

      data = data || {};
      event = $.Event(event);
      event.type = (type === this.widgetEventPrefix
        ? type
        : this.widgetEventPrefix + type).toLowerCase();

      // The original event may come from any element
      // so we need to reset the target on the new event
      event.target = this.element[0];

      // Copy original event properties over to the new event
      orig = event.originalEvent;
      if (orig) {
        for (prop in orig) {
          if (!(prop in event)) {
            event[prop] = orig[prop];
          }
        }
      }

      this.element.trigger(event, data);
      return !($.isFunction(callback)
        && callback.apply(this.element[0], [event].concat(data)) === false
        || event.isDefaultPrevented());
    },
  };

  $.each({ show: 'fadeIn', hide: 'fadeOut' }, (method, defaultEffect) => {
    $.Widget.prototype[`_${method}`] = function (element, options, callback) {
      if (typeof options === 'string') {
        options = { effect: options };
      }

      let hasOptions;
      const effectName = !options
        ? method
        : options === true || typeof options === 'number'
          ? defaultEffect
          : options.effect || defaultEffect;

      options = options || {};
      if (typeof options === 'number') {
        options = { duration: options };
      }

      hasOptions = !$.isEmptyObject(options);
      options.complete = callback;

      if (options.delay) {
        element.delay(options.delay);
      }

      if (hasOptions && $.effects && $.effects.effect[effectName]) {
        element[method](options);
      } else if (effectName !== method && element[effectName]) {
        element[effectName](options.duration, options.easing, callback);
      } else {
        element.queue(function (next) {
          $(this)[method]();
          if (callback) {
            callback.call(element[0]);
          }
          next();
        });
      }
    };
  });

  const { widget } = $;

  /*!
   * jQuery UI :data 1.12.1
   * http://jqueryui.com
   *
   * Copyright jQuery Foundation and other contributors
   * Released under the MIT license.
   * http://jquery.org/license
   */

  // >>label: :data Selector
  // >>group: Core
  // >>description: Selects elements which have data stored under the specified key.
  // >>docs: http://api.jqueryui.com/data-selector/

  const data = $.extend($.expr[':'], {
    data: $.expr.createPseudo
      ? $.expr.createPseudo((dataName) => function (elem) {
        return !!$.data(elem, dataName);
      })

      // Support: jQuery <1.8
      : function (elem, i, match) {
        return !!$.data(elem, match[3]);
      },
  });

  /*!
   * jQuery UI Scroll Parent 1.12.1
   * http://jqueryui.com
   *
   * Copyright jQuery Foundation and other contributors
   * Released under the MIT license.
   * http://jquery.org/license
   */

  // >>label: scrollParent
  // >>group: Core
  // >>description: Get the closest ancestor element that is scrollable.
  // >>docs: http://api.jqueryui.com/scrollParent/

  const scrollParent = $.fn.scrollParent = function (includeHidden) {
    const position = this.css('position');
    const excludeStaticParent = position === 'absolute';
    const overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/;
    const scrollParent = this.parents().filter(function () {
      const parent = $(this);
      if (excludeStaticParent && parent.css('position') === 'static') {
        return false;
      }
      return overflowRegex.test(parent.css('overflow') + parent.css('overflow-y')
          + parent.css('overflow-x'));
    }).eq(0);

    return position === 'fixed' || !scrollParent.length
      ? $(this[0].ownerDocument || document)
      : scrollParent;
  };

  // This file is deprecated
  const ie = $.ui.ie = !!/msie [\w.]+/.exec(navigator.userAgent.toLowerCase());

  /*!
   * jQuery UI Mouse 1.12.1
   * http://jqueryui.com
   *
   * Copyright jQuery Foundation and other contributors
   * Released under the MIT license.
   * http://jquery.org/license
   */

  // >>label: Mouse
  // >>group: Widgets
  // >>description: Abstracts mouse-based interactions to assist in creating certain widgets.
  // >>docs: http://api.jqueryui.com/mouse/

  let mouseHandled = false;
  $(document).on('mouseup', () => {
    mouseHandled = false;
  });

  const widgetsMouse = $.widget('ui.mouse', {
    version: '1.12.1',
    options: {
      cancel: 'input, textarea, button, select, option',
      distance: 1,
      delay: 0,
    },
    _mouseInit() {
      const that = this;

      this.element
        .on(`mousedown.${this.widgetName}`, (event) => that._mouseDown(event))
        .on(`click.${this.widgetName}`, (event) => {
          if ($.data(event.target, `${that.widgetName}.preventClickEvent`) === true) {
            $.removeData(event.target, `${that.widgetName}.preventClickEvent`);
            event.stopImmediatePropagation();
            return false;
          }
        });

      this.started = false;
    },

    // TODO: make sure destroying one instance of mouse doesn't mess with
    // other instances of mouse
    _mouseDestroy() {
      this.element.off(`.${this.widgetName}`);
      if (this._mouseMoveDelegate) {
        this.document
          .off(`mousemove.${this.widgetName}`, this._mouseMoveDelegate)
          .off(`mouseup.${this.widgetName}`, this._mouseUpDelegate);
      }
    },

    _mouseDown(event) {
      // don't let more than one widget handle mouseStart
      if (mouseHandled) {
        return;
      }

      this._mouseMoved = false;

      // We may have missed mouseup (out of window)
      (this._mouseStarted && this._mouseUp(event));

      this._mouseDownEvent = event;

      const that = this;
      const btnIsLeft = (event.which === 1);

      // event.target.nodeName works around a bug in IE 8 with
      // disabled inputs (#7620)
      const elIsCancel = (typeof this.options.cancel === 'string' && event.target.nodeName
        ? $(event.target).closest(this.options.cancel).length : false);
      if (!btnIsLeft || elIsCancel || !this._mouseCapture(event)) {
        return true;
      }

      this.mouseDelayMet = !this.options.delay;
      if (!this.mouseDelayMet) {
        this._mouseDelayTimer = setTimeout(() => {
          that.mouseDelayMet = true;
        }, this.options.delay);
      }

      if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
        this._mouseStarted = (this._mouseStart(event) !== false);
        if (!this._mouseStarted) {
          event.preventDefault();
          return true;
        }
      }

      // Click event may never have fired (Gecko & Opera)
      if ($.data(event.target, `${this.widgetName}.preventClickEvent`) === true) {
        $.removeData(event.target, `${this.widgetName}.preventClickEvent`);
      }

      // These delegates are required to keep context
      this._mouseMoveDelegate = function (event) {
        return that._mouseMove(event);
      };
      this._mouseUpDelegate = function (event) {
        return that._mouseUp(event);
      };

      this.document
        .on(`mousemove.${this.widgetName}`, this._mouseMoveDelegate)
        .on(`mouseup.${this.widgetName}`, this._mouseUpDelegate);

      event.preventDefault();

      mouseHandled = true;
      return true;
    },

    _mouseMove(event) {
      // Only check for mouseups outside the document if you've moved inside the document
      // at least once. This prevents the firing of mouseup in the case of IE<9, which will
      // fire a mousemove event if content is placed under the cursor. See #7778
      // Support: IE <9
      if (this._mouseMoved) {
        // IE mouseup check - mouseup happened when mouse was out of window
        if ($.ui.ie && (!document.documentMode || document.documentMode < 9)
          && !event.button) {
          return this._mouseUp(event);

          // Iframe mouseup check - mouseup occurred in another document
        } if (!event.which) {
          // Support: Safari <=8 - 9
          // Safari sets which to 0 if you press any of the following keys
          // during a drag (#14461)
          if (event.originalEvent.altKey || event.originalEvent.ctrlKey
            || event.originalEvent.metaKey || event.originalEvent.shiftKey) {
            this.ignoreMissingWhich = true;
          } else if (!this.ignoreMissingWhich) {
            return this._mouseUp(event);
          }
        }
      }

      if (event.which || event.button) {
        this._mouseMoved = true;
      }

      if (this._mouseStarted) {
        this._mouseDrag(event);
        return event.preventDefault();
      }

      if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
        this._mouseStarted = (this._mouseStart(this._mouseDownEvent, event) !== false);
        (this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event));
      }

      return !this._mouseStarted;
    },

    _mouseUp(event) {
      this.document
        .off(`mousemove.${this.widgetName}`, this._mouseMoveDelegate)
        .off(`mouseup.${this.widgetName}`, this._mouseUpDelegate);

      if (this._mouseStarted) {
        this._mouseStarted = false;

        if (event.target === this._mouseDownEvent.target) {
          $.data(event.target, `${this.widgetName}.preventClickEvent`, true);
        }

        this._mouseStop(event);
      }

      if (this._mouseDelayTimer) {
        clearTimeout(this._mouseDelayTimer);
        delete this._mouseDelayTimer;
      }

      this.ignoreMissingWhich = false;
      mouseHandled = false;
      event.preventDefault();
    },

    _mouseDistanceMet(event) {
      return (Math.max(
        Math.abs(this._mouseDownEvent.pageX - event.pageX),
        Math.abs(this._mouseDownEvent.pageY - event.pageY),
      ) >= this.options.distance
      );
    },

    _mouseDelayMet(/* event */) {
      return this.mouseDelayMet;
    },

    // These are placeholder methods, to be overriden by extending plugin
    _mouseStart(/* event */) {},
    _mouseDrag(/* event */) {},
    _mouseStop(/* event */) {},
    _mouseCapture(/* event */) { return true; },
  });

  /*!
   * jQuery UI Sortable 1.12.1
   * http://jqueryui.com
   *
   * Copyright jQuery Foundation and other contributors
   * Released under the MIT license.
   * http://jquery.org/license
   */

  // >>label: Sortable
  // >>group: Interactions
  // >>description: Enables items in a list to be sorted using the mouse.
  // >>docs: http://api.jqueryui.com/sortable/
  // >>demos: http://jqueryui.com/sortable/
  // >>css.structure: ../../themes/base/sortable.css

  const widgetsSortable = $.widget('ui.sortable', $.ui.mouse, {
    version: '1.12.1',
    widgetEventPrefix: 'sort',
    ready: false,
    options: {
      appendTo: 'parent',
      axis: false,
      connectWith: false,
      containment: false,
      cursor: 'auto',
      cursorAt: false,
      dropOnEmpty: true,
      forcePlaceholderSize: false,
      forceHelperSize: false,
      grid: false,
      handle: false,
      helper: 'original',
      items: '> *',
      opacity: false,
      placeholder: false,
      revert: false,
      scroll: true,
      scrollSensitivity: 20,
      scrollSpeed: 20,
      scope: 'default',
      tolerance: 'intersect',
      zIndex: 1000,

      // Callbacks
      activate: null,
      beforeStop: null,
      change: null,
      deactivate: null,
      out: null,
      over: null,
      receive: null,
      remove: null,
      sort: null,
      start: null,
      stop: null,
      update: null,
    },

    _isOverAxis(x, reference, size) {
      return (x >= reference) && (x < (reference + size));
    },

    _isFloating(item) {
      return (/left|right/).test(item.css('float'))
        || (/inline|table-cell/).test(item.css('display'));
    },

    _create() {
      this.containerCache = {};
      this._addClass('ui-sortable');

      // Get the items
      this.refresh();

      // Let's determine the parent's offset
      this.offset = this.element.offset();

      // Initialize mouse events for interaction
      this._mouseInit();

      this._setHandleClassName();

      // We're ready to go
      this.ready = true;
    },

    _setOption(key, value) {
      this._super(key, value);

      if (key === 'handle') {
        this._setHandleClassName();
      }
    },

    _setHandleClassName() {
      const that = this;
      this._removeClass(this.element.find('.ui-sortable-handle'), 'ui-sortable-handle');
      $.each(this.items, function () {
        that._addClass(
          this.instance.options.handle
            ? this.item.find(this.instance.options.handle)
            : this.item,
          'ui-sortable-handle',
        );
      });
    },

    _destroy() {
      this._mouseDestroy();

      for (let i = this.items.length - 1; i >= 0; i--) {
        this.items[i].item.removeData(`${this.widgetName}-item`);
      }

      return this;
    },

    _mouseCapture(event, overrideHandle) {
      let currentItem = null;
      let validHandle = false;
      const that = this;

      if (this.reverting) {
        return false;
      }

      if (this.options.disabled || this.options.type === 'static') {
        return false;
      }

      // We have to refresh the items data once first
      this._refreshItems(event);

      // Find out if the clicked node (or one of its parents) is a actual item in this.items
      $(event.target).parents().each(function () {
        if ($.data(this, `${that.widgetName}-item`) === that) {
          currentItem = $(this);
          return false;
        }
      });
      if ($.data(event.target, `${that.widgetName}-item`) === that) {
        currentItem = $(event.target);
      }

      if (!currentItem) {
        return false;
      }
      if (this.options.handle && !overrideHandle) {
        $(this.options.handle, currentItem).find('*').addBack().each(function () {
          if (this === event.target) {
            validHandle = true;
          }
        });
        if (!validHandle) {
          return false;
        }
      }

      this.currentItem = currentItem;
      this._removeCurrentsFromItems();
      return true;
    },

    _mouseStart(event, overrideHandle, noActivation) {
      let i; let body;
      const o = this.options;

      this.currentContainer = this;

      // We only need to call refreshPositions, because the refreshItems call has been moved to
      // mouseCapture
      this.refreshPositions();

      // Create and append the visible helper
      this.helper = this._createHelper(event);

      // Cache the helper size
      this._cacheHelperProportions();

      /*
       * - Position generation -
       * This block generates everything position related - it's the core of draggables.
       */

      // Cache the margins of the original element
      this._cacheMargins();

      // Get the next scrolling parent
      this.scrollParent = this.helper.scrollParent();

      // The element's absolute position on the page minus margins
      this.offset = this.currentItem.offset();
      this.offset = {
        top: this.offset.top - this.margins.top,
        left: this.offset.left - this.margins.left,
      };

      $.extend(this.offset, {
        click: { // Where the click happened, relative to the element
          left: event.pageX - this.offset.left,
          top: event.pageY - this.offset.top,
        },
        parent: this._getParentOffset(),

        // This is a relative to absolute position minus the actual position calculation -
        // only used for relative positioned helper
        relative: this._getRelativeOffset(),
      });

      // Only after we got the offset, we can change the helper's position to absolute
      // TODO: Still need to figure out a way to make relative sorting possible
      this.helper.css('position', 'absolute');
      this.cssPosition = this.helper.css('position');

      // Generate the original position
      this.originalPosition = this._generatePosition(event);
      this.originalPageX = event.pageX;
      this.originalPageY = event.pageY;

      // Adjust the mouse offset relative to the helper if "cursorAt" is supplied
      (o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt));

      // Cache the former DOM position
      this.domPosition = {
        prev: this.currentItem.prev()[0],
        parent: this.currentItem.parent()[0],
      };

      // If the helper is not the original, hide the original so it's not playing any role during
      // the drag, won't cause anything bad this way
      if (this.helper[0] !== this.currentItem[0]) {
        this.currentItem.hide();
      }

      // Create the placeholder
      this._createPlaceholder();

      // Set a containment if given in the options
      if (o.containment) {
        this._setContainment();
      }

      if (o.cursor && o.cursor !== 'auto') { // cursor option
        body = this.document.find('body');

        // Support: IE
        this.storedCursor = body.css('cursor');
        body.css('cursor', o.cursor);

        this.storedStylesheet = $(`<style>*{ cursor: ${o.cursor} !important; }</style>`).appendTo(body);
      }

      if (o.opacity) { // opacity option
        if (this.helper.css('opacity')) {
          this._storedOpacity = this.helper.css('opacity');
        }
        this.helper.css('opacity', o.opacity);
      }

      if (o.zIndex) { // zIndex option
        if (this.helper.css('zIndex')) {
          this._storedZIndex = this.helper.css('zIndex');
        }
        this.helper.css('zIndex', o.zIndex);
      }

      // Prepare scrolling
      if (this.scrollParent[0] !== this.document[0]
        && this.scrollParent[0].tagName !== 'HTML') {
        this.overflowOffset = this.scrollParent.offset();
      }

      // Call callbacks
      this._trigger('start', event, this._uiHash());

      // Recache the helper size
      if (!this._preserveHelperProportions) {
        this._cacheHelperProportions();
      }

      // Post "activate" events to possible containers
      if (!noActivation) {
        for (i = this.containers.length - 1; i >= 0; i--) {
          this.containers[i]._trigger('activate', event, this._uiHash(this));
        }
      }

      // Prepare possible droppables
      if ($.ui.ddmanager) {
        $.ui.ddmanager.current = this;
      }

      if ($.ui.ddmanager && !o.dropBehaviour) {
        $.ui.ddmanager.prepareOffsets(this, event);
      }

      this.dragging = true;

      this._addClass(this.helper, 'ui-sortable-helper');

      // Execute the drag once - this causes the helper not to be visiblebefore getting its
      // correct position
      this._mouseDrag(event);
      return true;
    },

    _mouseDrag(event) {
      let i; let item; let itemElement; let intersection;
      const o = this.options;
      let scrolled = false;

      // Compute the helpers position
      this.position = this._generatePosition(event);
      this.positionAbs = this._convertPositionTo('absolute');

      if (!this.lastPositionAbs) {
        this.lastPositionAbs = this.positionAbs;
      }

      // Do scrolling
      if (this.options.scroll) {
        if (this.scrollParent[0] !== this.document[0]
          && this.scrollParent[0].tagName !== 'HTML') {
          if ((this.overflowOffset.top + this.scrollParent[0].offsetHeight)
            - event.pageY < o.scrollSensitivity) {
            this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop + o.scrollSpeed;
          } else if (event.pageY - this.overflowOffset.top < o.scrollSensitivity) {
            this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop - o.scrollSpeed;
          }

          if ((this.overflowOffset.left + this.scrollParent[0].offsetWidth)
            - event.pageX < o.scrollSensitivity) {
            this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft + o.scrollSpeed;
          } else if (event.pageX - this.overflowOffset.left < o.scrollSensitivity) {
            this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft - o.scrollSpeed;
          }
        } else {
          if (event.pageY - this.document.scrollTop() < o.scrollSensitivity) {
            scrolled = this.document.scrollTop(this.document.scrollTop() - o.scrollSpeed);
          } else if (this.window.height() - (event.pageY - this.document.scrollTop())
            < o.scrollSensitivity) {
            scrolled = this.document.scrollTop(this.document.scrollTop() + o.scrollSpeed);
          }

          if (event.pageX - this.document.scrollLeft() < o.scrollSensitivity) {
            scrolled = this.document.scrollLeft(
              this.document.scrollLeft() - o.scrollSpeed,
            );
          } else if (this.window.width() - (event.pageX - this.document.scrollLeft())
            < o.scrollSensitivity) {
            scrolled = this.document.scrollLeft(
              this.document.scrollLeft() + o.scrollSpeed,
            );
          }
        }

        if (scrolled !== false && $.ui.ddmanager && !o.dropBehaviour) {
          $.ui.ddmanager.prepareOffsets(this, event);
        }
      }

      // Regenerate the absolute position used for position checks
      this.positionAbs = this._convertPositionTo('absolute');

      // Set the helper position
      if (!this.options.axis || this.options.axis !== 'y') {
        this.helper[0].style.left = `${this.position.left}px`;
      }
      if (!this.options.axis || this.options.axis !== 'x') {
        this.helper[0].style.top = `${this.position.top}px`;
      }

      // Rearrange
      for (i = this.items.length - 1; i >= 0; i--) {
        // Cache variables and intersection, continue if no intersection
        item = this.items[i];
        itemElement = item.item[0];
        intersection = this._intersectsWithPointer(item);
        if (!intersection) {
          continue;
        }

        // Only put the placeholder inside the current Container, skip all
        // items from other containers. This works because when moving
        // an item from one container to another the
        // currentContainer is switched before the placeholder is moved.
        //
        // Without this, moving items in "sub-sortables" can cause
        // the placeholder to jitter between the outer and inner container.
        if (item.instance !== this.currentContainer) {
          continue;
        }

        // Cannot intersect with itself
        // no useless actions that have been done before
        // no action if the item moved is the parent of the item checked
        if (itemElement !== this.currentItem[0]
          && this.placeholder[intersection === 1 ? 'next' : 'prev']()[0] !== itemElement
          && !$.contains(this.placeholder[0], itemElement)
          && (this.options.type === 'semi-dynamic'
            ? !$.contains(this.element[0], itemElement)
            : true
          )
        ) {
          this.direction = intersection === 1 ? 'down' : 'up';

          if (this.options.tolerance === 'pointer' || this._intersectsWithSides(item)) {
            this._rearrange(event, item);
          } else {
            break;
          }

          this._trigger('change', event, this._uiHash());
          break;
        }
      }

      // Post events to containers
      this._contactContainers(event);

      // Interconnect with droppables
      if ($.ui.ddmanager) {
        $.ui.ddmanager.drag(this, event);
      }

      // Call callbacks
      this._trigger('sort', event, this._uiHash());

      this.lastPositionAbs = this.positionAbs;
      return false;
    },

    _mouseStop(event, noPropagation) {
      if (!event) {
        return;
      }

      // If we are using droppables, inform the manager about the drop
      if ($.ui.ddmanager && !this.options.dropBehaviour) {
        $.ui.ddmanager.drop(this, event);
      }

      if (this.options.revert) {
        const that = this;
        const cur = this.placeholder.offset();
        const { axis } = this.options;
        const animation = {};

        if (!axis || axis === 'x') {
          animation.left = cur.left - this.offset.parent.left - this.margins.left
            + (this.offsetParent[0] === this.document[0].body
              ? 0
              : this.offsetParent[0].scrollLeft
            );
        }
        if (!axis || axis === 'y') {
          animation.top = cur.top - this.offset.parent.top - this.margins.top
            + (this.offsetParent[0] === this.document[0].body
              ? 0
              : this.offsetParent[0].scrollTop
            );
        }
        this.reverting = true;
        $(this.helper).animate(
          animation,
          parseInt(this.options.revert, 10) || 500,
          () => {
            that._clear(event);
          },
        );
      } else {
        this._clear(event, noPropagation);
      }

      return false;
    },

    cancel() {
      if (this.dragging) {
        this._mouseUp(new $.Event('mouseup', { target: null }));

        if (this.options.helper === 'original') {
          this.currentItem.css(this._storedCSS);
          this._removeClass(this.currentItem, 'ui-sortable-helper');
        } else {
          this.currentItem.show();
        }

        // Post deactivating events to containers
        for (let i = this.containers.length - 1; i >= 0; i--) {
          this.containers[i]._trigger('deactivate', null, this._uiHash(this));
          if (this.containers[i].containerCache.over) {
            this.containers[i]._trigger('out', null, this._uiHash(this));
            this.containers[i].containerCache.over = 0;
          }
        }
      }

      if (this.placeholder) {
        // $(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately,
        // it unbinds ALL events from the original node!
        if (this.placeholder[0].parentNode) {
          this.placeholder[0].parentNode.removeChild(this.placeholder[0]);
        }
        if (this.options.helper !== 'original' && this.helper
          && this.helper[0].parentNode) {
          this.helper.remove();
        }

        $.extend(this, {
          helper: null,
          dragging: false,
          reverting: false,
          _noFinalSort: null,
        });

        if (this.domPosition.prev) {
          $(this.domPosition.prev).after(this.currentItem);
        } else {
          $(this.domPosition.parent).prepend(this.currentItem);
        }
      }

      return this;
    },

    serialize(o) {
      const items = this._getItemsAsjQuery(o && o.connected);
      const str = [];
      o = o || {};

      $(items).each(function () {
        const res = ($(o.item || this).attr(o.attribute || 'id') || '')
          .match(o.expression || (/(.+)[\-=_](.+)/));
        if (res) {
          str.push(
            `${o.key || `${res[1]}[]`
            }=${o.key && o.expression ? res[1] : res[2]}`,
          );
        }
      });

      if (!str.length && o.key) {
        str.push(`${o.key}=`);
      }

      return str.join('&');
    },

    toArray(o) {
      const items = this._getItemsAsjQuery(o && o.connected);
      const ret = [];

      o = o || {};

      items.each(function () {
        ret.push($(o.item || this).attr(o.attribute || 'id') || '');
      });
      return ret;
    },

    /* Be careful with the following core functions */
    _intersectsWith(item) {
      const x1 = this.positionAbs.left;
      const x2 = x1 + this.helperProportions.width;
      const y1 = this.positionAbs.top;
      const y2 = y1 + this.helperProportions.height;
      const l = item.left;
      const r = l + item.width;
      const t = item.top;
      const b = t + item.height;
      const dyClick = this.offset.click.top;
      const dxClick = this.offset.click.left;
      const isOverElementHeight = (this.options.axis === 'x') || ((y1 + dyClick) > t
          && (y1 + dyClick) < b);
      const isOverElementWidth = (this.options.axis === 'y') || ((x1 + dxClick) > l
          && (x1 + dxClick) < r);
      const isOverElement = isOverElementHeight && isOverElementWidth;

      if (this.options.tolerance === 'pointer'
        || this.options.forcePointerForContainers
        || (this.options.tolerance !== 'pointer'
          && this.helperProportions[this.floating ? 'width' : 'height']
          > item[this.floating ? 'width' : 'height'])
      ) {
        return isOverElement;
      }

      return (l < x1 + (this.helperProportions.width / 2) // Right Half
          && x2 - (this.helperProportions.width / 2) < r // Left Half
          && t < y1 + (this.helperProportions.height / 2) // Bottom Half
          && y2 - (this.helperProportions.height / 2) < b); // Top Half
    },

    _intersectsWithPointer(item) {
      let verticalDirection; let horizontalDirection;
      const isOverElementHeight = (this.options.axis === 'x')
          || this._isOverAxis(this.positionAbs.top + this.offset.click.top, item.top, item.height);
      const isOverElementWidth = (this.options.axis === 'y')
          || this._isOverAxis(this.positionAbs.left + this.offset.click.left, item.left, item.width);
      const isOverElement = isOverElementHeight && isOverElementWidth;

      if (!isOverElement) {
        return false;
      }

      verticalDirection = this._getDragVerticalDirection();
      horizontalDirection = this._getDragHorizontalDirection();

      return this.floating
        ? ((horizontalDirection === 'right' || verticalDirection === 'down') ? 2 : 1)
        : (verticalDirection && (verticalDirection === 'down' ? 2 : 1));
    },

    _intersectsWithSides(item) {
      const isOverBottomHalf = this._isOverAxis(this.positionAbs.top
        + this.offset.click.top, item.top + (item.height / 2), item.height);
      const isOverRightHalf = this._isOverAxis(this.positionAbs.left
          + this.offset.click.left, item.left + (item.width / 2), item.width);
      const verticalDirection = this._getDragVerticalDirection();
      const horizontalDirection = this._getDragHorizontalDirection();

      if (this.floating && horizontalDirection) {
        return ((horizontalDirection === 'right' && isOverRightHalf)
          || (horizontalDirection === 'left' && !isOverRightHalf));
      }
      return verticalDirection && ((verticalDirection === 'down' && isOverBottomHalf)
          || (verticalDirection === 'up' && !isOverBottomHalf));
    },

    _getDragVerticalDirection() {
      const delta = this.positionAbs.top - this.lastPositionAbs.top;
      return delta !== 0 && (delta > 0 ? 'down' : 'up');
    },

    _getDragHorizontalDirection() {
      const delta = this.positionAbs.left - this.lastPositionAbs.left;
      return delta !== 0 && (delta > 0 ? 'right' : 'left');
    },

    refresh(event) {
      this._refreshItems(event);
      this._setHandleClassName();
      this.refreshPositions();
      return this;
    },

    _connectWith() {
      const { options } = this;
      return options.connectWith.constructor === String
        ? [options.connectWith]
        : options.connectWith;
    },

    _getItemsAsjQuery(connected) {
      let i; let j; let cur; let inst;
      const items = [];
      const queries = [];
      const connectWith = this._connectWith();

      if (connectWith && connected) {
        for (i = connectWith.length - 1; i >= 0; i--) {
          cur = $(connectWith[i], this.document[0]);
          for (j = cur.length - 1; j >= 0; j--) {
            inst = $.data(cur[j], this.widgetFullName);
            if (inst && inst !== this && !inst.options.disabled) {
              queries.push([$.isFunction(inst.options.items)
                ? inst.options.items.call(inst.element)
                : $(inst.options.items, inst.element)
                  .not('.ui-sortable-helper')
                  .not('.ui-sortable-placeholder'), inst]);
            }
          }
        }
      }

      queries.push([$.isFunction(this.options.items)
        ? this.options.items
          .call(this.element, null, { options: this.options, item: this.currentItem })
        : $(this.options.items, this.element)
          .not('.ui-sortable-helper')
          .not('.ui-sortable-placeholder'), this]);

      function addItems() {
        items.push(this);
      }
      for (i = queries.length - 1; i >= 0; i--) {
        queries[i][0].each(addItems);
      }

      return $(items);
    },

    _removeCurrentsFromItems() {
      const list = this.currentItem.find(`:data(${this.widgetName}-item)`);

      this.items = $.grep(this.items, (item) => {
        for (let j = 0; j < list.length; j++) {
          if (list[j] === item.item[0]) {
            return false;
          }
        }
        return true;
      });
    },

    _refreshItems(event) {
      this.items = [];
      this.containers = [this];

      let i; let j; let cur; let inst; let targetData; let _queries; let item; let queriesLength;
      const { items } = this;
      const queries = [[$.isFunction(this.options.items)
        ? this.options.items.call(this.element[0], event, { item: this.currentItem })
        : $(this.options.items, this.element), this]];
      const connectWith = this._connectWith();

      // Shouldn't be run the first time through due to massive slow-down
      if (connectWith && this.ready) {
        for (i = connectWith.length - 1; i >= 0; i--) {
          cur = $(connectWith[i], this.document[0]);
          for (j = cur.length - 1; j >= 0; j--) {
            inst = $.data(cur[j], this.widgetFullName);
            if (inst && inst !== this && !inst.options.disabled) {
              queries.push([$.isFunction(inst.options.items)
                ? inst.options.items
                  .call(inst.element[0], event, { item: this.currentItem })
                : $(inst.options.items, inst.element), inst]);
              this.containers.push(inst);
            }
          }
        }
      }

      for (i = queries.length - 1; i >= 0; i--) {
        targetData = queries[i][1];
        _queries = queries[i][0];

        for (j = 0, queriesLength = _queries.length; j < queriesLength; j++) {
          item = $(_queries[j]);

          // Data for target checking (mouse manager)
          item.data(`${this.widgetName}-item`, targetData);

          items.push({
            item,
            instance: targetData,
            width: 0,
            height: 0,
            left: 0,
            top: 0,
          });
        }
      }
    },

    refreshPositions(fast) {
      // Determine whether items are being displayed horizontally
      this.floating = this.items.length
        ? this.options.axis === 'x' || this._isFloating(this.items[0].item)
        : false;

      // This has to be redone because due to the item being moved out/into the offsetParent,
      // the offsetParent's position will change
      if (this.offsetParent && this.helper) {
        this.offset.parent = this._getParentOffset();
      }

      let i; let item; let t; let
        p;

      for (i = this.items.length - 1; i >= 0; i--) {
        item = this.items[i];

        // We ignore calculating positions of all connected containers when we're not over them
        if (item.instance !== this.currentContainer && this.currentContainer
          && item.item[0] !== this.currentItem[0]) {
          continue;
        }

        t = this.options.toleranceElement
          ? $(this.options.toleranceElement, item.item)
          : item.item;

        if (!fast) {
          item.width = t.outerWidth();
          item.height = t.outerHeight();
        }

        p = t.offset();
        item.left = p.left;
        item.top = p.top;
      }

      if (this.options.custom && this.options.custom.refreshContainers) {
        this.options.custom.refreshContainers.call(this);
      } else {
        for (i = this.containers.length - 1; i >= 0; i--) {
          p = this.containers[i].element.offset();
          this.containers[i].containerCache.left = p.left;
          this.containers[i].containerCache.top = p.top;
          this.containers[i].containerCache.width = this.containers[i].element.outerWidth();
          this.containers[i].containerCache.height = this.containers[i].element.outerHeight();
        }
      }

      return this;
    },

    _createPlaceholder(that) {
      that = that || this;
      let className;
      const o = that.options;

      if (!o.placeholder || o.placeholder.constructor === String) {
        className = o.placeholder;
        o.placeholder = {
          element() {
            const nodeName = that.currentItem[0].nodeName.toLowerCase();
            const element = $(`<${nodeName}>`, that.document[0]);

            that._addClass(
              element,
              'ui-sortable-placeholder',
              className || that.currentItem[0].className,
            )
              ._removeClass(element, 'ui-sortable-helper');

            if (nodeName === 'tbody') {
              that._createTrPlaceholder(
                that.currentItem.find('tr').eq(0),
                $('<tr>', that.document[0]).appendTo(element),
              );
            } else if (nodeName === 'tr') {
              that._createTrPlaceholder(that.currentItem, element);
            } else if (nodeName === 'img') {
              element.attr('src', that.currentItem.attr('src'));
            }

            if (!className) {
              element.css('visibility', 'hidden');
            }

            return element;
          },
          update(container, p) {
            // 1. If a className is set as 'placeholder option, we don't force sizes -
            // the class is responsible for that
            // 2. The option 'forcePlaceholderSize can be enabled to force it even if a
            // class name is specified
            if (className && !o.forcePlaceholderSize) {
              return;
            }

            // If the element doesn't have a actual height by itself (without styles coming
            // from a stylesheet), it receives the inline height from the dragged item
            if (!p.height()) {
              p.height(
                that.currentItem.innerHeight()
                - parseInt(that.currentItem.css('paddingTop') || 0, 10)
                - parseInt(that.currentItem.css('paddingBottom') || 0, 10),
              );
            }
            if (!p.width()) {
              p.width(
                that.currentItem.innerWidth()
                - parseInt(that.currentItem.css('paddingLeft') || 0, 10)
                - parseInt(that.currentItem.css('paddingRight') || 0, 10),
              );
            }
          },
        };
      }

      // Create the placeholder
      that.placeholder = $(o.placeholder.element.call(that.element, that.currentItem));

      // Append it after the actual current item
      that.currentItem.after(that.placeholder);

      // Update the size of the placeholder (TODO: Logic to fuzzy, see line 316/317)
      o.placeholder.update(that, that.placeholder);
    },

    _createTrPlaceholder(sourceTr, targetTr) {
      const that = this;

      sourceTr.children().each(function () {
        $('<td>&#160;</td>', that.document[0])
          .attr('colspan', $(this).attr('colspan') || 1)
          .appendTo(targetTr);
      });
    },

    _contactContainers(event) {
      let i; let j; let dist; let itemWithLeastDistance; let posProperty; let sizeProperty; let cur; let nearBottom;
      let floating; let axis;
      let innermostContainer = null;
      let innermostIndex = null;

      // Get innermost container that intersects with item
      for (i = this.containers.length - 1; i >= 0; i--) {
        // Never consider a container that's located within the item itself
        if ($.contains(this.currentItem[0], this.containers[i].element[0])) {
          continue;
        }

        if (this._intersectsWith(this.containers[i].containerCache)) {
          // If we've already found a container and it's more "inner" than this, then continue
          if (innermostContainer
            && $.contains(
              this.containers[i].element[0],
              innermostContainer.element[0],
            )) {
            continue;
          }

          innermostContainer = this.containers[i];
          innermostIndex = i;
        } else {
          // container doesn't intersect. trigger "out" event if necessary
          if (this.containers[i].containerCache.over) {
            this.containers[i]._trigger('out', event, this._uiHash(this));
            this.containers[i].containerCache.over = 0;
          }
        }
      }

      // If no intersecting containers found, return
      if (!innermostContainer) {
        return;
      }

      // Move the item into the container if it's not there already
      if (this.containers.length === 1) {
        if (!this.containers[innermostIndex].containerCache.over) {
          this.containers[innermostIndex]._trigger('over', event, this._uiHash(this));
          this.containers[innermostIndex].containerCache.over = 1;
        }
      } else {
        // When entering a new container, we will find the item with the least distance and
        // append our item near it
        dist = 10000;
        itemWithLeastDistance = null;
        floating = innermostContainer.floating || this._isFloating(this.currentItem);
        posProperty = floating ? 'left' : 'top';
        sizeProperty = floating ? 'width' : 'height';
        axis = floating ? 'pageX' : 'pageY';

        for (j = this.items.length - 1; j >= 0; j--) {
          if (!$.contains(this.containers[innermostIndex].element[0], this.items[j].item[0])
          ) {
            continue;
          }
          if (this.items[j].item[0] === this.currentItem[0]) {
            continue;
          }

          cur = this.items[j].item.offset()[posProperty];
          nearBottom = false;
          if (event[axis] - cur > this.items[j][sizeProperty] / 2) {
            nearBottom = true;
          }

          if (Math.abs(event[axis] - cur) < dist) {
            dist = Math.abs(event[axis] - cur);
            itemWithLeastDistance = this.items[j];
            this.direction = nearBottom ? 'up' : 'down';
          }
        }

        // Check if dropOnEmpty is enabled
        if (!itemWithLeastDistance && !this.options.dropOnEmpty) {
          return;
        }

        if (this.currentContainer === this.containers[innermostIndex]) {
          if (!this.currentContainer.containerCache.over) {
            this.containers[innermostIndex]._trigger('over', event, this._uiHash());
            this.currentContainer.containerCache.over = 1;
          }
          return;
        }

        itemWithLeastDistance
          ? this._rearrange(event, itemWithLeastDistance, null, true)
          : this._rearrange(event, null, this.containers[innermostIndex].element, true);
        this._trigger('change', event, this._uiHash());
        this.containers[innermostIndex]._trigger('change', event, this._uiHash(this));
        this.currentContainer = this.containers[innermostIndex];

        // Update the placeholder
        this.options.placeholder.update(this.currentContainer, this.placeholder);

        this.containers[innermostIndex]._trigger('over', event, this._uiHash(this));
        this.containers[innermostIndex].containerCache.over = 1;
      }
    },

    _createHelper(event) {
      const o = this.options;
      const helper = $.isFunction(o.helper)
        ? $(o.helper.apply(this.element[0], [event, this.currentItem]))
        : (o.helper === 'clone' ? this.currentItem.clone() : this.currentItem);

      // Add the helper to the DOM if that didn't happen already
      if (!helper.parents('body').length) {
        $(o.appendTo !== 'parent'
          ? o.appendTo
          : this.currentItem[0].parentNode)[0].appendChild(helper[0]);
      }

      if (helper[0] === this.currentItem[0]) {
        this._storedCSS = {
          width: this.currentItem[0].style.width,
          height: this.currentItem[0].style.height,
          position: this.currentItem.css('position'),
          top: this.currentItem.css('top'),
          left: this.currentItem.css('left'),
        };
      }

      if (!helper[0].style.width || o.forceHelperSize) {
        helper.width(this.currentItem.width());
      }
      if (!helper[0].style.height || o.forceHelperSize) {
        helper.height(this.currentItem.height());
      }

      return helper;
    },

    _adjustOffsetFromHelper(obj) {
      if (typeof obj === 'string') {
        obj = obj.split(' ');
      }
      if ($.isArray(obj)) {
        obj = { left: +obj[0], top: +obj[1] || 0 };
      }
      if ('left' in obj) {
        this.offset.click.left = obj.left + this.margins.left;
      }
      if ('right' in obj) {
        this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
      }
      if ('top' in obj) {
        this.offset.click.top = obj.top + this.margins.top;
      }
      if ('bottom' in obj) {
        this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
      }
    },

    _getParentOffset() {
      // Get the offsetParent and cache its position
      this.offsetParent = this.helper.offsetParent();
      let po = this.offsetParent.offset();

      // This is a special case where we need to modify a offset calculated on start, since the
      // following happened:
      // 1. The position of the helper is absolute, so it's position is calculated based on the
      // next positioned parent
      // 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't
      // the document, which means that the scroll is included in the initial calculation of the
      // offset of the parent, and never recalculated upon drag
      if (this.cssPosition === 'absolute' && this.scrollParent[0] !== this.document[0]
        && $.contains(this.scrollParent[0], this.offsetParent[0])) {
        po.left += this.scrollParent.scrollLeft();
        po.top += this.scrollParent.scrollTop();
      }

      // This needs to be actually done for all browsers, since pageX/pageY includes this
      // information with an ugly IE fix
      if (this.offsetParent[0] === this.document[0].body
        || (this.offsetParent[0].tagName
          && this.offsetParent[0].tagName.toLowerCase() === 'html' && $.ui.ie)) {
        po = { top: 0, left: 0 };
      }

      return {
        top: po.top + (parseInt(this.offsetParent.css('borderTopWidth'), 10) || 0),
        left: po.left + (parseInt(this.offsetParent.css('borderLeftWidth'), 10) || 0),
      };
    },

    _getRelativeOffset() {
      if (this.cssPosition === 'relative') {
        const p = this.currentItem.position();
        return {
          top: p.top - (parseInt(this.helper.css('top'), 10) || 0)
          + this.scrollParent.scrollTop(),
          left: p.left - (parseInt(this.helper.css('left'), 10) || 0)
          + this.scrollParent.scrollLeft(),
        };
      }
      return { top: 0, left: 0 };
    },

    _cacheMargins() {
      this.margins = {
        left: (parseInt(this.currentItem.css('marginLeft'), 10) || 0),
        top: (parseInt(this.currentItem.css('marginTop'), 10) || 0),
      };
    },

    _cacheHelperProportions() {
      this.helperProportions = {
        width: this.helper.outerWidth(),
        height: this.helper.outerHeight(),
      };
    },

    _setContainment() {
      let ce; let co; let over;
      const o = this.options;
      if (o.containment === 'parent') {
        o.containment = this.helper[0].parentNode;
      }
      if (o.containment === 'document' || o.containment === 'window') {
        this.containment = [
          0 - this.offset.relative.left - this.offset.parent.left,
          0 - this.offset.relative.top - this.offset.parent.top,
          o.containment === 'document'
            ? this.document.width()
            : this.window.width() - this.helperProportions.width - this.margins.left,
          (o.containment === 'document'
            ? (this.document.height() || document.body.parentNode.scrollHeight)
            : this.window.height() || this.document[0].body.parentNode.scrollHeight
          ) - this.helperProportions.height - this.margins.top,
        ];
      }

      if (!(/^(document|window|parent)$/).test(o.containment)) {
        ce = $(o.containment)[0];
        co = $(o.containment).offset();
        over = ($(ce).css('overflow') !== 'hidden');

        this.containment = [
          co.left + (parseInt($(ce).css('borderLeftWidth'), 10) || 0)
          + (parseInt($(ce).css('paddingLeft'), 10) || 0) - this.margins.left,
          co.top + (parseInt($(ce).css('borderTopWidth'), 10) || 0)
          + (parseInt($(ce).css('paddingTop'), 10) || 0) - this.margins.top,
          co.left + (over ? Math.max(ce.scrollWidth, ce.offsetWidth) : ce.offsetWidth)
          - (parseInt($(ce).css('borderLeftWidth'), 10) || 0)
          - (parseInt($(ce).css('paddingRight'), 10) || 0)
          - this.helperProportions.width - this.margins.left,
          co.top + (over ? Math.max(ce.scrollHeight, ce.offsetHeight) : ce.offsetHeight)
          - (parseInt($(ce).css('borderTopWidth'), 10) || 0)
          - (parseInt($(ce).css('paddingBottom'), 10) || 0)
          - this.helperProportions.height - this.margins.top,
        ];
      }
    },

    _convertPositionTo(d, pos) {
      if (!pos) {
        pos = this.position;
      }
      const mod = d === 'absolute' ? 1 : -1;
      const scroll = this.cssPosition === 'absolute'
        && !(this.scrollParent[0] !== this.document[0]
          && $.contains(this.scrollParent[0], this.offsetParent[0]))
        ? this.offsetParent
        : this.scrollParent;
      const scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

      return {
        top: (

          // The absolute mouse position
          pos.top

          // Only for relative positioned nodes: Relative offset from element to offset parent
          +	this.offset.relative.top * mod

          // The offsetParent's offset without borders (offset + border)
          + this.offset.parent.top * mod
          - ((this.cssPosition === 'fixed'
            ? -this.scrollParent.scrollTop()
            : (scrollIsRootNode ? 0 : scroll.scrollTop())) * mod)
        ),
        left: (

          // The absolute mouse position
          pos.left

          // Only for relative positioned nodes: Relative offset from element to offset parent
          + this.offset.relative.left * mod

          // The offsetParent's offset without borders (offset + border)
          + this.offset.parent.left * mod
          -	((this.cssPosition === 'fixed'
            ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0
              : scroll.scrollLeft()) * mod)
        ),
      };
    },

    _generatePosition(event) {
      let top; let left;
      const o = this.options;
      let { pageX } = event;
      let { pageY } = event;
      const scroll = this.cssPosition === 'absolute'
        && !(this.scrollParent[0] !== this.document[0]
          && $.contains(this.scrollParent[0], this.offsetParent[0]))
        ? this.offsetParent
        : this.scrollParent;
      const scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

      // This is another very weird special case that only happens for relative elements:
      // 1. If the css position is relative
      // 2. and the scroll parent is the document or similar to the offset parent
      // we have to refresh the relative offset during the scroll so there are no jumps
      if (this.cssPosition === 'relative' && !(this.scrollParent[0] !== this.document[0]
          && this.scrollParent[0] !== this.offsetParent[0])) {
        this.offset.relative = this._getRelativeOffset();
      }

      /*
       * - Position constraining -
       * Constrain the position to a mix of grid, containment.
       */

      if (this.originalPosition) { // If we are not dragging yet, we won't check for options
        if (this.containment) {
          if (event.pageX - this.offset.click.left < this.containment[0]) {
            pageX = this.containment[0] + this.offset.click.left;
          }
          if (event.pageY - this.offset.click.top < this.containment[1]) {
            pageY = this.containment[1] + this.offset.click.top;
          }
          if (event.pageX - this.offset.click.left > this.containment[2]) {
            pageX = this.containment[2] + this.offset.click.left;
          }
          if (event.pageY - this.offset.click.top > this.containment[3]) {
            pageY = this.containment[3] + this.offset.click.top;
          }
        }

        if (o.grid) {
          top = this.originalPageY + Math.round((pageY - this.originalPageY)
            / o.grid[1]) * o.grid[1];
          pageY = this.containment
            ? ((top - this.offset.click.top >= this.containment[1]
              && top - this.offset.click.top <= this.containment[3])
              ? top
              : ((top - this.offset.click.top >= this.containment[1])
                ? top - o.grid[1] : top + o.grid[1]))
            : top;

          left = this.originalPageX + Math.round((pageX - this.originalPageX)
            / o.grid[0]) * o.grid[0];
          pageX = this.containment
            ? ((left - this.offset.click.left >= this.containment[0]
              && left - this.offset.click.left <= this.containment[2])
              ? left
              : ((left - this.offset.click.left >= this.containment[0])
                ? left - o.grid[0] : left + o.grid[0]))
            : left;
        }
      }

      return {
        top: (

          // The absolute mouse position
          pageY

          // Click offset (relative to the element)
          - this.offset.click.top

          // Only for relative positioned nodes: Relative offset from element to offset parent
          - this.offset.relative.top

          // The offsetParent's offset without borders (offset + border)
          - this.offset.parent.top
          + ((this.cssPosition === 'fixed'
            ? -this.scrollParent.scrollTop()
            : (scrollIsRootNode ? 0 : scroll.scrollTop())))
        ),
        left: (

          // The absolute mouse position
          pageX

          // Click offset (relative to the element)
          - this.offset.click.left

          // Only for relative positioned nodes: Relative offset from element to offset parent
          - this.offset.relative.left

          // The offsetParent's offset without borders (offset + border)
          - this.offset.parent.left
          + ((this.cssPosition === 'fixed'
            ? -this.scrollParent.scrollLeft()
            : scrollIsRootNode ? 0 : scroll.scrollLeft()))
        ),
      };
    },

    _rearrange(event, i, a, hardRefresh) {
      a ? a[0].appendChild(this.placeholder[0])
        : i.item[0].parentNode.insertBefore(
          this.placeholder[0],
          (this.direction === 'down' ? i.item[0] : i.item[0].nextSibling),
        );

      // Various things done here to improve the performance:
      // 1. we create a setTimeout, that calls refreshPositions
      // 2. on the instance, we have a counter variable, that get's higher after every append
      // 3. on the local scope, we copy the counter variable, and check in the timeout,
      // if it's still the same
      // 4. this lets only the last addition to the timeout stack through
      this.counter = this.counter ? ++this.counter : 1;
      const { counter } = this;

      this._delay(function () {
        if (counter === this.counter) {
          // Precompute after each DOM insertion, NOT on mousemove
          this.refreshPositions(!hardRefresh);
        }
      });
    },

    _clear(event, noPropagation) {
      this.reverting = false;

      // We delay all events that have to be triggered to after the point where the placeholder
      // has been removed and everything else normalized again
      let i;
      const delayedTriggers = [];

      // We first have to update the dom position of the actual currentItem
      // Note: don't do it if the current item is already removed (by a user), or it gets
      // reappended (see #4088)
      if (!this._noFinalSort && this.currentItem.parent().length) {
        this.placeholder.before(this.currentItem);
      }
      this._noFinalSort = null;

      if (this.helper[0] === this.currentItem[0]) {
        for (i in this._storedCSS) {
          if (this._storedCSS[i] === 'auto' || this._storedCSS[i] === 'static') {
            this._storedCSS[i] = '';
          }
        }
        this.currentItem.css(this._storedCSS);
        this._removeClass(this.currentItem, 'ui-sortable-helper');
      } else {
        this.currentItem.show();
      }

      if (this.fromOutside && !noPropagation) {
        delayedTriggers.push(function (event) {
          this._trigger('receive', event, this._uiHash(this.fromOutside));
        });
      }
      if ((this.fromOutside
          || this.domPosition.prev
          !== this.currentItem.prev().not('.ui-sortable-helper')[0]
          || this.domPosition.parent !== this.currentItem.parent()[0]) && !noPropagation) {
        // Trigger update callback if the DOM position has changed
        delayedTriggers.push(function (event) {
          this._trigger('update', event, this._uiHash());
        });
      }

      // Check if the items Container has Changed and trigger appropriate
      // events.
      if (this !== this.currentContainer) {
        if (!noPropagation) {
          delayedTriggers.push(function (event) {
            this._trigger('remove', event, this._uiHash());
          });
          delayedTriggers.push((function (c) {
            return function (event) {
              c._trigger('receive', event, this._uiHash(this));
            };
          }).call(this, this.currentContainer));
          delayedTriggers.push((function (c) {
            return function (event) {
              c._trigger('update', event, this._uiHash(this));
            };
          }).call(this, this.currentContainer));
        }
      }

      // Post events to containers
      function delayEvent(type, instance, container) {
        return function (event) {
          container._trigger(type, event, instance._uiHash(instance));
        };
      }
      for (i = this.containers.length - 1; i >= 0; i--) {
        if (!noPropagation) {
          delayedTriggers.push(delayEvent('deactivate', this, this.containers[i]));
        }
        if (this.containers[i].containerCache.over) {
          delayedTriggers.push(delayEvent('out', this, this.containers[i]));
          this.containers[i].containerCache.over = 0;
        }
      }

      // Do what was originally in plugins
      if (this.storedCursor) {
        this.document.find('body').css('cursor', this.storedCursor);
        this.storedStylesheet.remove();
      }
      if (this._storedOpacity) {
        this.helper.css('opacity', this._storedOpacity);
      }
      if (this._storedZIndex) {
        this.helper.css('zIndex', this._storedZIndex === 'auto' ? '' : this._storedZIndex);
      }

      this.dragging = false;

      if (!noPropagation) {
        this._trigger('beforeStop', event, this._uiHash());
      }

      // $(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately,
      // it unbinds ALL events from the original node!
      this.placeholder[0].parentNode.removeChild(this.placeholder[0]);

      if (!this.cancelHelperRemoval) {
        if (this.helper[0] !== this.currentItem[0]) {
          this.helper.remove();
        }
        this.helper = null;
      }

      if (!noPropagation) {
        for (i = 0; i < delayedTriggers.length; i++) {
          // Trigger all delayed events
          delayedTriggers[i].call(this, event);
        }
        this._trigger('stop', event, this._uiHash());
      }

      this.fromOutside = false;
      return !this.cancelHelperRemoval;
    },

    _trigger() {
      if ($.Widget.prototype._trigger.apply(this, arguments) === false) {
        this.cancel();
      }
    },

    _uiHash(_inst) {
      const inst = _inst || this;
      return {
        helper: inst.helper,
        placeholder: inst.placeholder || $([]),
        position: inst.position,
        originalPosition: inst.originalPosition,
        offset: inst.positionAbs,
        item: inst.currentItem,
        sender: _inst ? _inst.element : null,
      };
    },

  });
}));
