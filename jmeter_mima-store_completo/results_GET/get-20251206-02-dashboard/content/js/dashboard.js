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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5958823529411764, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.57, 500, 1500, "GET Itens Estoque"], "isController": false}, {"data": [0.64, 500, 1500, "GET Categorias"], "isController": false}, {"data": [0.11, 500, 1500, "Login"], "isController": true}, {"data": [0.27, 500, 1500, "GET Clientes"], "isController": false}, {"data": [0.0, 500, 1500, "GET Google Font Average Sans"], "isController": false}, {"data": [0.0, 500, 1500, "Load Login Page"], "isController": true}, {"data": [0.71, 500, 1500, "GET Itens (Produtos)"], "isController": false}, {"data": [1.0, 500, 1500, "GET Frontend Splash Page"], "isController": false}, {"data": [0.97, 500, 1500, "GET Frontend Dashboard Page"], "isController": false}, {"data": [0.11, 500, 1500, "POST Login"], "isController": false}, {"data": [0.14, 500, 1500, "GET Vendas 6 Meses"], "isController": false}, {"data": [0.98, 500, 1500, "GET Frontend Menu Page"], "isController": false}, {"data": [1.0, 500, 1500, "GET Fornecedores"], "isController": false}, {"data": [1.0, 500, 1500, "GET Login Image (RoupasLogin.png)"], "isController": false}, {"data": [0.94, 500, 1500, "GET Usuarios (Funcionarios)"], "isController": false}, {"data": [1.0, 500, 1500, "GET Favicon (Group 2.png)"], "isController": false}, {"data": [0.69, 500, 1500, "GET Vendas Filtrar"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 750, 0, 0.0, 787.6666666666669, 6, 4589, 466.0, 1843.9999999999998, 2512.5999999999954, 3764.550000000001, 54.59309943223176, 924.7697137956762, 15.379188883025186], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET Itens Estoque", 50, 0, 0.0, 638.68, 398, 1128, 643.5, 750.6, 937.0499999999997, 1128.0, 18.49796522382538, 12.374127127266002, 6.701899509803922], "isController": false}, {"data": ["GET Categorias", 50, 0, 0.0, 794.7799999999997, 262, 1609, 546.0, 1512.1, 1542.25, 1609.0, 13.8811771238201, 14.843641553303721, 5.124106399222654], "isController": false}, {"data": ["Login", 50, 0, 0.0, 2543.6599999999994, 1039, 4631, 2615.5, 3919.7999999999997, 4201.849999999999, 4631.0, 10.713520462824084, 6.914405667452325, 2.364507445896722], "isController": true}, {"data": ["GET Clientes", 50, 0, 0.0, 1645.88, 415, 2880, 1498.0, 2843.6, 2864.7, 2880.0, 12.537612838515548, 21.279659290371114, 4.664873526830491], "isController": false}, {"data": ["GET Google Font Average Sans", 50, 0, 0.0, 1721.36, 1658, 1769, 1720.5, 1752.0, 1763.8, 1769.0, 28.26455624646693, 22.85454352741662, 5.27200219050311], "isController": false}, {"data": ["Load Login Page", 50, 0, 0.0, 2995.8600000000006, 2559, 3417, 3052.0, 3373.2999999999997, 3408.9, 3417.0, 14.501160092807424, 2915.880243075696, 9.955386274651973], "isController": true}, {"data": ["GET Itens (Produtos)", 50, 0, 0.0, 526.0000000000001, 242, 839, 523.0, 697.6, 708.9499999999999, 839.0, 26.82403433476395, 70.46548082081544, 9.744668723175964], "isController": false}, {"data": ["GET Frontend Splash Page", 50, 0, 0.0, 420.93999999999994, 345, 494, 423.0, 484.09999999999997, 489.0, 494.0, 96.15384615384616, 81.69320913461539, 14.460637019230768], "isController": false}, {"data": ["GET Frontend Dashboard Page", 50, 0, 0.0, 132.46, 14, 649, 55.0, 420.19999999999993, 561.0499999999995, 649.0, 15.192950470981463, 12.908073154056519, 2.3293879140079006], "isController": false}, {"data": ["POST Login", 50, 0, 0.0, 2488.6400000000003, 888, 4589, 2575.0, 3876.1, 4158.299999999999, 4589.0, 10.817827780181739, 6.981724632193855, 2.387528396797923], "isController": false}, {"data": ["GET Vendas 6 Meses", 50, 0, 0.0, 1759.22, 899, 2482, 1794.0, 2288.3, 2420.0499999999997, 2482.0, 10.850694444444445, 375.83245171440973, 4.38690185546875], "isController": false}, {"data": ["GET Frontend Menu Page", 50, 0, 0.0, 82.82000000000002, 6, 613, 53.5, 166.9, 409.34999999999866, 613.0, 15.262515262515262, 12.967176053113555, 2.3847680097680097], "isController": false}, {"data": ["GET Fornecedores", 50, 0, 0.0, 291.91999999999996, 127, 454, 289.5, 382.2, 412.64999999999975, 454.0, 38.52080123266564, 47.285788231895225, 14.48291843220339], "isController": false}, {"data": ["GET Login Image (RoupasLogin.png)", 50, 0, 0.0, 188.93999999999997, 168, 208, 191.0, 205.0, 206.45, 208.0, 181.8181818181818, 36103.87073863636, 33.02556818181818], "isController": false}, {"data": ["GET Usuarios (Funcionarios)", 50, 0, 0.0, 345.32, 161, 700, 323.5, 545.4, 557.15, 700.0, 32.765399737876805, 255.62771338466578, 11.711070609436435], "isController": false}, {"data": ["GET Favicon (Group 2.png)", 50, 0, 0.0, 204.00000000000006, 95, 336, 214.0, 320.8, 328.79999999999995, 336.0, 127.87723785166241, 108.64570012787723, 21.47937979539642], "isController": false}, {"data": ["GET Vendas Filtrar", 50, 0, 0.0, 574.0399999999998, 235, 940, 582.5, 789.4, 867.9999999999995, 940.0, 34.223134839151264, 32.08418891170431, 13.836306468172484], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 750, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
