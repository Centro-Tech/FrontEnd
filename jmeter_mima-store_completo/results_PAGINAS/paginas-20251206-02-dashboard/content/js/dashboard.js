/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7539772727272728, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "GET Frontend Index HTML"], "isController": false}, {"data": [0.925, 500, 1500, "GET Itens Estoque"], "isController": false}, {"data": [0.925, 500, 1500, "DELETE Remover Cliente Teste"], "isController": false}, {"data": [1.0, 500, 1500, "GET Frontend Login Page"], "isController": false}, {"data": [0.875, 500, 1500, "PATCH Adicionar Estoque Item Existente"], "isController": false}, {"data": [0.325, 500, 1500, "Dashboard"], "isController": true}, {"data": [0.75, 500, 1500, "POST Criar Cliente Teste"], "isController": false}, {"data": [0.9125, 500, 1500, "GET Clientes"], "isController": false}, {"data": [0.5, 500, 1500, "GET Google Font Average Sans"], "isController": false}, {"data": [0.0, 500, 1500, "Load Login Page"], "isController": true}, {"data": [0.5, 500, 1500, "Dashboard - Sazional Estacao Anterior"], "isController": false}, {"data": [0.85, 500, 1500, "Dashboard - Fidelizacao Historico"], "isController": false}, {"data": [0.85, 500, 1500, "Dashboard - Ruptura Historico"], "isController": false}, {"data": [0.325, 500, 1500, "POST Login"], "isController": false}, {"data": [1.0, 500, 1500, "GET Frontend Menu Page"], "isController": false}, {"data": [0.9125, 500, 1500, "Dashboard - Ticket Medio Atual"], "isController": false}, {"data": [0.975, 500, 1500, "GET Fornecedores"], "isController": false}, {"data": [1.0, 500, 1500, "GET Login Image (RoupasLogin.png)"], "isController": false}, {"data": [0.625, 500, 1500, "Dashboard - Sazional Estacao Atual"], "isController": false}, {"data": [1.0, 500, 1500, "GET Favicon (Group 2.png)"], "isController": false}, {"data": [0.0, 500, 1500, "Dashboard - Calendario Historico Completo"], "isController": false}, {"data": [0.9, 500, 1500, "Clientes"], "isController": true}, {"data": [0.9625, 500, 1500, "GET Categorias"], "isController": false}, {"data": [0.325, 500, 1500, "Login"], "isController": true}, {"data": [0.925, 500, 1500, "GET Itens (Produtos)"], "isController": false}, {"data": [0.75, 500, 1500, "Dashboard - Itens Todos"], "isController": false}, {"data": [1.0, 500, 1500, "GET Frontend Splash Page"], "isController": false}, {"data": [1.0, 500, 1500, "GET Frontend Dashboard Page"], "isController": false}, {"data": [0.4875, 500, 1500, "GET Vendas 6 Meses"], "isController": false}, {"data": [0.25, 500, 1500, "Dashboard - Fidelizacao Atual"], "isController": false}, {"data": [0.65, 500, 1500, "Dashboard - Ticket Medio Anterior"], "isController": false}, {"data": [0.475, 500, 1500, "Vendas 6 Meses"], "isController": true}, {"data": [0.5, 500, 1500, "Produtos"], "isController": true}, {"data": [0.975, 500, 1500, "GET Usuarios (Funcionarios)"], "isController": false}, {"data": [0.975, 500, 1500, "GET Vendas Filtrar"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 760, 0, 0.0, 510.6381578947368, 6, 3807, 281.0, 1283.5, 1737.6499999999983, 3106.519999999999, 34.257381113364886, 529.8477733406581, 11.63432147284201], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET Frontend Index HTML", 20, 0, 0.0, 81.9, 10, 341, 26.5, 262.20000000000005, 337.19999999999993, 341.0, 3.8842493688094777, 3.3000946785783647, 0.5613954165857448], "isController": false}, {"data": ["GET Itens Estoque", 40, 0, 0.0, 372.1, 80, 1845, 290.0, 694.5, 909.9999999999994, 1845.0, 2.796420581655481, 1.8706524398769575, 1.0131562849552573], "isController": false}, {"data": ["DELETE Remover Cliente Teste", 20, 0, 0.0, 158.35, 26, 588, 46.5, 575.2, 587.6, 588.0, 7.58150113722517, 2.502487680060652, 2.902293404094011], "isController": false}, {"data": ["GET Frontend Login Page", 20, 0, 0.0, 81.9, 8, 340, 16.0, 265.2000000000001, 336.44999999999993, 340.0, 3.8955979742890534, 3.3097365601869884, 0.582057119205298], "isController": false}, {"data": ["PATCH Adicionar Estoque Item Existente", 20, 0, 0.0, 308.45, 38, 1854, 86.0, 1090.4000000000015, 1818.9499999999994, 1854.0, 4.158004158004158, 2.891112266112266, 1.6932497401247402], "isController": false}, {"data": ["Dashboard", 20, 0, 0.0, 1381.7500000000002, 948, 1785, 1380.5, 1721.3, 1781.8999999999999, 1785.0, 7.79423226812159, 68.10819368667187, 9.095808164458301], "isController": true}, {"data": ["POST Criar Cliente Teste", 20, 0, 0.0, 494.79999999999984, 23, 1958, 60.0, 1885.1000000000001, 1954.85, 1958.0, 4.377325454147516, 2.0670466048369445, 2.3258816207047492], "isController": false}, {"data": ["GET Clientes", 40, 0, 0.0, 251.79999999999998, 88, 635, 184.5, 535.3, 599.9499999999999, 635.0, 11.040574109853711, 18.73878691691968, 4.10786985923268], "isController": false}, {"data": ["GET Google Font Average Sans", 20, 0, 0.0, 1310.95, 1243, 1353, 1320.0, 1340.8, 1352.4, 1353.0, 14.652014652014651, 11.847527472527473, 2.732944139194139], "isController": false}, {"data": ["Load Login Page", 20, 0, 0.0, 1929.0499999999997, 1550, 2318, 1939.5, 2196.6, 2312.15, 2318.0, 8.481764206955047, 1705.505526399491, 5.82292991942324], "isController": true}, {"data": ["Dashboard - Sazional Estacao Anterior", 20, 0, 0.0, 889.0, 586, 1265, 861.0, 1208.5000000000002, 1262.8, 1265.0, 4.9689440993788825, 106.9633152173913, 2.008928571428571], "isController": false}, {"data": ["Dashboard - Fidelizacao Historico", 20, 0, 0.0, 544.1500000000001, 146, 1185, 450.5, 1090.0, 1180.25, 1185.0, 4.608294930875576, 1.5210973502304148, 1.8631192396313365], "isController": false}, {"data": ["Dashboard - Ruptura Historico", 20, 0, 0.0, 473.35, 143, 1188, 357.0, 1154.3000000000004, 1187.5, 1188.0, 4.601932811780948, 4.314312011044638, 1.8605470547630005], "isController": false}, {"data": ["POST Login", 20, 0, 0.0, 1288.8, 669, 2331, 1171.5, 2098.0, 2319.8999999999996, 2331.0, 7.710100231303008, 4.974671116037009, 1.7016432151117966], "isController": false}, {"data": ["GET Frontend Menu Page", 20, 0, 0.0, 96.39999999999999, 7, 298, 58.5, 264.60000000000014, 296.59999999999997, 298.0, 9.70873786407767, 8.248634708737864, 1.5169902912621358], "isController": false}, {"data": ["Dashboard - Ticket Medio Atual", 40, 0, 0.0, 347.19999999999993, 137, 643, 339.0, 527.5, 590.9499999999999, 643.0, 4.628022677311119, 4.338771259979174, 1.8710951058660186], "isController": false}, {"data": ["GET Fornecedores", 40, 0, 0.0, 186.95, 66, 642, 155.0, 365.8999999999998, 613.2999999999992, 642.0, 8.639308855291578, 10.60508909287257, 3.248177645788337], "isController": false}, {"data": ["GET Login Image (RoupasLogin.png)", 20, 0, 0.0, 39.5, 7, 48, 44.5, 47.0, 47.95, 48.0, 132.45033112582783, 26300.832988410595, 24.058360927152318], "isController": false}, {"data": ["Dashboard - Sazional Estacao Atual", 20, 0, 0.0, 669.05, 417, 1027, 630.5, 995.9000000000001, 1025.55, 1027.0, 5.589714924538848, 65.73919612912242, 2.2599042761319175], "isController": false}, {"data": ["GET Favicon (Group 2.png)", 20, 0, 0.0, 134.0, 30, 283, 129.0, 238.40000000000003, 280.84999999999997, 283.0, 65.57377049180329, 55.71209016393443, 11.014344262295083], "isController": false}, {"data": ["Dashboard - Calendario Historico Completo", 20, 0, 0.0, 3051.35, 2448, 3807, 2967.0, 3758.0, 3804.6, 3807.0, 2.635393332454869, 410.9180433851627, 1.0654812887073395], "isController": false}, {"data": ["Clientes", 20, 0, 0.0, 297.15, 151, 674, 212.0, 635.9000000000001, 672.1999999999999, 674.0, 8.521516829995738, 14.463277588410737, 3.170603429910524], "isController": true}, {"data": ["GET Categorias", 40, 0, 0.0, 213.825, 49, 604, 141.5, 491.6, 584.9499999999996, 604.0, 6.314127861089187, 6.751923835832676, 2.330801104972376], "isController": false}, {"data": ["Login", 20, 0, 0.0, 1406.2500000000002, 961, 2371, 1208.5, 2154.0000000000005, 2360.7999999999997, 2371.0, 7.587253414264037, 4.895408526176024, 1.6745305386949922], "isController": true}, {"data": ["GET Itens (Produtos)", 40, 0, 0.0, 365.175, 187, 800, 308.0, 735.7999999999998, 760.55, 800.0, 6.764755623203111, 17.770695924234737, 2.457508878741755], "isController": false}, {"data": ["Dashboard - Itens Todos", 20, 0, 0.0, 613.3499999999999, 191, 1187, 477.0, 1101.9, 1182.8999999999999, 1187.0, 4.826254826254826, 12.697197755791505, 1.762714165057915], "isController": false}, {"data": ["GET Frontend Splash Page", 20, 0, 0.0, 156.65, 18, 230, 207.0, 223.10000000000002, 229.7, 230.0, 54.94505494505494, 46.681833791208796, 8.263221153846153], "isController": false}, {"data": ["GET Frontend Dashboard Page", 40, 0, 0.0, 72.95, 6, 330, 41.0, 219.79999999999995, 308.4999999999996, 330.0, 2.071143789157562, 1.0082667762646922, 0.5825091907005644], "isController": false}, {"data": ["GET Vendas 6 Meses", 40, 0, 0.0, 1035.4249999999995, 736, 1522, 1026.5, 1303.3, 1454.0999999999995, 1522.0, 6.371455877668048, 220.68632526282258, 2.5759597005415737], "isController": false}, {"data": ["Dashboard - Fidelizacao Atual", 20, 0, 0.0, 1678.8499999999997, 1317, 2265, 1531.0, 2202.0, 2261.95, 2265.0, 3.5069261792039277, 280.7184815009644, 1.417839295107838], "isController": false}, {"data": ["Dashboard - Ticket Medio Anterior", 40, 0, 0.0, 621.5500000000001, 310, 1069, 593.5, 949.6999999999999, 1048.7999999999997, 1069.0, 4.395604395604396, 29.376287774725277, 1.777129120879121], "isController": false}, {"data": ["Vendas 6 Meses", 20, 0, 0.0, 1175.1, 892, 1565, 1152.5, 1380.7, 1555.9499999999998, 1565.0, 6.25, 216.4794921875, 2.52685546875], "isController": true}, {"data": ["Produtos", 20, 0, 0.0, 918.2999999999998, 627, 1175, 969.5, 1164.5, 1174.7, 1175.0, 7.473841554559043, 36.79991124813154, 8.283994301195815], "isController": true}, {"data": ["GET Usuarios (Funcionarios)", 20, 0, 0.0, 157.25, 65, 548, 137.5, 290.9000000000002, 535.6999999999998, 548.0, 8.81057268722467, 68.73795429515418, 3.14909140969163], "isController": false}, {"data": ["GET Vendas Filtrar", 20, 0, 0.0, 242.25, 137, 541, 201.0, 454.2000000000001, 536.9, 541.0, 8.81057268722467, 8.259911894273127, 3.5620870044052864], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 760, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
