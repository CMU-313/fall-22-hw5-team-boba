/**
 * Document edition controller.
 */
angular.module('docs').controller('DocumentEdit', ($rootScope, $scope, $q, $http, $state, $stateParams, Restangular, $translate) => {
  // Alerts
  $scope.alerts = [];

  // Vocabularies
  $scope.vocabularies = [];

  // Orphan files to add
  $scope.orphanFiles = [];
  if ($stateParams.files) {
    $scope.orphanFiles = _.isArray($stateParams.files) ? $stateParams.files : [$stateParams.files];
  }

  /**
   * Close an alert.
   */
  $scope.closeAlert = function (index) {
    $scope.alerts.splice(index, 1);
  };

  /**
   * Returns a promise for typeahead title.
   */
  $scope.getTitleTypeahead = function ($viewValue) {
    const deferred = $q.defer();
    Restangular.one('document/list')
      .get({
        limit: 5,
        sort_column: 1,
        asc: true,
        search: $viewValue,
      }).then((data) => {
        deferred.resolve(_.uniq(_.pluck(data.documents, 'title'), true));
      });
    return deferred.promise;
  };

  /**
   * Returns true if in edit mode (false in add mode).
   */
  $scope.isEdit = function () {
    return $stateParams.id;
  };

  /**
   * Reset the form to add a new document.
   */
  $scope.resetForm = function () {
    let language = 'eng';
    if ($rootScope.app && $rootScope.app.default_language) {
      language = $rootScope.app.default_language;
    }

    $scope.document = {
      tags: [],
      relations: [],
      language,
      metadata: [],
    };

    // Get custom metadata list
    Restangular.one('metadata').get({
      sort_column: 1,
      asc: true,
    }).then((data) => {
      $scope.document.metadata = data.metadata;
    });

    if ($scope.navigatedTag) {
      $scope.document.tags.push($scope.navigatedTag);
    }

    $scope.newFiles = [];

    if ($scope.form) {
      $scope.form.$setPristine();
    }
  };

  /**
   * Edit a document.
   * Workflow:
   * Edit/add the file -> upload local files -> attach orphan files -> redirect to edited document or stay if adding
   */
  $scope.edit = function () {
    let promise = null;
    const document = angular.copy($scope.document);

    // Transform date to timestamp
    if (document.create_date instanceof Date) {
      document.create_date = document.create_date.getTime();
    }

    // Extract ids from tags
    document.tags = _.pluck(document.tags, 'id');

    // Extract ids from relations (only when our document is the source)
    document.relations = _.pluck(_.where(document.relations, { source: true }), 'id');

    // Extract custom metadata values
    const metadata = _.reject(document.metadata, (meta) => _.isUndefined(meta.value) || meta.value === '' || meta.value == null);
    document.metadata_id = _.pluck(metadata, 'id');
    document.metadata_value = _.pluck(metadata, 'value');
    document.metadata_value = _.map(document.metadata_value, (val) => {
      if (val instanceof Date) {
        return val.getTime();
      }
      return val;
    });

    // Send to server
    if ($scope.isEdit()) {
      promise = Restangular.one('document', $stateParams.id).post('', document);
    } else {
      promise = Restangular.one('document').put(document);
    }

    // Attach orphan files after edition
    const attachOrphanFiles = function (data) {
      const promises = [];
      _.each($scope.orphanFiles, (fileId) => {
        promises.push(Restangular.one(`file/${fileId}`).post('attach', { id: data.id }));
      });
      $scope.orphanFiles = [];
      return $q.all(promises);
    };

    // Upload files after edition
    promise.then((data) => {
      $scope.fileProgress = 0;

      // When all files upload are over, attach orphan files and move on
      const navigateNext = function () {
        attachOrphanFiles(data).then(() => {
          // Open the edited/created document
          $scope.pageDocuments();
          $state.go('document.view', { id: data.id });
        });
      };

      if (!$scope.newFiles || $scope.newFiles.length === 0) {
        navigateNext();
      } else {
        $scope.fileIsUploading = true;
        $rootScope.pageTitle = `0% - ${$rootScope.appName}`;

        // Send a file from the input file array and return a promise
        const sendFile = function (key) {
          const deferred = $q.defer();
          const getProgressListener = function (deferred) {
            return function (event) {
              deferred.notify(event);
            };
          };

          // Build the payload
          const file = $scope.newFiles[key];
          const formData = new FormData();
          formData.append('id', data.id);
          formData.append('file', file, encodeURIComponent(file.name));

          // Send the file
          $.ajax({
            type: 'PUT',
            url: '../api/file',
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            success(response) {
              deferred.resolve(response);
            },
            error(jqXHR) {
              deferred.reject(jqXHR);
            },
            xhr() {
              const myXhr = $.ajaxSettings.xhr();
              myXhr.upload.addEventListener('progress', getProgressListener(deferred), false);
              return myXhr;
            },
          });

          // Update progress bar and title on progress
          const startProgress = $scope.fileProgress;
          deferred.promise.then((data) => {
            // New file uploaded, increase used quota
            $rootScope.userInfo.storage_current += data.size;
          }, (data) => {
            // Error uploading a file, we stop here
            $scope.alerts.unshift({
              type: 'danger',
              msg: $translate.instant(`document.edit.document_${$scope.isEdit() ? 'edited' : 'added'}_with_errors`)
                + (data.responseJSON && data.responseJSON.type === 'QuotaReached' ? (` - ${$translate.instant('document.edit.quota_reached')}`) : ''),
            });

            // Reset view and title
            $scope.fileIsUploading = false;
            $scope.fileProgress = 0;
            $rootScope.pageTitle = $rootScope.appName;
          }, (e) => {
            const done = 1 - (e.total - e.loaded) / e.total;
            const chunk = 100 / _.size($scope.newFiles);
            $scope.fileProgress = startProgress + done * chunk;
            $rootScope.pageTitle = `${Math.round($scope.fileProgress)}% - ${$rootScope.appName}`;
          });

          return deferred.promise;
        };

        // Upload files sequentially
        let key = 0;
        var then = function () {
          key++;
          if ($scope.newFiles[key]) {
            sendFile(key).then(then);
          } else {
            $scope.fileIsUploading = false;
            $scope.fileProgress = 0;
            $rootScope.pageTitle = $rootScope.appName;
            navigateNext();
          }
        };
        sendFile(key).then(then);
      }
    });
  };

  /**
   * Cancel edition.
   */
  $scope.cancel = function () {
    if ($scope.isEdit()) {
      $state.go('document.view', { id: $stateParams.id });
    } else {
      $state.go('document.default');
    }
  };

  /**
   * In edit mode, load the current document.
   */
  if ($scope.isEdit()) {
    Restangular.one('document', $stateParams.id).get().then((data) => {
      $scope.document = data;
    });
  } else {
    $scope.resetForm();
  }

  // Load vocabularies
  $scope.loadVocabulary = function (name) {
    Restangular.one('vocabulary', name).get().then((result) => {
      $scope.vocabularies[name] = result.entries;
    });
  };
  $scope.loadVocabulary('type');
  $scope.loadVocabulary('coverage');
  $scope.loadVocabulary('rights');
});
