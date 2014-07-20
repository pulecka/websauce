angular.module('opensauce', [
        'ngResource',
        'pascalprecht.translate',
        'ui.router',
        'opensauce.filters',
        'opensauce.services',
        'opensauce.directives',
        'opensauce.controllers'
    ])
    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$translateProvider', '$httpProvider', function($stateProvider, $urlRouterProvider, $locationProvider, $translateProvider, $httpProvider) {

        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state('opensauce', {
                url: '/',
                views: {
                    'header@': {
                        templateUrl: '/template/header.html',
                        controller: 'HeaderController'
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
                },
                data: {
                    title: '{{"sauces" | translate}}'
                }
            })
            .state('add', {
                parent: 'sauce',
                url: '/add',
                views: {
                    'main@': {
                        templateUrl: '/template/addSauce.html',
                        controller: 'AddSauceController',
                    }
                },
                data: {
                    title: '{{"add" | translate}}'
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
                    }],
                    ingredients: ['Ingredient', function(Ingredient) {
                        return Ingredient.query();
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
                },
                data: {
                    title: '{{"photos" | translate}}'
                }

            })
            .state('flavors', {
                parent: 'opensauce',
                url: 'flavor',
                views: {
                    'main@': {
                        templateUrl: '/template/flavors.html',
                        controller: 'FlavorsController'
                    }
                },
                data: {
                    title: '{{"flavors" | translate}}'
                }

            })
            .state('users', {
                parent: 'opensauce',
                url: 'user',
                views: {
                    'main@': {
                        templateUrl: '/template/users.html',
                        controller: 'UsersController'
                    }
                },
                data: {
                    title: '{{"users" | translate}}'
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
                },
                data: {
                    title: '{{"labs" | translate}}'
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
            .state('about', {
                parent: 'opensauce',
                url: 'about',
                views: {
                    'main@': {
                        templateUrl: '/template/about.html',
                        controller: 'AboutController'
                    }
                },
                data: {
                    title: '{{"sauces" | translate}}'
                }
            });
    
        $locationProvider.html5Mode(true).hashPrefix('!');

        $translateProvider
            .translations('en', {
                sauces: 'sauces',
                flavors: 'flavors',
                photos: 'gallery',
                users: 'users',
                labs: 'labs',
                about: 'about',
                login: 'login',
                add: 'add',
                edit: 'edit',
                save: 'save',
                cancel: 'cancel'
            })
            .translations('cz', {
                sauces: 'omáčky',
                flavors: 'přísady',
                photos: 'galerie',
                users: 'uživatelé',
                labs: 'stánky',
                about: 'o nás',
                login: 'přihlášení',
                add: 'přidat',
                edit: 'upravit',
                save: 'uložit',
                cancel: 'zrušit',
                comments: 'komentáře',
                versions: 'úpravy',
                indicateName: 'jméno omáčky',
                newSauce: 'novou omáčku'
            });

        $translateProvider.preferredLanguage('cz');

        $httpProvider.interceptors.push('AuthInterceptor');

        //document.domain = location.host.replace(/^.*?([^.]+\.[^.]+)$/g,'$1');
    }]);

    