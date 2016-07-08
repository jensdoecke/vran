var worldCardApp = angular.module('worldCardApp', ['rzModule']);

worldCardApp.controller('worldCardCtrl', function ($scope, $timeout, $http) {
  $scope.countrys = undefined;
  $http.get('/api/countries/').success(function(data) {
      $scope.countrys = data;
  });
  $http.get('/api/laenderinfos/').success(function(data) {
      $scope.mapping = data;
  });
  $http.get('/api/oldcountries/').success(function(data) {
      $scope.oldcountrys = data;
  });
  
  $http.get('/api/exchangerates/').success(function(data) {
      $scope.exchangerates = data;
  });
  
  $scope.customer={name:"",company:"",message:"",email:"",telefon:""};
  $scope.country= undefined;
  $scope.oldcountry = undefined;
  $scope.showForm=false;
  $scope.currentCountry = undefined;
  $scope.currentActivity = undefined;
  $scope.l18n= {
    'button_form_contact':'Ich will mehr wissen!',
    'button_form_submit':'Absenden',
    'button_form_close':'Schließen',
    'export':'exportieren',
    'import':'importieren',
    'production':'Standorterschliessung',
    'titel':'VR AuslandService',
    'lessImportant':'weniger wichtig',
    'moreImportant':'sehr wichtig'
  };
  $scope.exportKaufKraft = {value: 0,options: { ceil: 80, floor: 0, hideLimitLabels:true, onChange:function(){$scope.colorMap();}}};
  $scope.exportEinfuhrbestimmungen = {value: 0,options: { ceil: 80, floor: 0, hideLimitLabels:true, onChange:function(){$scope.colorMap();}}};
  $scope.exportLogistik = {value: 0,options: { ceil: 80, floor: 0, hideLimitLabels:true, onChange:function(){$scope.colorMap();}}};

  $scope.importAusfuhrbestimmungen = {value: 0,options: { ceil: 80, hideLimitLabels:true, onChange:function(){$scope.colorMap();}}};
  $scope.importPreisniveau = {value: 0,options: { ceil: 80, floor: 0, hideLimitLabels:true, onChange:function(){$scope.colorMap();}}};
  $scope.importLogistik = {value: 0,options: { ceil: 80, floor: 0, hideLimitLabels:true, onChange:function(){$scope.colorMap();}}};

  $scope.productionInfrastruktur = {value: 0,options: { ceil: 80, floor: 0, hideLimitLabels:true, onChange:function(){$scope.colorMap();}}};
  $scope.productionLohnniveau = {value: 0,options: { ceil: 80, floor: 0, hideLimitLabels:true, onChange:function(){$scope.colorMap();}}};
  $scope.productionUmwelteinfluesse = {value: 0,options: { ceil: 80, floor: 0, hideLimitLabels:true, onChange:function(){$scope.colorMap();}}};

  angular.element(document).ready(function () {
    $scope.renderMap();
  });

  $scope.renderMap = function(data){
    jQuery('#vmap').vectorMap({
      map: 'world_de',
      backgroundColor: '#FFFFFF',
      color: '#0d47a1',
      hoverOpacity: 0.4,
      selectedColor: '#f60',
      enableZoom: true,
      showTooltip: true,
      normalizeFunction: 'polynomial',
      onRegionClick: function (element, code, region) {
        $("#landDetails").openModal({
          ready: function() {
            var val = $scope.currentActivity;
            if (val == null || val == undefined || val == ""){
              val = $scope.l18n.export;
            }
            $('ul.tabs').tabs('select_tab',val);
          },
          complete: function() {
          $scope.showForm= false;
          $('#vmap').vectorMap('deselect',region);
          $scope.colorMap();
        }});
        $scope.$apply(function(){
          $scope.currentCountry = code;
          $scope.country=  $scope.countrys[code.toUpperCase()];
	  $scope.oldcountry = $scope.oldcountrys[code.toUpperCase()];
	  $scope.exchangerate = $scope.exchangerates[code.toUpperCase()];
        });
      },
      onRegionOut: function(element,code,region){
        $scope.colorMap();
      }
    });
  }

  $scope.colorMap = function(){
    var colorData= {};
    var color= [];
        color[true] = "#0d47a1";
        color[false] = "#888888";
    for(key in $scope.countrys){
      var item = $scope.countrys[key];
      var olditem = $scope.oldcountrys[key];
      var exchangerate = $scope.exchangerates[key];
      var match = false;
      if ($scope.currentActivity == undefined){
        match=true;
      }
      if($scope.currentActivity === $scope.l18n.export){
        if(($scope.exportKaufKraft.value <= item.export_kaufkraft) &&
           ($scope.exportEinfuhrbestimmungen.value <= 100 - item.export_einfuhrbestimmungen) &&
           ($scope.exportLogistik.value <= item.export_logistikanbindung))
             match = true;
      }
      if($scope.currentActivity === $scope.l18n.import){
        if(($scope.importAusfuhrbestimmungen.value<= 100 - item.import_ausfuhrbestimmung) &&
           ($scope.importPreisniveau.value <= item.import_preisniveau) &&
           ($scope.importLogistik.value <= item.import_logistikanbindung))
            match=true;
      }
      if($scope.currentActivity === $scope.l18n.production){
        if(($scope.productionInfrastruktur.value <= item.politische_lage) &&
          ($scope.productionLohnniveau.value <= item.produktionsstaette_lohnniveau) &&
          ($scope.productionUmwelteinfluesse.value <= item.produktionsstaette_umwelteinfluesse))
            match=true;
      }
      colorData[key.toLowerCase()] = color[match];
    }
    jQuery('#vmap').vectorMap('set', 'colors', colorData );
  }

  $scope.refreshSliderRendering = function(val){
    $scope.exportKaufKraft.value = 0;
    $scope.exportEinfuhrbestimmungen.value = 0;
    $scope.exportLogistik.value = 0;
    $scope.importAusfuhrbestimmungen.value = 0;
    $scope.importPreisniveau.value = 0;
    $scope.importLogistik.value = 0;
    $scope.productionInfrastruktur.value = 0;
    $scope.productionLohnniveau.value = 0;
    $scope.productionUmwelteinfluesse.value = 0;

    $scope.colorMap();

    if($scope.currentActivity == val){
      $scope.currentActivity= undefined;
    } else {
      $scope.currentActivity = val;
    }
    $timeout(function () {
     $scope.$broadcast('rzSliderForceRender');
   },300);
  }

  $scope.mapper = function(context, value){
    if($scope.mapping)
    {
      var entry = $scope.mapping[context];
      if(entry)
      {
        if (value == 0 || value == null || value == undefined || value ==""){
          return entry.zero;
        }else if(value <= 30){
          return entry.low;
        } else if(value <= 70){
          return entry.medium;
        } else if(value <= 100){
          return entry.high;
        }
      }
    }
  };
  $scope.myFilter = function (item) {
    return item.name = 'deu' || item.name === 'blue';
  };
  $scope.openWindow = function(code){
      $scope.currentCountry = code.toLowerCase();
      $scope.country=  $scope.countrys[code.toUpperCase()];
      $scope.oldcountry = $scope.oldcountrys[code.toUpperCase()];
      $scope.exchangerate = $scope.exchangerates[code.toUpperCase()];
      $scope.searchString = "";

    $("#landDetails").openModal({ready: function() {
      var val = $scope.currentActivity;
      if (val == null || val == undefined || val == ""){
        val = $scope.l18n.export;
      }
      $('ul.tabs').tabs('select_tab', val);
    },complete: function() {
      $scope.showForm= false;
    }});
  }
});
