var enableDebugMsgs = true;
var modName = 'global.js:';


/** START: Helpers **/
Date.prototype.yyyymmdd = function () {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [this.getFullYear(),
            (mm > 9 ? '' : '0') + mm,
            (dd > 9 ? '' : '0') + dd
    ].join('-');
};
/** END: Helpers **/


/** START: Dish Pointer Functions **/
function initDishPointer() {

    var dishpointer = $('.dishpointer');
    var dp_activation = $('[data-target="dishpointer"]');
    var pointtyperadio = $('[name="pointtype"]');
    var btn_calc = $('.dp-calc');
    var msgbox = $('.msgbox');
    var query_cache = Array();
    //var access_token = 'sk.eyJ1IjoiY2hyaXN3Y29vayIsImEiOiJjajVzZHl0aTQxNWRpMnFzZGo0Y3pkMWZ6In0.vpAg8pOlT4UBNWR9tfwhZQ';
    var access_token = 'pk.eyJ1IjoiY2hyaXN3Y29vayIsImEiOiJjajU5Mzhrc2wwM3FuMnFsYXA0NDUydWFyIn0.M5hOBFKAxuGn-_1Eyx5SIQ';

    function readHash() {
        var hash = location.hash;

        if (hash == '#dishpointer') {
            if (dp_activation.length) {
                dp_activation.trigger('click');
            }
        }
    }

    function showMessage(msgtype, message) {
        if (msgbox.length) {
            msgbox.removeClass('error warning success').addClass(msgtype);
            msgbox.html(message);
            msgbox.show();
        }
    }
    function hideMessage() {
        if (msgbox.length) {
            msgbox.removeClass('error warning success');
            msgbox.html('');
            msgbox.hide();
        }
    }

    function address2latlong(address, callback) {
        var baseurl = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';
        var useCallback = (typeof callback === 'function') ? true : false;

        if (typeof address === 'undefined' || address === null || address == '') {
            if (useCallback) {
                callback(false);
            }
            return false;
        }
        if (typeof query_cache[address] !== 'undefined' && typeof query_cache[address]['lat'] !== 'undefined') {
            if (useCallback) {
                callback(true);
            }
            return true;
        } else {
            var encoded_address = encodeURIComponent(address);
            var fullurl = baseurl + encoded_address + '.json?access_token=' + access_token;
            $.ajax(fullurl)
                .done(function (data) {
                    if (data.features) {
                        var firstfeature = data.features[0]; // if you have a feature, assume it is valid
                        // console.log('firstfeature:', firstfeature.center[0], ',',firstfeature.center[1]);
                        query_cache[address] = {
                            'long': firstfeature.center[0],
                            'lat': firstfeature.center[1]
                        };
                        /*
                        query_cache[address]['lat'] = firstfeature.center[0];
                        query_cache[address]['long'] = firstfeature.center[1];*/
                        if (useCallback) {
                            callback(true);
                        }
                        return true;
                    } else {
                        if (useCallback) {
                            callback(false);
                        }
                        return false;
                    }
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    if (useCallback) {
                        callback(false);
                    }
                    return false;
                });
        }
    }

    function calcMetrics(lat, long) {
        
        var dppol = $('.dp-pol');
        var dpele = $('.dp-ele');
        var dpazt = $('.dp-azt');
        var dplat = $('.dp-lat');
        var dplong = $('.dp-long');
        var azt, pol;
        var sat_long = $('#dp-sat').val();
        var angle = -1 * sat_long;
        var dishalignment = $('.dishalignment');
        var satstyle = 'mapbox://styles/mapbox/satellite-v9';
        var streetstyle = 'mapbox://styles/mapbox/streets-v9';

        azt = 180 + 57.29578 * Math.atan(Math.tan((long - angle) / 57.29578) / Math.sin(lat / 57.29578));
        azt = (lat < 0) ? azt - 180 : azt;
        azt = (azt < 0) ? azt + 360.0 : azt;
        azt = Math.round(azt * 100) / 100;


        delta = (long - angle) / 57.29578;
        latr = lat / 57.29578;
        r = 1 + 35786 / 6378.16;
        i1 = r * Math.cos(latr) * Math.cos(delta) - 1;
        i2 = r * Math.sqrt(1 - Math.cos(latr) * Math.cos(latr) * Math.cos(delta) * Math.cos(delta));
        ele = 57.29578 * Math.atan(i1 / i2);
        ele = Math.round(ele * 100) / 100;


        delta = (angle - long) / 57.29578;
        s = -57.29578 * Math.atan((Math.sin(delta)) / Math.tan(lat / 57.29578));
        pol = Math.round(s * 100) / 100;

        // console.log('azt:', azt, ', ele:', ele, ', pol:', pol);

        if (dppol.length) { dppol.html(pol); }
        if (dpele.length) { dpele.html(ele); }
        if (dpazt.length) { dpazt.html(azt); }
        if (dplat.length) { dplat.html(lat); }
        if (dplong.length) { dplong.html(long); }

        if (ele < 0) {
            showMessage('error', 'At your elevation, you will be unable to receive a signal.');
        } else if (ele < 5) {
            showMessage('warning', 'At your elevation, you will possibly receive a weak signal.');
        } else {
            hideMessage();
        }
        dishalignment.show();
        mapboxgl.accessToken = access_token;
        map = new mapboxgl.Map({
            container: 'dp-map',
            style: satstyle,
            zoom: 13,
            center: [long,lat],
            interactive: true,
            renderWorldCopies: false
        });

        map.on('load', function () {
            map.addLayer({
                "id": "route",
                "type": "line",
                "source": {
                    "type": "geojson",
                    "data": {
                        "type": "Feature",
                        "properties": {},
                        "geometry": {
                            "type": "LineString",
                            "coordinates": [
                                [long,lat],
                                [sat_long*-1,0]
                            ]
                        }
                    }
                },
                "layout": {
                    "line-join": "round",
                    "line-cap": "round"
                },
                "paint": {
                    "line-color": "#83e1fd",
                    "line-width": 4
                }
            });

            map.addControl(new mapboxgl.NavigationControl());

            map.addLayer({
                "id": "points",
                "type": "symbol",
                "source": {
                    "type": "geojson",
                    "data": {
                        "type": "FeatureCollection",
                        "features": [{
                            "type": "Feature",
                            "geometry": {
                                "type": "Point",
                                "coordinates": [long, lat]
                            },
                            "properties": {
                                "title": "",
                                "icon": "monument"
                            }
                        }]
                    }
                },
                "layout": {
                    "icon-image": "{icon}-15",
                    "text-field": "{title}",
                    "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
                    "text-offset": [0, 0.6],
                    "text-anchor": "top"
                }
            });

            window.dispatchEvent(new Event('resize'));
        });

       

        // show map div
        let mapContainer = document.getElementById("dp-map");
        mapContainer.style.display = "block";
        mapContainer.style.zIndex = "1000";
    }

    function initDP() {
        var close = dishpointer.find('.dp-close');

        if (close.length) {
            close.on('click', function (e) {
                e.preventDefault();
                dishpointer.hide();
            });
        }
        if (dp_activation.length) {
            dp_activation.on('click', function (e) {
                e.preventDefault();
                dishpointer.show();
            });
            readHash();
        }
        $('#point_lat').hide();
        $('#point_long').hide();
        if (pointtyperadio.length) {
            pointtyperadio.on('change', function (e) {
                if ($('[name="pointtype"]:checked').val() == 'address') {
                    $('#point_address').show();
                    $('#point_lat').hide();
                    $('#point_long').hide();
                } else {
                    $('#point_address').hide();
                    $('#point_lat').show();
                    $('#point_long').show();
                }
            });
        }
        if (btn_calc.length) {
            btn_calc.on('click', function (e) {
                var lat, long;
                var address = $('[name="pointtype"]:checked').val(); 
                if (address == 'address') {
                    var location = $('#point_address').val();
                    address2latlong(location, function (success) {
                        if (success) {
                            lat = query_cache[location].lat;
                            long = query_cache[location].long;
                            calcMetrics(lat, long);
                        } else {
                            // show error
                            return false;
                        }
                    });
                } else {
                    lat = $('#point_lat').val();
                    long = $('#point_long').val();
                    calcMetrics(lat, long);
                }
                
                // stop refresh
                return false;
            });
        }
    }

    function init() {
        if (dishpointer.length) {
            initDP();
        }
    }

    init();
}
/** END: Dish Pointer Functions **/



function initBlocksat() {

    function init() {
        var curPage = $('body').data('page');
        curPage = (typeof curPage === 'undefined') ? '' : curPage;
        
        initDishPointer();
    }

    init();
}
initBlocksat();


const showDishpointer = (event) => {
    event.preventDefault;

    let dishpointer = document.getElementById("dishpointer-tool");
    let dishpointerModal = document.getElementById("dishpointer-modal");

    dishpointer.style.display = "block";
    dishpointerModal.classList.toggle("show-modal");
};

const closeDishpointer = (event) => {
    event.preventDefault;
    
    let dishpointer = document.getElementById("dishpointer-tool");
    let dishpointerModal = document.getElementById("dishpointer-modal");

    dishpointer.style.display = "none";
    dishpointerModal.classList.toggle("show-modal");
};