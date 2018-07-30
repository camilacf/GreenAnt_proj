var app = angular.module('charts', [])

// Diretiva para carregar os charts.
app.directive('highchart', function () {
return {
    restrict: 'E',
    template: '<div></div>',
    replace: true,

    link: function (scope, element, attrs) {

        scope.$watch(function () { return attrs.chart; }, function () {

            if (!attrs.chart) return;

            var charts = JSON.parse(attrs.chart);

            $(element[0]).highcharts(charts);

        });
    }
};
});

// todas as chamadas de ng-controller sao executadas aqui
app.controller('Ctrl', function ($scope, $http, $timeout) {
	//calcularei o somatorios dos valores para calcular a fatura depois
	var totalA = 0;
	var totalA1 = 0;
	var totalA2 = 0;
	var totalB = 0;
	var gasTotal = 0;
	//Faço um get do meu json
$http.get('data.json').success(function (data, status) {
    // Defino um scope que recupera os dados através dos meus medidores
    $scope.jsondatafeed = data.medidores;
    // arrays que possuirá os itens do json
    $scope.PlotDataA =[]; 
	$scope.PlotDataB =[]; 
	$scope.PlotDataA1 =[]; 
	$scope.PlotDataA2 =[]; 
	$scope.previsao =[];
    for (var key in $scope.jsondatafeed) {
        // Crio scopes locais
        $scope.ValorArrayA =[];
		$scope.ValorArrayB =[];
		$scope.ValorArrayA1 =[];
		$scope.ValorArrayA2 =[];
        // Realizo o loop no json para colher os dados
        for (var key2 in $scope.jsondatafeed[key].dados) {
			// Armazeno os dados em um outro array, dessa vez contendo somente os valoeres
			if($scope.jsondatafeed[key].nome == "Medidor A"){
				//Separo todos os dados de acordo com o medidor e mes que foi medido
				if($scope.jsondatafeed[key].dados[key2].dia <= 30){
					$scope.ValorArrayA.push( $scope.jsondatafeed[key].dados[key2].valor);
					totalA = totalA + Number($scope.jsondatafeed[key].dados[key2].valor);
				}
				if($scope.jsondatafeed[key].dados[key2].dia <= 60 && $scope.jsondatafeed[key].dados[key2].dia > 30){
					$scope.ValorArrayA1.push( $scope.jsondatafeed[key].dados[key2].valor);
					totalA1 = totalA1 + Number($scope.jsondatafeed[key].dados[key2].valor);
				}
				if($scope.jsondatafeed[key].dados[key2].dia > 60){
					$scope.ValorArrayA2.push( $scope.jsondatafeed[key].dados[key2].valor);
					totalA2 = totalA2 + Number($scope.jsondatafeed[key].dados[key2].valor);
				}
			}
			if($scope.jsondatafeed[key].nome == "Medidor B"){
				$scope.ValorArrayB.push( $scope.jsondatafeed[key].dados[key2].valor);
				totalB = totalB + Number($scope.jsondatafeed[key].dados[key2].valor);
			}
        }
		gasTotal = totalA + totalB;
        // Jogo isso para o array geral, e jogo os valores desejados em suas devidas propriedades
        $scope.PlotDataA.push({name: $scope.jsondatafeed[key].nome , data:  $scope.ValorArrayA }); //Jogo os elementos para o array
		$scope.PlotDataB.push({name: $scope.jsondatafeed[key].nome , data:  $scope.ValorArrayB });
		$scope.PlotDataA1.push({name: "Mes passado" , data:  $scope.ValorArrayA1 });
		$scope.PlotDataA2.push({name: "Mes retrasado" , data:  $scope.ValorArrayA2 });
        console.log($scope.PlotDataA1); // Salvo todo o array
		console.log($scope.PlotDataA2);
        console.log($scope.PlotDataA); 
		console.log($scope.PlotDataB);
    }
	//calculo todos os valores para fatura
	$scope.fatMaiA = Number((totalA*0.9).toFixed(2));
	$scope.fatJunA = Number((totalA1*0.9).toFixed(2));
	$scope.fatJulA = Number((totalA2*0.9).toFixed(2));
	$scope.fatJulB = Number((totalB*0.9).toFixed(2));
	//calculos para previsao de gastos com base na media de gastos para cada dia do mes
	//usando dados de gasto de cada dia nos ultimos 3 meses
	calcMedia = function(dados){
		var media = 0;
		var i = 0;
		for (i in dados){
			media = media + dados[i];
		}
		i++;
		media = media/i;
		return media;
	}
	$scope.medias = [];
	var mediaDia = 0;
	var dia = [];
	var totalPrev = 0;
	//crio um array como os outros com a previsao de gastos
	for(var k in $scope.PlotDataA[0].data){
		dia = [$scope.PlotDataA[0].data[k], $scope.PlotDataA1[0].data[k], $scope.PlotDataA2[0].data[k]];
		mediaDia = calcMedia(dia);
		$scope.medias.push(Number(mediaDia.toFixed(2)));
		totalPrev = totalPrev + mediaDia;
	}
	$scope.previsao.push({name: "Previsao proximo mes", data: $scope.medias});
	console.log($scope.previsao);

    // Defino as propriedades dos Gráficos
    $scope.ChartCol = {
        chart: {
            type: 'column'
        },
		plotOptions:{
			series:{
				pointStart: 1	
			}
		},
        series:  [$scope.PlotDataA[0], $scope.PlotDataB[1]],

		title: {
			text: "Consumo Julho"
		},
		subtitle: {
			verticalAlign:"top",
			align:"left",
			text: "Consumo total: " + totalA.toFixed(2) + "kWh",
			style: {
            color: '#FF0000',
            fontWeight: 'bold'
        }
		},
		yAxis: {
        title: {
            text: 'kWh'
        }
    }
    };
	$scope.ChartColA = {
        chart: {
            type: 'column'
        },
		plotOptions:{
			series:{
				pointStart: 1	
			}
		},
        series:  $scope.PlotDataA,

        legend: {
            enabled: false
        },
		title: {
			text: "Consumo do medidor A"
		},
		subtitle: {
			verticalAlign:"top",
			align:"left",
			text: "Consumo total: " + totalA.toFixed(2) + "kWh",
			style: {
            color: '#FF0000',
            fontWeight: 'bold'
        }
		},
		yAxis: {
        title: {
            text: 'kWh'
        }
    }
    };
	$scope.ChartColA1 = {
        chart: {
            type: 'column'
        },
		plotOptions:{
			series:{
				pointStart: 1	
			}
		},
        series:  $scope.PlotDataA1,

        legend: {
            enabled: false
        },
		title: {
			text: "Consumo Junho"
		},
		subtitle: {
			verticalAlign:"top",
			align:"left",
			text: "Consumo total: " + totalA1.toFixed(2) + "kWh",
			style: {
            color: '#FF0000',
            fontWeight: 'bold'
        }
		},
		yAxis: {
        title: {
            text: 'kWh'
        }
    }
    };
	$scope.ChartColA2 = {
        chart: {
            type: 'column'
        },
		plotOptions:{
			series:{
				pointStart: 1	
			}
		},
        series:  $scope.PlotDataA2,

        legend: {
            enabled: false
        },
		title: {
			text: "Consumo Maio"
		},
		subtitle: {
			verticalAlign:"top",
			align:"left",
			text: "Consumo total: " + totalA2.toFixed(2) + "kWh",
			style: {
            color: '#FF0000',
            fontWeight: 'bold'
        }
		},
		yAxis: {
        title: {
            text: 'kWh'
        }
    }
    };
	$scope.ChartColB = {
        chart: {
            type: 'column'
        },
		plotOptions:{
			series:{
				pointStart: 1	
			}
		},
        series:  $scope.PlotDataB,
		colors:['#f7a35c'],

        legend: {
            enabled: false
        },
		title: {
			text: "Consumo do medidor B"
		},
		subtitle: {
			verticalAlign:"top",
			align:"left",
			text: "Consumo total: " + totalB.toFixed(2) + "kWh",
			style: {
            color: '#FF0000',
            fontWeight: 'bold'
        }
		},
		yAxis: {
        title: {
            text: 'kWh'
        }
    }
    };
	$scope.ChartPreview = {
		charts:{
			type: "line"
		},
		plotOptions:{
			series:{
				pointStart: 1	
			}
		},
        series: [$scope.PlotDataA[0], $scope.previsao[0], $scope.PlotDataA1[0], $scope.PlotDataA2[0]],
		colors:['#90ed7d', '#434348','#01DF01', '#00FF40'],
		legend: {
			layout: 'vertical',
			align: 'right',
			verticalAlign: 'middle'
		},
		title: {
			text: "Previsao de gastos do medidor A para o proximo mes"
		},
		subtitle: {
			verticalAlign:"top",
			align:"left",
			text: "Consumo total: " + totalPrev.toFixed(2) + "kWh",
			style: {
            color: '#FF0000',
            fontWeight: 'bold'
        }
		},
		yAxis: {
        title: {
            text: 'kWh'
        }
    }
    }
	
	//quando cada chart sera mostrado
	//quando cada funcao for chamada, o chart que sera passado para a pagina eh definido aqui
	$scope.CurrentChart = null;
	$scope.showJul = function(){
		$scope.CurrentChart = $scope.ChartCol;
	}
	$scope.showJun = function(){
		$scope.CurrentChart = $scope.ChartColA1;
	}
	$scope.showMai = function(){
		$scope.CurrentChart = $scope.ChartColA2;
	}
	
	$scope.showPreview = function(){
		$scope.CurrentChart = $scope.ChartPreview;
	}
	
	$scope.showChart = function(selected){
		switch(selected){
			case 'A':
				$scope.CurrentChart = $scope.ChartColA;
				break;
			case 'B':
				$scope.CurrentChart = $scope.ChartColB;
				break;
		}

	}
	

}).error("error message");
$timeout($scope.fetch, 1000);
});
