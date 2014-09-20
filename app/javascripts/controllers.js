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
			var loginWindow = window.open('http://old.opensauce.cz/auth/facebook', 'facebook', 'align=center,directories=no,height=560,location=no,menubar=no,resizable=yes,scrollbars=yes,status=no,toolbar=no,width=1000');
			loginWindow.focus();
		};
	}])
	.controller('HomeController', ['$scope', 'recipes', function($scope, recipes) {
		$scope.recipes = recipes;
	}])
	.controller('SaucesController', ['$scope', 'recipes', function($scope, recipes) {
		$scope.recipes = recipes;
	}])
	.controller('SauceController', ['$scope', '$state', 'recipe', 'forks', 'photos', 'comments', 'ingredients', 'Recipe', function($scope, $state, recipe, forks, photos, comments, ingredients, Recipe) {
		$scope.editMode = false;

		$scope.recipe = recipe;
		$scope.forks = Recipe.forks({name: recipe.name});
		$scope.photos = Recipe.photos({name: recipe.name});
		$scope.comments = Recipe.comments({name: recipe.name});
		$scope.ingredients = function() {
			return $scope.editMode ? ingredients : recipe.ingredients;
		};

		function indexOfObject(array, object) {
    	var i = array ? array.length : 0;
    	while (i--) {
				if (array[i].id === object.id) {
      		return i;
      	}
			}
			return -1;
		}

		$scope.contains = function(ingredient) {
			return indexOfObject($scope.recipe.ingredients, ingredient) !== -1;
		};

		$scope.toggle = function(ingredient) {
			var ingredientIndex = indexOfObject($scope.recipe.ingredients, ingredient);
			if (ingredientIndex === -1) {
				$scope.recipe.ingredients.push(ingredient);
			} else {
				$scope.recipe.ingredients.splice(ingredientIndex, 1);
			}
		};

		$scope.save = function(recipe) {
			recipe.$save().then(function(response) {
				$state.reload();
				$state.go('detail', {name: response.name});
			});
		};
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
	.controller('LabController', ['$http', '$scope' , 'Lab', function($http, $scope, Lab) {
		$scope.lab = Lab.query();
		$scope.events = Lab.events();
	}])
	.controller('AddSauceController', ['$scope', '$state', 'Ingredient', 'Recipe', 'AuthenticationService', function($scope, $state, Ingredient, Recipe, AuthenticationService) {
		$scope.ingredients = Ingredient.query();
		$scope.recipe = new Recipe();
		$scope.recipe.ingredients = [];

		function indexOfObject(array, object) {
    	var i = array ? array.length : 0;
    	while (i--) {
				if (array[i].id === object.id) {
      		return i;
      	}
			}
			return -1;
		}

		$scope.contains = function(ingredient) {
			return indexOfObject($scope.recipe.ingredients, ingredient) !== -1;
		};

		$scope.toggle = function(ingredient) {
			var ingredientIndex = indexOfObject($scope.recipe.ingredients, ingredient);
			if (ingredientIndex === -1) {
				$scope.recipe.ingredients.push(ingredient);
			} else {
				$scope.recipe.ingredients.splice(ingredientIndex, 1);
			}
		};

		$scope.save = function(recipe) {
			if (AuthenticationService.getCurrentUser()) {
				recipe.author = AuthenticationService.getCurrentUser();
			}
			recipe.$save().then(function(response) {
				$state.reload();
				$state.go('detail', {name: response.name});
			});
		};
	}])

	.controller('MixerController', ['$scope', '$state', 'Ingredient', 'Recipe', 'Mixer', 'AuthenticationService', function($scope, $state, Ingredient, Recipe, Mixer, AuthenticationService) {
		$scope.ingredients = Ingredient.query();
		$scope.recipe = new Recipe();

		$scope.save = function() {
			$scope.recipe.ingredients = Mixer.get().map(function(id) {
				return {id: id};
			});
			if (AuthenticationService.getCurrentUser()) {
				$scope.author = AuthenticationService.getCurrentUser().id ;
			}

			$scope.recipe.$save().then(function(response) {
				Mixer.clear();
				$state.reload();
				$state.go('detail', {name: response.name});
			});
		};
	}])
	.controller('AboutController', ['Prismic', '$scope', function(Prismic, $scope) {
		Prismic.get('about').then(function(about) {
			console.log(about);
			$scope.about = about;
		});
	}]);
