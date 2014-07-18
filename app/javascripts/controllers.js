angular.module('opensauce.controllers', [])
	.controller('HeaderController', ['$scope', '$translate', 'AuthenticationService', function($scope, $translate, AuthenticationService) {
		var auth = AuthenticationService;
		$scope.showMenu = false;
		$scope.toggleMenu = function() {
			$scope.showMenu = !$scope.showMenu;
		};

		$scope.changeLanguage = function (langKey) {
			$translate.use(langKey);
		};

		$scope.$watch(function () {
			return AuthenticationService.getCurrentUser();
		},                       
		function(currentUser) {
			$scope.currentUser = currentUser;
		}, true);

		$scope.login = function() {
			var loginWindow = window.open('http://www.opensauce.cz/auth/facebook', 'facebook', 'align=center,directories=no,height=560,location=no,menubar=no,resizable=yes,scrollbars=yes,status=no,toolbar=no,width=1000');
			loginWindow.focus();
		};
	}])
	.controller('HomeController', ['$scope', 'recipes', function($scope, recipes) {
		$scope.recipes = recipes;
	}])
	.controller('SaucesController', ['$scope', 'recipes', function($scope, recipes) {
		$scope.recipes = recipes;
	}])
	.controller('SauceController', ['$scope', 'recipe', 'forks', 'photos', 'comments', 'Recipe', function($scope, recipe, forks, photos, comments, Recipe) {
		$scope.recipe = recipe;
		$scope.forks = Recipe.forks({name: recipe.name});
		$scope.photos = Recipe.photos({name: recipe.name});
		$scope.comments = Recipe.comments({name: recipe.name});
	}])
	.controller('GalleryController', ['$http', '$scope', 'Photo', function($http, $scope, Photo) {
		$scope.photos = Photo.query();
	}])
	.controller('FlavorsController', ['$scope', 'Ingredient', function($scope, Ingredient) {
		$scope.ingredients = Ingredient.query();
	}])
	.controller('UsersController', ['$http', '$scope', 'User', function($http, $scope, User) {
		$scope.users = User.query();
	}])
	.controller('LabController', ['$http', '$scope', function($http, $scope) {
	}])
	.controller('MixerController', ['$scope', '$state', 'Ingredient', 'Recipe', 'Mixer', 'AuthenticationService', function($scope, $state, Ingredient, Recipe, Mixer, AuthenticationService) {
		$scope.ingredients = Ingredient.query();
		$scope.recipe = new Recipe();

		$scope.save = function() {
			$scope.recipe.ingredients = Mixer.get();
			if (AuthenticationService.getCurrentUser()) {
				$scope.author = AuthenticationService.getCurrentUser().id ;
			}
			$scope.recipe.$save().then(function(recipe) {
				Mixer.clear();
				$state.go('detail', {name: recipe.name});
			});
		}
	}])
	.controller('AboutController', ['About', '$scope', function(About, $scope) {
		$scope.about = About.query();
	}]);
