(function () {

    /**
     * This controller contains functions specific to the admin page.
     * @param $scope - binding between controller and HTML page
     * @param $controller - service for instantiating controllers
     * @param $uibModal - the UI Bootstrap service for creating modals
     * @param dataProvider - service function that provides GET and POST requests for getting or updating data
     */
    function AdminJsController($scope, $controller, $uibModal, dataProvider) {

        $scope.adminsList = [];
        $scope.pagedItemsAdmins = [];
        $scope.currentPageAdmins = 0;

        $scope.gap = 2;
        $scope.itemsPerPage = 20;

        // Allow this controller to use functions from the General Controller
        angular.extend(this, $controller('GeneralJsController', { $scope: $scope }));

        /**
         * Initializes the page, displaying the list of groupings to administer and the list of admins to manage.
         */
        $scope.init = function () {
            // Adds the loading spinner.
            $scope.loading = true;

            var url = "api/groupings/adminLists";

            dataProvider.loadData(function (d) {
                console.log(d.allGroupings.length);
                if (d.allGroupings.length == 0) {
                    $scope.createApiErrorModal();
                } else {
                    $scope.adminsList = d.adminGroup.members;
                    $scope.groupingsList = d.allGroupings;
                    $scope.groupingsList = _.sortBy($scope.groupingsList, 'name');
                    $scope.modify($scope.adminsList);
                    $scope.symbol.name = '\u21c5';
                    $scope.pagedItemsAdmins = $scope.groupToPages($scope.adminsList, $scope.pagedItemsAdmins);
                    $scope.pagedItemsGroupings = $scope.groupToPages($scope.groupingsList, $scope.pagedItemsGroupings);
                    console.log($scope.groupingsList);
                }
                $scope.loading = false;
            }, url);
        };

        $scope.change = function () {
            $scope.showGrouping = false;
            $scope.resetGroupingInformation();
        };

        $scope.sortCol = function (list, col, listPaged, symbol) {
            $scope.symbol = {'name': '', 'path': '', 'uuid': '', 'username': ''};

            if ($scope[symbol] === 'ascend' || typeof $scope[symbol] == 'undefined') {
                list = _.sortBy(list, col);
                $scope[listPaged] = $scope.groupToPages(list, $scope[listPaged]);
                $scope[symbol] = 'descend';
            } else {
                list = _.sortBy(list, col).reverse();
                $scope[listPaged] = $scope.groupToPages(list, $scope[listPaged]);
                $scope[symbol] = 'ascend';
            }
            switch (col) {
                case 'name':
                    $scope.symbol.name = '\u21c5';
                    break;
                case 'path':
                    $scope.symbol.path = '\u21c5';
                    break;
                case 'uuid':
                    $scope.symbol.uuid = '\u21c5';
                    break;
                case 'username':
                    $scope.symbol.username = '\u21c5';
                    break;
                case 'basis':
                    $scope.symbol.basis = '\u21c5';
            }
        };

        // TODO: Find a way to make the 3 adds into a more singular function.

        /**
         * Adds a user to the admin list.
         */
        $scope.addAdmin = function () {
            var addUrl = "api/groupings/" + $scope.adminToAdd + "/addAdmin";
            dataProvider.updateData(function (d) {
                var successful = false;
                if (d.statusCode != null) {
                    console.log("Error, Status Code: " + d.statusCode);
                } else if (d.resultCode.indexOf('SUCCESS') === 0) {
                    successful = true;
                    console.log("Success In Adding");
                }
                $scope.createAddModal($scope.adminToAdd, successful);
                $scope.adminToAdd = '';
            }, addUrl);
        };

        /**
         * Creates a modal telling the user whether or not the user was successfully added into the grouping/admin list.
         * @param {string} user - the user being added
         * @param {boolean} wasSuccessful - whether or not the user was successfully added
         * @param {string?} path - the path to the grouping (if adding the user to a grouping)
         */
        $scope.createAddModal = function (user, wasSuccessful, path) {
            $scope.user = user;
            $scope.wasSuccessful = wasSuccessful;

            $scope.addModalInstance = $uibModal.open({
                templateUrl: 'modal/addModal.html',
                scope: $scope,
            });

            $scope.addModalInstance.result.finally(function() {
                if (wasSuccessful) {
                    $scope.loading = true;
                    // If no path was specified, then refresh the admin list. Otherwise, refresh the grouping
                    if (path === undefined) {
                        $scope.init();
                    } else {
                        $scope.getData(path);
                    }
                }
            });
        };

        /**
         * Removes an admin from the admin list. There must be at least one admin remaining.
         * @param {number} index - the index of the admin to delete, with the current page and items per page taken into
         * account
         */
        $scope.removeAdmin = function (index) {
            var deleteUser = $scope.adminsList[index].username;
            var deleteUrl = "api/groupings/" + deleteUser + "/deleteAdmin";

            $scope.createRemoveModal(deleteUser, deleteUrl);
        };

        /**
         * Creates a modal that prompts the user whether they want to delete the user or not. If 'Yes' is pressed, then
         * a request is made to delete the user.
         * @param {string} user - the user to delete
         * @param {string} url - the URL used to make the request
         * @param {string?} path - the path to the grouping (if deleting a user from a grouping)
         */
        $scope.createRemoveModal = function (user, url, path) {
            $scope.userToDelete = user;

            $scope.removeModalInstance = $uibModal.open({
                templateUrl: 'modal/removeModal.html',
                scope: $scope
            });

            $scope.removeModalInstance.result.then(function () {
                $scope.loading = true;
                // Remove the user, then reload either the admin list or grouping
                dataProvider.updateData(function () {
                    if (path === undefined) {
                        $scope.init();
                    } else {
                        $scope.getData(path);
                    }
                }, url);

            });
        };

    }

    UHGroupingsApp.controller('AdminJsController', AdminJsController);

})();