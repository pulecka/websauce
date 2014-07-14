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
            .state('opensauce', {
                url: '/',
                views: {
                    'header@': {
                        templateUrl: '/template/header.html'
                    },
                    'main@': {
                        templateUrl: '/template/home.html',
                        controller: 'HomeController'
                    }
                },
                resolve: {
                    recipes: ['Recipe', function(Recipe) {
                        return Recipe.query();
                    }]
                }
            })
            .state('sauce', {
                parent: 'opensauce',
                url: 'sauce',
                views: {
                    'main@': {
                        templateUrl: '/template/sauces.html',
                        controller: 'SaucesController'
                    }
                }
            })
            .state('detail', {
                parent: 'sauce',
                url: '/:name',
                views: {
                    'main@': {
                        templateUrl: '/template/sauce.html',
                        controller: 'SauceController',
                    }
                },
                data: {
                    title: '{{recipe.title}}'
                },
                resolve: {
                    recipe: ['$stateParams', 'Recipe', function($stateParams, Recipe) {
                        return Recipe.get({name: $stateParams.name}).$promise;
                    }],
                    forks: ['$stateParams', 'Recipe', function($stateParams, Recipe) {
                       return Recipe.forks({name: $stateParams.name});
                    }],
                    photos: ['$stateParams', 'Recipe', function($stateParams, Recipe) {
                        return Recipe.photos({name: $stateParams.name});
                    }],
                    comments: ['$stateParams', 'Recipe', function($stateParams, Recipe) {
                        return Recipe.comments({name: $stateParams.name});
                    }]
                }
            })
            .state('gallery', {
                parent: 'opensauce',
                url: 'gallery',
                views: {
                    'main@': {
                        templateUrl: '/template/gallery.html',
                        controller: 'GalleryController'
                    }
                }
            })
            .state('flavor', {
                parent: 'opensauce',
                url: 'flavor',
                views: {
                    'main@': {
                        templateUrl: '/template/flavors.html',
                        controller: 'FlavorsController'
                    }
                }
            })
            .state('user', {
                parent: 'opensauce',
                url: 'user',
                views: {
                    'main@': {
                        templateUrl: '/template/users.html',
                        controller: 'UsersController'
                    }
                }
            })
            .state('lab', {
                parent: 'opensauce',
                url: 'lab',
                views: {
                    'main@': {
                        templateUrl: '/template/lab.html',
                        controller: 'LabController'
                    }
                }
            })
            .state('mixer', {
                parent: 'lab',
                url: '/mixer',
                views: {
                    'main@': {
                        templateUrl: '/template/mix.html',
                        controller: 'MixerController'
                    }
                }
            })
            .state('armageddon', {
                parent: 'lab',
                url: '/armageddon',
                views: {
                    'main@': {
                        templateUrl: '/template/armageddon.html',
                        controller: 'ArmageddonController'
                    }
                }
            })
            .state('about', {
                parent: 'opensauce',
                url: 'about',
                views: {
                    'main@': {
                        templateUrl: '/template/about.html',
                        controller: 'AboutController'
                    }
                }
            });
    
        $locationProvider.html5Mode(true).hashPrefix('!');
    }])

    ;
