(function () {
    /**Im to lazy to rewrite code :( */
    'use strict';
    angular
        .module('app.web')
        .directive('abpCinotamTable', AbpTable);
    AbpTable.$inject = ['WebConst'];
    function AbpTable(webConst) {
        // Usage:
        //  <user-selector user-selected='$scope.onSelected()' />
        // Creates:
        //  Table of users
        var directive = {
            bindToController: true,
            controller: AbpTableController,
            controllerAs: 'vm',
            link: link,
            restrict: 'E',
            templateUrl: webConst.contentFolder + 'directives/abpcinotamtable.cshtml',
            scope: {
                tProperties: '=properties',
                tFunctions: '=funcobj',
                tLeftActions: '=pushActionsOnTheLeft',
                tBtnsPosition: '@btnPositionClass',
                tAjaxUrl: '=url'
            }
        };
        return directive;
    }
    function link(scope, element, attrs) {
    }
    /* @ngInject */
    AbpTableController.$inject = ['abp.services.app.user', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', '$scope', 'WebConst'];
    function AbpTableController(_userService, DTOptionsBuilder, DTColumnBuilder, $compile, $scope, webConst) {
        var vm = this;
        //Holds the data table instance in the vm.instance variable of the parent
        vm.dtInstance = function (instance) {
            $scope.$parent.vm.instance = instance;
        };
        var url = $scope.vm.tAjaxUrl;
        vm.users = [];
        vm.dtColumns = [];
        vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax', {
            url: url,
            type: 'GET'
        }).withDataProp('data')
            .withOption('processing', true).withOption('createdRow', createdRow)
            .withOption('serverSide', true).withOption('createdRow', createdRow)
            .withPaginationType('full_numbers').withOption('createdRow', createdRow).withLanguage(webConst.datatablesLangConfig);


        var btnPosition = '';

        console.log($scope.vm);
        if ($scope.vm.tBtnsPosition) {
            btnPosition = $scope.vm.tBtnsPosition;
        }

        if ($scope.vm.tFunctions) {
            var actionBtns = DTColumnBuilder.newColumn(null)
            .withTitle(App.localize("Actions"))
            .notSortable()
            .withClass(btnPosition)
            .renderWith(loadCustom);
        }



        if ($scope.vm.tLeftActions) {
            //Push the action buttons first so they can appear on the left 
            vm.dtColumns = buildColumns(actionBtns, $scope.vm.tProperties);
        }
        else {
            vm.dtColumns = buildColumns(null, $scope.vm.tProperties);
            if ($scope.vm.tFunctions) {
                vm.dtColumns.push(actionBtns);
            }
        }
        vm.registeredFunctions = [];

        /**
             * Push all the functions inside the registeredFunctions array
             * @param  data, type, full, meta
             */
        function loadCustom(data, type, full, meta) {
            var btns = " ";
            if ($scope.vm.tFunctions) {
                for (var i = 0; i < $scope.vm.tFunctions.length; i++) {
                    var current = $scope.vm.tFunctions[i];
                    btns += current.dom(data, type, full, meta).toString() + " "; //Space between buttons
                    vm.registeredFunctions.push({
                        name: current.name,
                        func: current.action
                    });
                }
            }

            return btns;
        }
        /**
             * Recompiles the rows table to allow angular binding
             * @param  row, data, dataIndex
             */
        function createdRow(row, data, dataIndex) {
            // Recompiling so we can bind Angular directive to the DT
            $compile(angular.element(row).contents())($scope);
        }
        /**
             * Recompiles the table columns to allow angular binding
             * @param  row, data, dataIndex
             */
        function createdColumn(col, data, dataIndex) {
            $compile(angular.element(col).contents())($scope);
        }
        /**
             * Build the columns for the table
             * @param insertBefore buttons to be placed in the left
             * @param properties the array of properties [Key,DisplayName(localizable)] that the directive should display in the table
             * @returns {DTColumns} the options
             */
        function buildColumns(insertBefore, ctrlProperties) {
            if (!ctrlProperties) ctrlProperties = [];
            var columns = [];
            if (insertBefore) {
                columns.push(insertBefore);
            }
            if (ctrlProperties.length <= 0) {
                throw new Error('Properties not defined');
            }
            for (var i = 0; i < ctrlProperties.length; i++) {
                var currentProperty = ctrlProperties[i];

                if (currentProperty.Hidden) {
                    columns.push(
                        DTColumnBuilder.newColumn(currentProperty.Key)
                            .withTitle(App.localize(currentProperty.DisplayName)).notVisible().withOption(createdColumn));
                }
                else {
                    columns.push(
                        DTColumnBuilder.newColumn(currentProperty.Key)
                            .withTitle(App.localize(currentProperty.DisplayName)).withOption(createdColumn));
                }

            }
            return columns;
        }

    }
})();