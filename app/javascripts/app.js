angular.module('opensauce', [
        'ngSanitize',
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
                },
                data: {
                    title: '{{"zen" | translate}}'
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
                    title: '{{"about" | translate}}'
                }
            });
    
        $locationProvider.html5Mode(true).hashPrefix('!');

        $translateProvider
            .translations('en', {
                'sauces': 'sauces',
                'flavors': 'flavors',
                'photos': 'gallery',
                'users': 'users',
                'labs': 'labs',
                'about': 'about',
                'login': 'login',
                'add': 'add',
                'edit': 'edit',
                'save': 'save',
                'cancel': 'cancel',
                'indicateName': 'sauce name',
                'newSauce': 'new sauce',
                'zen': 'zen',

                'cukr': 'sugar',
                'niva': 'blue cheese',
                'arasidy': 'peanuts',
                'avokado': 'avocado',
                'banan': 'banana',
                'bily-jogurt': 'yoghurt',
                'brokolice': 'broccoli',
                'cervena-cibule': 'red onion',
                'chilli': 'chili powder',
                'chilli-papricka': 'chili pepper',
                'citronova-stava': 'lemon juice',
                'dynova-seminka': 'pumpkin seeds',
                'jalapeno': 'jalapeno pepper',
                'jarni-cibulka': 'spring onion',
                'kari': 'curry powder',
                'kesu-orisky': 'cashew nuts',
                'kiwi': 'kiwi',
                'koriandr': 'cilantro',
                'limetkova-stava': 'lime juice',
                'mata': 'mint',
                'med': 'honey',
                'mrkev': 'carrot',
                'olivovy-olej': 'olive oil',
                'parmezan': 'parmesan cheese',
                'rajce': 'tomato',
                'redkvickove-klicky': 'radish',
                'redvicka': 'radish',
                'smetana': 'creme fraiche',
                'spenat': 'spinach',
                'tvaroh': 'milk curd',
                'zazvor': 'ginger',
                'pepr': 'black pepper',
                'sul': 'salt',
                'provensalske-koreni': 'herbs of provence',
                'zakysana-smetana': 'sour creme',
                'petrzelka': 'parsley',
                'kukurice': 'corn',
                'bazalka': 'basil',
                'slunecnicova-seminka': 'sunflower seeds',
                'zeleny-pepr': 'green pepper',
                'cervena-repa': 'beetroot',
                'porek': 'leek',
                'brambory': 'potatoes',
                'lucina': 'cream cheese',
                'celer': 'celery',
                'cervena-cocka': 'red lentils',
                'bile-fazole': 'white beans',
                'bile-vino': 'white wine',
                'bily-pepr': 'white pepper',
                'cervene-fazole': 'red beans',
                'cervene-vino': 'red wine',
                'cinska-redkev': 'Chinese radish',
                'cizrna': 'chickpeas',
                'estragon': 'tarragon',
                'rericha': 'watercress',
                'dyne': 'pumpkin',
                'kokos': 'coconut',
                'kren': 'horseradish',
                'zeleninovy-vyvar': 'vegetable broth',
                'pohanka': 'buckwheat',
                'kvetak': 'cauliflower',
                'majoranka': 'marjoram',
                'saturejka': 'calamint',
                'mleko': 'milk',
                'rohlik': 'bread',
                'paliva-paprika': 'hot pepper',
                'lnene-seminko': 'flax seeds',
                'pazitka': 'chives',
                'pistacie': 'pistachio nuts',
                'rozinky': 'raisins',
                'rimsky-kmin': 'roman cumin',
                'pivo': 'beer',
                'rozmaryn': 'rosemary',
                'rucola': 'rucola',
                'sezam': 'sesame seeds',
                'skorice': 'cinnamon',
                'sladka-paprika': 'sweet pepper',
                'tahini': 'tahini',
                'tomatovy-nalev': 'tomato paste',
                'vinny-ocet': 'wine vinegar',
                'vlasske-orechy': 'walnuts',
                'zloutek': 'egg yolk',
                'citron': 'lemon',
                'cocka': 'lentils',
                'brusinky': 'cranberries',
                'susene-svestky': 'dried plums',
                'mozzarella': 'mozzarella cheese',
                'balkansky-syr': 'feta cheese',
                'data-masala': 'masala powder',
                'dijonska-horcice': 'dijon mustard',
                'kokosove-mleko': 'coconut milk',
                'hrasek': 'green peas',
                'kurkuma': 'turmeric',
                'majoneza': 'mayonnaise',
                'zluty-hrach': 'yellow peas',
                'cuketa': 'zucchini',
                'cesnek': 'garlic',
                'mak': 'poppy seeds',
                'zeli': 'cabbage',
                'povidla': 'plum jam',
                'hruska': 'pear',
                'jecmen': 'barley',
                'kysela-okurka': 'pickle',
                'kmin': 'cumin',
                'maslo': 'butter',
                'okurka': 'cucumber',
                'kopr': 'dill',
                'jablko': 'apple',
                'bobkovy-list': 'bay leaf',
                'cottage': 'cottage cheese',
                'cibule': 'onion',
                'svestka': 'plum',
                'laska': 'love',
                'polenta': 'polenta',
                'ocet': 'vinegar',
                'ovci-syr': 'sheep cheese'
            })
            .translations('cz', {
                'sauces': 'omáčky',
                'flavors': 'přísady',
                'photos': 'galerie',
                'users': 'uživatelé',
                'labs': 'stánky',
                'about': 'o nás',
                'login': 'přihlášení',
                'add': 'přidat',
                'edit': 'upravit',
                'save': 'uložit',
                'cancel': 'zrušit',
                'comments': 'komentáře',
                'versions': 'úpravy',
                'indicateName': 'jméno omáčky',
                'newSauce': 'novou omáčku',
                'zen': 'zen',

                'cukr': 'cukr',
                'niva': 'niva',
                'arasidy': 'arašídy',
                'avokado': 'avokádo',
                'banan': 'banán',
                'bily-jogurt': 'bílý jogurt',
                'brokolice': 'brokolice',
                'cervena-cibule': 'červená cibule',
                'chilli': 'chilli',
                'chilli-papricka': 'chilli paprička',
                'citronova-stava': 'citronová šťáva',
                'dynova-seminka': 'dýňová semínka',
                'jalapeno': 'jalapeño',
                'jarni-cibulka': 'jarní cibulka',
                'kari': 'kari',
                'kesu-orisky': 'kešu oříšky',
                'kiwi': 'kiwi',
                'koriandr': 'koriandr',
                'limetkova-stava': 'limetková šťáva',
                'mata': 'máta',
                'med': 'med',
                'mrkev': 'mrkev',
                'olivovy-olej': 'olivový olej',
                'parmezan': 'parmezán',
                'rajce': 'rajče',
                'redkvickove-klicky': 'ředkvičkové klíčky',
                'redvicka': 'ředvička',
                'smetana': 'smetana',
                'spenat': 'špenát',
                'tvaroh': 'tvaroh',
                'zazvor': 'zázvor',
                'pepr': 'pepř',
                'sul': 'sůl',
                'provensalske-koreni': 'provensalské koření',
                'zakysana-smetana': 'zakysaná smetana',
                'petrzelka': 'petrželka',
                'kukurice': 'kukuřice',
                'bazalka': 'bazalka',
                'slunecnicova-seminka': 'slunečnicová semínka',
                'zeleny-pepr': 'zelený pepř',
                'cervena-repa': 'červená řepa',
                'porek': 'pórek',
                'brambory': 'brambory',
                'lucina': 'lučina',
                'celer': 'celer',
                'cervena-cocka': 'červená čočka',
                'bile-fazole': 'bílé fazole',
                'bile-vino': 'bílé víno',
                'bily-pepr': 'bílý pepř',
                'cervene-fazole': 'červené fazole',
                'cervene-vino': 'červené víno',
                'cinska-redkev': 'čínská ředkev',
                'cizrna': 'cizrna',
                'estragon': 'estragon',
                'rericha': 'řeřicha',
                'dyne': 'dýně',
                'kokos': 'kokos',
                'kren': 'křen',
                'zeleninovy-vyvar': 'zeleninový vývar',
                'pohanka': 'pohanka',
                'kvetak': 'květák',
                'majoranka': 'majoránka',
                'saturejka': 'saturejka',
                'mleko': 'mléko',
                'rohlik': 'rohlík',
                'paliva-paprika': 'pálivá paprika',
                'lnene-seminko': 'lněné semínko',
                'pazitka': 'pažitka',
                'pistacie': 'pistácie',
                'rozinky': 'rozinky',
                'rimsky-kmin': 'římský kmín',
                'pivo': 'pivo',
                'rozmaryn': 'rozmarýn',
                'rucola': 'rucola',
                'sezam': 'sezam',
                'skorice': 'skořice',
                'sladka-paprika': 'sladká paprika',
                'tahini': 'tahini',
                'tomatovy-nalev': 'tomatový nálev',
                'vinny-ocet': 'vinný ocet',
                'vlasske-orechy': 'vlašské ořechy',
                'zloutek': 'žloutek',
                'citron': 'citron',
                'cocka': 'čočka',
                'brusinky': 'brusinky',
                'susene-svestky': 'sušené švestky',
                'mozzarella': 'mozzarella',
                'balkansky-syr': 'balkánský sýr',
                'data-masala': 'dátá masála',
                'dijonska-horcice': 'dijonská horčice',
                'kokosove-mleko': 'kokosové mléko',
                'hrasek': 'hrášek',
                'kurkuma': 'kurkuma',
                'majoneza': 'majonéza',
                'zluty-hrach': 'žlutý hrách',
                'cuketa': 'cuketa',
                'cesnek': 'česnek',
                'mak': 'mák',
                'zeli': 'zelí',
                'povidla': 'povidla',
                'hruska': 'hruška',
                'jecmen': 'ječmen',
                'kysela-okurka': 'kyselá okurka',
                'kmin': 'kmín',
                'maslo': 'máslo',
                'okurka': 'okurka',
                'kopr': 'kopr',
                'jablko': 'jablko',
                'bobkovy-list': 'bobkový list',
                'cottage': 'cottage',
                'cibule': 'cibule',
                'svestka': 'švestka',
                'laska': 'láska',
                'polenta': 'polenta',
                'ocet': 'ocet',
                'ovci-syr': 'ovčí sýr'
            });

        $translateProvider.preferredLanguage('en');

        $httpProvider.interceptors.push('AuthInterceptor');

        document.domain = document.domain;
    }]);

    