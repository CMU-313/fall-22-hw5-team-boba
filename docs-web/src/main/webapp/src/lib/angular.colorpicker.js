angular.module('colorpicker.module', [])
  .factory('helper', () => ({
    prepareValues(format) {
      let thisFormat = 'hex';
      if (format) {
        thisFormat = format;
      }
      return {
        name: thisFormat,
        transform: `to${thisFormat === 'hex' ? thisFormat.charAt(0).toUpperCase() + thisFormat.slice(1) : thisFormat.length > 3 ? thisFormat.toUpperCase().slice(0, -1) : thisFormat.toUpperCase()}`,
      };
    },
    updateView(element, value) {
      if (!value) {
        value = '';
      }
      element.val(value);
      element.data('color', value);
      element.data('colorpicker').update();
    },
  }))
  .directive('colorpicker', ['helper', function (helper) {
    return {
      require: '?ngModel',
      restrict: 'A',
      link(scope, element, attrs, ngModel) {
        const thisFormat = helper.prepareValues(attrs.colorpicker);

        element.colorpicker({ format: thisFormat.name });

        element.on('$destroy', () => {
          element.data('colorpicker').picker.remove();
        });

        if (!ngModel) return;

        element.colorpicker().on('changeColor', (event) => {
          element.val(element.data('colorpicker').format(event.color[thisFormat.transform]()));
          scope.$apply(ngModel.$setViewValue(element.data('colorpicker').format(event.color[thisFormat.transform]())));
        });

        element.colorpicker().on('hide', () => {
          scope.$apply(attrs.onHide);
        });

        element.colorpicker().on('show', () => {
          scope.$apply(attrs.onShow);
        });

        ngModel.$render = function () {
          helper.updateView(element, ngModel.$viewValue);
        };
      },
    };
  }])
  .directive('colorpicker', ['helper', function (helper) {
    return {
      require: '?ngModel',
      restrict: 'E',
      replace: true,
      transclude: false,
      scope: {
        componentPicker: '=ngModel',
        inputName: '@inputName',
        inputClass: '@inputClass',
        colorFormat: '@colorFormat',
      },
      template: '<div class="input-append color" data-color="rgb(0, 0, 0)" data-color-format="">'
        + '<input type="text" class="{{ inputClass }}" name="{{ inputName }}" ng-model="componentPicker" value="" />'
        + '<span class="add-on"><i style="background-color: {{componentPicker}}"></i></span>'
        + '</div>',

      link(scope, element, attrs, ngModel) {
        const thisFormat = helper.prepareValues(attrs.colorFormat);

        element.colorpicker();
        if (!ngModel) return;

        const elementInput = angular.element(element.children()[0]);

        element.colorpicker().on('changeColor', (event) => {
          elementInput.val(element.data('colorpicker').format(event.color[thisFormat.transform]()));
          scope.$parent.$apply(ngModel.$setViewValue(element.data('colorpicker').format(event.color[thisFormat.transform]())));
        });

        ngModel.$render = function () {
          helper.updateView(element, ngModel.$viewValue);
        };
      },
    };
  }]);
