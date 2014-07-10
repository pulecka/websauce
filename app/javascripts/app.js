angular.module('opensauce', [
        'ngResource',
        'ui.router',
        'opensauce.filters',
        'opensauce.services',
        'opensauce.directives',
        'opensauce.controllers'
    ])
    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {

        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: '/template/home.html',
                controller: 'HomeController'
            })
            .state('sauce', {
                url: '/sauce',
                templateUrl: '/template/sauces.html',
                controller: 'SaucesController'
            })
            .state('saucedetail', {
                url: '/sauce/:name',
                templateUrl: '/template/sauce.html',
                controller: 'SauceController',
                data: {
                    title: '{{recipe.title}}'
                },
                resolve: {
                    recipe: ['$stateParams', 'Recipe', function($stateParams, Recipe) {
                        return Recipe.get({name: $stateParams.name});
                    }]
                }
            })
            .state('gallery', {
                url: '/gallery',
                templateUrl: '/template/gallery.html',
                controller: 'GalleryController'
            })
            .state('flavor', {
                url: '/flavor',
                templateUrl: '/template/flavors.html',
                controller: 'FlavorsController'
            })
            .state('user', {
                url: '/user',
                templateUrl: '/template/users.html',
                controller: 'UsersController'
            })
            .state('lab', {
                url: '/lab',
                templateUrl: '/template/lab.html',
                controller: 'LabController'
            })
            .state('mixer', {
                url: '/lab/mixer',
                templateUrl: '/template/mix.html',
                controller: 'MixerController'
            })
            .state('armageddon', {
                url: '/lab/armageddon',
                templateUrl: '/template/armageddon.html',
                controller: 'ArmageddonController'
            })
            .state('about', {
                url: '/about',
                templateUrl: '/template/about.html',
                controller: 'AboutController'
            });
    
        $locationProvider.html5Mode(true).hashPrefix('!') 
    }])

    ;
