window.__64CAST_PAGE_SIZE=24;


(function(){
'use strict';

function esc(value){
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
window.esc = esc;

var API_URL = window.SITE_API_URL || 'https://64cast-products-api.trailsec5.workers.dev';
var API_FALLBACK_URL = 'https://64cast-products-api.trailsec5.workers.dev';
var IMAGE_BASE_URL = 'https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/';
var WA_NUMBER = '971552112588';
var ADMIN_KEY = '64cast_manage_8821';
var ADMIN_TOKEN_KEY = '64cast_admin_token';

function isNewArrivalProduct(p){
  if(p && p.newArrival) return true;
  var v = String((p && (p.NEWARRIVAL || p['NEW ARRIVAL'] || p.newArrival || p.newarrival)) || '').toLowerCase();
  return v === 'yes' || v === 'true' || v === '1' || v === 'new';
}
function productETA(p){
  return (p && (p.ETA || p.eta)) ? String(p.ETA || p.eta).trim() : '';
}

function brandTitleFromSlug(slug){
  return String(slug || '')
    .split('-')
    .filter(Boolean)
    .map(function(part){
      if(part === 'gt') return 'GT';
      if(part === 'cm') return 'CM';
      if(part === 'bbr') return 'BBR';
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(' ');
}

function routeInfo(){
  var path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  if(!path || path === 'index.html' || path === 'stock.html' || path === 'stock' || path === 'admin' || path === 'admin.html') return {section:'current', brandSlug:''};
  var parts = path.split('/').filter(Boolean);
  if(parts[0] === 'current-stock' || parts[0] === 'current-stocks') return {section:'current', brandSlug:parts[1] || ''};
  if(parts[0] === 'pre-order' || parts[0] === 'pre-orders' || parts[0] === 'preorders') return {section:'pre-orders', brandSlug:parts[1] || ''};
  if(parts[0] === 'new-arrivals') return {section:'new-arrivals', brandSlug:parts[1] || ''};
  // Real brand routes are shallow (e.g. /mini-gt, /current-stock/mini-gt). A deeply
  // nested path (like a preview-tool iframe URL) is never a legitimate brand slug —
  // treat it as the default listing instead of silently matching zero products.
  if(parts.length > 2) return {section:'current', brandSlug:''};
  return {section:'current', brandSlug:parts[0] || ''};
}
function routeBrandSlug(){ return routeInfo().brandSlug; }

var PAGE_ROUTE = routeInfo();
var PAGE_BRAND_SLUG = PAGE_ROUTE.brandSlug;
var PAGE_NEW_ARRIVALS = PAGE_ROUTE.section === 'new-arrivals';
var PAGE_PRE_ORDERS = PAGE_ROUTE.section === 'pre-orders';
var PAGE_BRAND = (window.__64CAST_BRAND || brandTitleFromSlug(PAGE_BRAND_SLUG) || '').toString().trim();
var isAdmin = new URLSearchParams(window.location.search).has(ADMIN_KEY);
setTimeout(function(){
  var t=document.getElementById('listingTitle');
  if(t && PAGE_NEW_ARRIVALS) t.textContent='New Arrivals';
  if(t && PAGE_PRE_ORDERS) t.textContent='PRE-ORDER';
},0);

var PRODUCTS = [];
window.__64CAST_PAGE_SIZE = window.__64CAST_PAGE_SIZE || ((window.matchMedia && window.matchMedia('(max-width:767px)').matches) ? 24 : 25);
var visibleCount = window.__64CAST_PAGE_SIZE;
window.PRODUCTS = PRODUCTS;
// NOTE: PRODUCTS below gets *reassigned* (not mutated) once data loads, so window.PRODUCTS
// must be re-synced after every reassignment or it stays frozen on this initial empty array.
var CART_KEY = '64cast_cart_v1';
var cart = loadSavedCart();
var activeBrand = PAGE_BRAND || 'All';
var activeCarBrand = 'All';
var activeStatusFilter = (PAGE_BRAND_SLUG && !/^\/(current-stock|current-stocks|pre-order|pre-orders|preorders|new-arrivals)(\/|$)/i.test(window.location.pathname)) ? 'All' : (PAGE_PRE_ORDERS ? 'preorder' : 'currentstock');
var activeSort = 'featured';
var homeStatusFilter = 'current';
var admImgs = ['','','',''];
var admImgPos = ['center','center']; // position preset for Main and Side images only
var admImgZoom = [100,100]; // zoom percentage for Main and Side images only, 100 = no zoom
var ADM_LABELS = ['Main','Side','Rear','Detail'];
var ADM_POSITIONS = ['center','top','bottom','left','right','top left','top right','bottom left','bottom right'];

var EMBEDDED_NEW_PRODUCT_LIST = [{"BRAND":"Bburago","CARBRAND":"Ferrari","PRODUCT NAME":"18-36844 (#16) 2024 1/43 F1 Ferrari SF-24#16 Charles Leclerc ,","MODEL NO.":"FerrariSF-24Sainz2024","PRICE":50.0,"ORIGPRICE":50.0,"QTY":1,"STATUS":"currentstock","SORTORDER":1,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/FerrariSF-24Sainz2024-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/FerrariSF-24Sainz2024-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/FerrariSF-24Sainz2024-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/FerrariSF-24Sainz2024-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Bburago","CARBRAND":"Ferrari","PRODUCT NAME":"18-38097 (#1) 2024 1/43 F1 Oracle Red Bull Racing RB20 #1 Max Fettaven Race Sports Mini","MODEL NO.":"18-38174V","PRICE":50.0,"ORIGPRICE":50.0,"QTY":1,"STATUS":"currentstock","SORTORDER":2,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/18-38174V-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/18-38174V-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/18-38174V-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/18-38174V-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Tarmac Works","CARBRAND":"Diroma","PRODUCT NAME":"Garage Tools Set EVA Racing T64A-TL001-EVA","MODEL NO.":"T64A-TL001-EVA","PRICE":150.0,"ORIGPRICE":150.0,"QTY":1,"STATUS":"currentstock","SORTORDER":3,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/T64A-TL001-EVA-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/T64A-TL001-EVA-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/T64A-TL001-EVA-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/T64A-TL001-EVA-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"BBR Model","CARBRAND":"Pagani","PRODUCT NAME":"Pagani Utopia Dubai Red","MODEL NO.":"BBRDIE6431","PRICE":90.0,"ORIGPRICE":90.0,"QTY":1,"STATUS":"currentstock","SORTORDER":4,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/BBRDIE6431-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/BBRDIE6431-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/BBRDIE6431-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/BBRDIE6431-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Mini GT","CARBRAND":"Abarth","PRODUCT NAME":"Abarth 595 LB-WORKS x Abas Works Fighters","MODEL NO.":"MGT01064","PRICE":50.0,"ORIGPRICE":50.0,"QTY":1,"STATUS":"currentstock","SORTORDER":5,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01064-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01064-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01064-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01064-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Mini GT","CARBRAND":"Abarth","PRODUCT NAME":"Abarth 595 LB-WORKS x Abas Works IZTK Blister Packaging","MODEL NO.":"MGT01051","PRICE":55.0,"ORIGPRICE":55.0,"QTY":2,"STATUS":"currentstock","SORTORDER":6,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01051-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01051-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01051-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01051-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Poprace","CARBRAND":"Aston Martin","PRODUCT NAME":"ASTON MARTIN AMR23 F1 #14 F ALONSO","MODEL NO.":"PR640198","PRICE":65.0,"ORIGPRICE":65.0,"QTY":1,"STATUS":"currentstock","SORTORDER":7,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640198-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640198-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640198-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640198-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Mini GT","CARBRAND":"Aston Martin","PRODUCT NAME":"Aston Martin DB5 Goldfinger 007 Series English Blister Packaging","MODEL NO.":"MGT00900-007E","PRICE":55.0,"ORIGPRICE":55.0,"QTY":1,"STATUS":"currentstock","SORTORDER":8,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00900-007E-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00900-007E-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00900-007E-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00900-007E-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Mini GT","CARBRAND":"BMW","PRODUCT NAME":"BMW M3 Competition Touring Portimao Blue Metallic","MODEL NO.":"MGT01090","PRICE":50.0,"ORIGPRICE":50.0,"QTY":9,"STATUS":"currentstock","SORTORDER":9,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01090-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01090-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01090-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01090-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Mini GT","CARBRAND":"BMW","PRODUCT NAME":"BMW M4 M-Performance G82 Daytona Violet","MODEL NO.":"MGT01112","PRICE":50.0,"ORIGPRICE":50.0,"QTY":13,"STATUS":"currentstock","SORTORDER":10,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01112-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01112-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01112-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01112-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Tarmac Works","CARBRAND":"Ferrari","PRODUCT NAME":"CENTAURIA x IXO COLLECTIONS FERRARI GT FERRARI SF90 STRADALE 2019 Simplified Chinese Version","MODEL NO.":"IXC.FSD.FE.003-C","PRICE":85.0,"ORIGPRICE":85.0,"QTY":1,"STATUS":"currentstock","SORTORDER":11,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/IXC.FSD.FE.003-C-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/IXC.FSD.FE.003-C-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/IXC.FSD.FE.003-C-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/IXC.FSD.FE.003-C-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"BBR Model","CARBRAND":"Ferrari","PRODUCT NAME":"Ferrari 812 Competition Giallo Competizione","MODEL NO.":"BBRFER64008","PRICE":115.0,"ORIGPRICE":115.0,"QTY":1,"STATUS":"currentstock","SORTORDER":12,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/BBRFER64008-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/BBRFER64008-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/BBRFER64008-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/BBRFER64008-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"BBR Model","CARBRAND":"Ferrari","PRODUCT NAME":"Ferrari 812 Competizione Tailor Made","MODEL NO.":"BBRFER64032","PRICE":110.0,"ORIGPRICE":110.0,"QTY":1,"STATUS":"currentstock","SORTORDER":13,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/BBRFER64032-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/BBRFER64032-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/BBRFER64032-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/BBRFER64032-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Mini GT","CARBRAND":"Ford","PRODUCT NAME":"Ford Mustang Convertible 1964 Highland Green","MODEL NO.":"MGT01166","PRICE":55.0,"ORIGPRICE":55.0,"QTY":1,"STATUS":"currentstock","SORTORDER":14,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01166-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01166-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01166-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01166-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Mini GT","CARBRAND":"Ford","PRODUCT NAME":"Ford Mustang Convertible 1964 Highland Green Blister packaging","MODEL NO.":"MGT01166","PRICE":55.0,"ORIGPRICE":55.0,"QTY":2,"STATUS":"currentstock","SORTORDER":15,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01166-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01166-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01166-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01166-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Mini GT","CARBRAND":"Ford","PRODUCT NAME":"Ford Mustang GTD Spirit of America","MODEL NO.":"MGT01097","PRICE":50.0,"ORIGPRICE":50.0,"QTY":5,"STATUS":"currentstock","SORTORDER":16,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01097-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01097-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01097-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01097-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Inno64","CARBRAND":"Nissan","PRODUCT NAME":"GT-R R35 WIDEBODY AORUS X INNO64 Limited Edition","MODEL NO.":"IN6435LB-AORUS","PRICE":95.0,"ORIGPRICE":95.0,"QTY":1,"STATUS":"currentstock","SORTORDER":17,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/IN6435LB-AORUS-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/IN6435LB-AORUS-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/IN6435LB-AORUS-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/IN6435LB-AORUS-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Kaido House","CARBRAND":"Honda","PRODUCT NAME":"Honda Civic EF Kaido Works V2","MODEL NO.":"KHMG156","PRICE":65.0,"ORIGPRICE":65.0,"QTY":1,"STATUS":"currentstock","SORTORDER":18,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/KHMG156-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/KHMG156-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/KHMG156-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/KHMG156-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Mini GT","CARBRAND":"Honda","PRODUCT NAME":"Honda Civic EF Kanjo V1","MODEL NO.":"KHMG139","PRICE":70.0,"ORIGPRICE":70.0,"QTY":3,"STATUS":"currentstock","SORTORDER":19,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/KHMG139-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/KHMG139-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/KHMG139-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/KHMG139-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Motorhelix","CARBRAND":"Honda","PRODUCT NAME":"Honda Civic Type R EK9 Js Racing Yellow","MODEL NO.":"M65053","PRICE":65.0,"ORIGPRICE":65.0,"QTY":1,"STATUS":"currentstock","SORTORDER":20,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/M65053-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/M65053-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/M65053-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/M65053-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Motorhelix","CARBRAND":"Honda","PRODUCT NAME":"Honda Civic TYPE R FL5 Sonic Grey pearl with Costom wheels","MODEL NO.":"M65343","PRICE":90.0,"ORIGPRICE":90.0,"QTY":2,"STATUS":"currentstock","SORTORDER":21,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/M65343-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/M65343-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/M65343-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/M65343-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Mini GT","CARBRAND":"Honda","PRODUCT NAME":"Honda NSX Kaido Test Car Spec V1","MODEL NO.":"KHMG190","PRICE":95.0,"ORIGPRICE":95.0,"QTY":1,"STATUS":"currentstock","SORTORDER":22,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/KHMG190-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/KHMG190-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/KHMG190-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/KHMG190-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"American Diorama","CARBRAND":"Diorama","PRODUCT NAME":"Influencers Figure Set For","MODEL NO.":"AD-2433","PRICE":70.0,"ORIGPRICE":70.0,"QTY":1,"STATUS":"currentstock","SORTORDER":23,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/AD-2433-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/AD-2433-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/AD-2433-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/AD-2433-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Tarmac Works","CARBRAND":"Koenigsegg","PRODUCT NAME":"Koenigsegg Gemera Green","MODEL NO.":"T64G-TL053-GR","PRICE":55.0,"ORIGPRICE":55.0,"QTY":1,"STATUS":"currentstock","SORTORDER":24,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/T64G-TL053-GR-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/T64G-TL053-GR-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/T64G-TL053-GR-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/T64G-TL053-GR-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Mini GT","CARBRAND":"Lamborghini","PRODUCT NAME":"Lamborghini Countach LPI 800-4 Nero Maia USA Blister","MODEL NO.":"MGT00607","PRICE":60.0,"ORIGPRICE":60.0,"QTY":1,"STATUS":"currentstock","SORTORDER":25,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00607-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00607-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00607-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00607-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Mini GT","CARBRAND":"Lamborghini","PRODUCT NAME":"Lamborghini Revuelto Giallo Blister Packaging","MODEL NO.":"MGT00886","PRICE":60.0,"ORIGPRICE":60.0,"QTY":1,"STATUS":"currentstock","SORTORDER":26,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00886-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00886-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00886-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00886-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Mini GT","CARBRAND":"Land Rover","PRODUCT NAME":"Land Rover Defender 110 1989 Camel Trophy Amazon Team Turkey Blister Packaging","MODEL NO.":"MGT00856","PRICE":65.0,"ORIGPRICE":65.0,"QTY":4,"STATUS":"currentstock","SORTORDER":27,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00856-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00856-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00856-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00856-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Poprace","CARBRAND":"Nissan","PRODUCT NAME":"LAUREL C130 APAxpo 2025","MODEL NO.":"PR640348","PRICE":90.0,"ORIGPRICE":90.0,"QTY":3,"STATUS":"currentstock","SORTORDER":28,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640348-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640348-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640348-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640348-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Mini GT","CARBRAND":"Lamborghini","PRODUCT NAME":"LB-Silhouette WORKS MURCIELAGO GT Evo Yellow","MODEL NO.":"MGT01135","PRICE":80.0,"ORIGPRICE":80.0,"QTY":2,"STATUS":"currentstock","SORTORDER":29,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01135-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01135-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01135-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01135-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Mini GT","CARBRAND":"Abarth","PRODUCT NAME":"LB-WORKS x Abas Works ABARTH 595 Gara White","MODEL NO.":"MGT00809","PRICE":45.0,"ORIGPRICE":45.0,"QTY":2,"STATUS":"currentstock","SORTORDER":30,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00809-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00809-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00809-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00809-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Mini GT","CARBRAND":"Abarth","PRODUCT NAME":"LB-WORKS x Abas Works ABARTH 595 Red Blister Packaging","MODEL NO.":"MGT00963","PRICE":50.0,"ORIGPRICE":50.0,"QTY":1,"STATUS":"currentstock","SORTORDER":31,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00963-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00963-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00963-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00963-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Mini GT","CARBRAND":"Mazda","PRODUCT NAME":"Mazda AZ-1 Liberty Walk LB40 PILOT Blister","MODEL NO.":"MGT01047","PRICE":60.0,"ORIGPRICE":60.0,"QTY":1,"STATUS":"currentstock","SORTORDER":32,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01047-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01047-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01047-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01047-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Tarmac Works","CARBRAND":"Mazda","PRODUCT NAME":"Mazda RX-7 FD3S Mazdaspeed A-Spec ESDER","MODEL NO.":"T64G-012-PRIX","PRICE":65.0,"ORIGPRICE":65.0,"QTY":1,"STATUS":"currentstock","SORTORDER":33,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/T64G-012-PRIX-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/T64G-012-PRIX-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/T64G-012-PRIX-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/T64G-012-PRIX-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Poprace","CARBRAND":"Mazda","PRODUCT NAME":"Mazda Rx-7 FD3S Re-Amemiya BAPE STORE Hong Kong 20th Anniversary Special Edition","MODEL NO.":"PR640493","PRICE":220.0,"ORIGPRICE":220.0,"QTY":2,"STATUS":"currentstock","SORTORDER":34,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640493-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640493-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640493-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640493-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Mini GT","CARBRAND":"Mazda","PRODUCT NAME":"MAZDA RX-7 LB-Super Silhouette #41 Numero Reserve","MODEL NO.":"MGT00773","PRICE":65.0,"ORIGPRICE":65.0,"QTY":3,"STATUS":"currentstock","SORTORDER":35,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00773-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00773-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00773-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00773-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"CM Model","CARBRAND":"Mclaren","PRODUCT NAME":"Mclaren 765LT Silver Gray","MODEL NO.":"CM64-765LT-20","PRICE":75.0,"ORIGPRICE":75.0,"QTY":1,"STATUS":"currentstock","SORTORDER":36,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-765LT-20-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-765LT-20-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-765LT-20-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-765LT-20-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"CM Model","CARBRAND":"Mclaren","PRODUCT NAME":"McLaren Solus GT 2023 Goodwood Festival of Speed Timed Shootout Winner","MODEL NO.":"CM64-Solusgt-06","PRICE":80.0,"ORIGPRICE":80.0,"QTY":1,"STATUS":"currentstock","SORTORDER":37,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-Solusgt-06-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-Solusgt-06-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-Solusgt-06-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-Solusgt-06-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Mini GT","CARBRAND":"Mercedes-Benz","PRODUCT NAME":"Mercedes-Benz Actros with Racing Transporter ADVAN","MODEL NO.":"MGT00741","PRICE":295.0,"ORIGPRICE":295.0,"QTY":3,"STATUS":"currentstock","SORTORDER":38,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00741-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00741-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00741-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00741-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Mini GT","CARBRAND":"Apparel","PRODUCT NAME":"MINI GT Cap RE-Amemiya 2026 Black","MODEL NO.":"MGTOM073","PRICE":65.0,"ORIGPRICE":65.0,"QTY":2,"STATUS":"currentstock","SORTORDER":39,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGTOM073-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGTOM073-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGTOM073-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGTOM073-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Tarmac Works","CARBRAND":"Mitsubishi","PRODUCT NAME":"Mitsubishi Fuso Super Great Coca-Cola Santa Truck","MODEL NO.":"T64T-TL001-CC","PRICE":285.0,"ORIGPRICE":285.0,"QTY":1,"STATUS":"currentstock","SORTORDER":40,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/T64T-TL001-CC-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/T64T-TL001-CC-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/T64T-TL001-CC-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/T64T-TL001-CC-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"CM Model","CARBRAND":"MV Agusta","PRODUCT NAME":"MV Agusta SV800 whit Show Girl","MODEL NO.":"CM64-SV800-01","PRICE":80.0,"ORIGPRICE":80.0,"QTY":1,"STATUS":"currentstock","SORTORDER":41,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-SV800-01-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-SV800-01-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-SV800-01-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-SV800-01-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Mini GT","CARBRAND":"Nissan","PRODUCT NAME":"Nissan GT-R NISMO GT3 #10 PONOS GAINER GT-R GAINER 2023 SUPER GT SERIES","MODEL NO.":"MGT00860","PRICE":75.0,"ORIGPRICE":75.0,"QTY":1,"STATUS":"currentstock","SORTORDER":42,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00860-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00860-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00860-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00860-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Mini GT","CARBRAND":"Nissan","PRODUCT NAME":"Nissan LB-ER34 Super Silhouette SKYLINE ADVAN Red Black","MODEL NO.":"MGT00843","PRICE":60.0,"ORIGPRICE":60.0,"QTY":2,"STATUS":"currentstock","SORTORDER":43,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00843-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00843-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00843-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00843-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Mini GT","CARBRAND":"Nissan","PRODUCT NAME":"Nissan LB-Super Silhouette S15 SILVIA #555 Team Liberty Walk 2025 Formula Drift Halloween Special","MODEL NO.":"MGT01185","PRICE":55.0,"ORIGPRICE":55.0,"QTY":2,"STATUS":"currentstock","SORTORDER":44,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01185-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01185-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01185-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01185-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Mini GT","CARBRAND":"Nissan","PRODUCT NAME":"Nissan LB-Super Silhouette S15 SILVIA #555 V2 2024 Formula Drift Japan","MODEL NO.":"MGT00823","PRICE":60.0,"ORIGPRICE":60.0,"QTY":1,"STATUS":"currentstock","SORTORDER":45,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00823-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00823-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00823-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00823-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Mini GT","CARBRAND":"Nissan","PRODUCT NAME":"Nissan LB-Super Silhouette Silvia S15 2024 LBWK Fausto Racing","MODEL NO.":"MGT00858","PRICE":60.0,"ORIGPRICE":60.0,"QTY":1,"STATUS":"currentstock","SORTORDER":46,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00858-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00858-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00858-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00858-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"CM Model","CARBRAND":"Nissan","PRODUCT NAME":"Nissan LBWK GT35RR Pink","MODEL NO.":"CM64-35RR-08","PRICE":95.0,"ORIGPRICE":95.0,"QTY":1,"STATUS":"currentstock","SORTORDER":47,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-35RR-08-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-35RR-08-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-35RR-08-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-35RR-08-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Tarmac Works","CARBRAND":"Nissan","PRODUCT NAME":"Nissan NISMO GT-R LM Test Car","MODEL NO.":"T64-067-TC","PRICE":90.0,"ORIGPRICE":90.0,"QTY":1,"STATUS":"currentstock","SORTORDER":48,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/T64-067-TC-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/T64-067-TC-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/T64-067-TC-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/T64-067-TC-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Mini GT","CARBRAND":"Nissan","PRODUCT NAME":"NISSAN Skyline GT-R Dark Metal Gray NISMO BCNR33 CRS Version","MODEL NO.":"MGT01128","PRICE":50.0,"ORIGPRICE":50.0,"QTY":3,"STATUS":"currentstock","SORTORDER":49,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01128-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01128-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01128-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01128-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Mini GT","CARBRAND":"Nissan","PRODUCT NAME":"Nissan Skyline GT-R Dark Metal Gray NISMO BNR34 CRS Ver","MODEL NO.":"MGT01160","PRICE":50.0,"ORIGPRICE":50.0,"QTY":10,"STATUS":"currentstock","SORTORDER":50,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01160-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01160-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01160-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01160-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Mini GT","CARBRAND":"Nissan","PRODUCT NAME":"Nissan Skyline GT-R NISMO BNR32 CRS Version Dark Metal Gray","MODEL NO.":"MGT01024","PRICE":50.0,"ORIGPRICE":50.0,"QTY":1,"STATUS":"currentstock","SORTORDER":51,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01024-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01024-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01024-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01024-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Mini GT","CARBRAND":"Nissan","PRODUCT NAME":"Nissan Skyline Kenmeri Liberty Walk LBWK KUMA","MODEL NO.":"MGT00698","PRICE":55.0,"ORIGPRICE":55.0,"QTY":1,"STATUS":"currentstock","SORTORDER":52,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00698-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00698-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00698-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00698-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Mini GT","CARBRAND":"Nissan","PRODUCT NAME":"Nissan Skyline Kenmeri Liberty Walk White","MODEL NO.":"MGT00702","PRICE":55.0,"ORIGPRICE":55.0,"QTY":3,"STATUS":"currentstock","SORTORDER":53,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00702-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00702-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00702-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00702-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Mini GT","CARBRAND":"Nissan","PRODUCT NAME":"Nissan Skyline Kenmeri Liberty Walk White Blister Packaging","MODEL NO.":"MGT00702","PRICE":60.0,"ORIGPRICE":60.0,"QTY":2,"STATUS":"currentstock","SORTORDER":54,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00702-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00702-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00702-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00702-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"CM Model","CARBRAND":"Pagani","PRODUCT NAME":"Pagani Imola Metallic Emerald Green","MODEL NO.":"CM64-Imola-10","PRICE":85.0,"ORIGPRICE":85.0,"QTY":1,"STATUS":"currentstock","SORTORDER":55,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-Imola-10-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-Imola-10-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-Imola-10-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-Imola-10-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"CM Model","CARBRAND":"Pagani","PRODUCT NAME":"Pagani Zonda Revo Barchetta 1of1","MODEL NO.":"CM64-ZondaB01","PRICE":125.0,"ORIGPRICE":125.0,"QTY":1,"STATUS":"currentstock","SORTORDER":56,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-ZondaB01-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-ZondaB01-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-ZondaB01-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-ZondaB01-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"CM Model","CARBRAND":"Pagani","PRODUCT NAME":"Pagani ZondaF Pearl white","MODEL NO.":"CM64-ZondaF-01","PRICE":95.0,"ORIGPRICE":95.0,"QTY":2,"STATUS":"currentstock","SORTORDER":57,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-ZondaF-01-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-ZondaF-01-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-ZondaF-01-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-ZondaF-01-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Poprace","CARBRAND":"Honda","PRODUCT NAME":"PANDEM CIVIC EG6 KANJOZOKU","MODEL NO.":"PR640163","PRICE":70.0,"ORIGPRICE":70.0,"QTY":1,"STATUS":"currentstock","SORTORDER":58,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640163-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640163-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640163-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640163-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Poprace","CARBRAND":"Toyota","PRODUCT NAME":"PANDEM GR86 CRYSTAL WHITE PEARL Enigma Exclusive","MODEL NO.":"PRE014","PRICE":75.0,"ORIGPRICE":75.0,"QTY":1,"STATUS":"currentstock","SORTORDER":59,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PRE014-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PRE014-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PRE014-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PRE014-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Mini GT","CARBRAND":"Porsche","PRODUCT NAME":"Porsche 911 992 GT3 RS Weissach Package Guards Red","MODEL NO.":"MGT01060","PRICE":80.0,"ORIGPRICE":80.0,"QTY":2,"STATUS":"currentstock","SORTORDER":60,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01060-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01060-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01060-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01060-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Mini GT","CARBRAND":"Porsche","PRODUCT NAME":"Porsche 911 Dakar Rally 1974","MODEL NO.":"MGT01009","PRICE":50.0,"ORIGPRICE":50.0,"QTY":2,"STATUS":"currentstock","SORTORDER":61,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01009-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01009-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01009-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01009-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Mini GT","CARBRAND":"Porsche","PRODUCT NAME":"Porsche 911 Dakar Rally 1974 Blister Packaging","MODEL NO.":"MGT01009","PRICE":60.0,"ORIGPRICE":60.0,"QTY":1,"STATUS":"currentstock","SORTORDER":62,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01009-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01009-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01009-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01009-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Poprace","CARBRAND":"Nissan","PRODUCT NAME":"R33 GT-R DARK CHROME","MODEL NO.":"PRDC003","PRICE":75.0,"ORIGPRICE":75.0,"QTY":1,"STATUS":"currentstock","SORTORDER":63,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PRDC003-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PRDC003-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PRDC003-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PRDC003-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Mini GT","CARBRAND":"Land Rover","PRODUCT NAME":"Range Rover 1971 International Hillrally 1 Winner","MODEL NO.":"MGT00893","PRICE":55.0,"ORIGPRICE":55.0,"QTY":1,"STATUS":"currentstock","SORTORDER":64,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00893-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00893-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00893-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT00893-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Poprace","CARBRAND":"Porsche","PRODUCT NAME":"RWB 930 RWB Truck Set Gold Chrome HEC 2026 Exclusive","MODEL NO.":"PR640477/489","PRICE":330.0,"ORIGPRICE":330.0,"QTY":1,"STATUS":"currentstock","SORTORDER":65,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640477/489-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640477/489-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640477/489-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640477/489-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Tarmac Works","CARBRAND":"Porsche","PRODUCT NAME":"RWB 993 Liberty Walk","MODEL NO.":"T64-TL017BWK2","PRICE":100.0,"ORIGPRICE":100.0,"QTY":7,"STATUS":"currentstock","SORTORDER":66,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/T64-TL017BWK2-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/T64-TL017BWK2-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/T64-TL017BWK2-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/T64-TL017BWK2-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Poprace","CARBRAND":"Ford","PRODUCT NAME":"SHELBY MUSTANG GT500 SILVER CHROME","MODEL NO.":"PR640312","PRICE":70.0,"ORIGPRICE":70.0,"QTY":3,"STATUS":"currentstock","SORTORDER":67,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640312-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640312-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640312-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640312-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Poprace","CARBRAND":"Porsche","PRODUCT NAME":"Singer DLS Turbo Road Gold","MODEL NO.":"PR640132","PRICE":65.0,"ORIGPRICE":65.0,"QTY":2,"STATUS":"currentstock","SORTORDER":68,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640132-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640132-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640132-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640132-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Poprace","CARBRAND":"Nissan","PRODUCT NAME":"SKYLINE GT-R R32 APAxpo 2025","MODEL NO.":"PR640426","PRICE":110.0,"ORIGPRICE":110.0,"QTY":3,"STATUS":"currentstock","SORTORDER":69,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640426-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640426-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640426-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640426-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Poprace","CARBRAND":"Nissan","PRODUCT NAME":"SKYLINE GT-R R33 APAxpo 2025","MODEL NO.":"PR640427","PRICE":110.0,"ORIGPRICE":110.0,"QTY":5,"STATUS":"currentstock","SORTORDER":70,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640427-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640427-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640427-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640427-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Poprace","CARBRAND":"Nissan","PRODUCT NAME":"SKYLINE GT-R V8 Drift HAKOSUKA APAxpo 2025","MODEL NO.":"PR640349","PRICE":90.0,"ORIGPRICE":90.0,"QTY":3,"STATUS":"currentstock","SORTORDER":71,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640349-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640349-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640349-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/PR640349-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Lego","CARBRAND":"Ferrari","PRODUCT NAME":"Speed Champion Ferrari SF-24 F1(R) Race","MODEL NO.":"77242-LEGO","PRICE":140.0,"ORIGPRICE":140.0,"QTY":1,"STATUS":"currentstock","SORTORDER":72,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/77242-LEGO-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/77242-LEGO-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/77242-LEGO-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/77242-LEGO-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"CM Model","CARBRAND":"Subaru","PRODUCT NAME":"Subaru BRZ Varis Widebody White","MODEL NO.":"CM64-BRZ-09","PRICE":70.0,"ORIGPRICE":70.0,"QTY":2,"STATUS":"currentstock","SORTORDER":73,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-BRZ-09-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-BRZ-09-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-BRZ-09-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-BRZ-09-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"CM Model","CARBRAND":"Subaru","PRODUCT NAME":"Subaru WRX STi Varis WideBody 2.0 Chome Black","MODEL NO.":"CM64-WRX-06","PRICE":75.0,"ORIGPRICE":75.0,"QTY":1,"STATUS":"currentstock","SORTORDER":74,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-WRX-06-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-WRX-06-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-WRX-06-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-WRX-06-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"CM Model","CARBRAND":"Subaru","PRODUCT NAME":"SUBARU WRX Varis Widebody 2.0","MODEL NO.":"CM64-WRX-08","PRICE":75.0,"ORIGPRICE":75.0,"QTY":2,"STATUS":"currentstock","SORTORDER":75,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-WRX-08-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-WRX-08-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-WRX-08-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-WRX-08-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Inno64","CARBRAND":"Nissan","PRODUCT NAME":"TOP SECRET GT-R R35 IAM Bangkok 2025 Event Edition","MODEL NO.":"IN6435TS-IAMBK25","PRICE":140.0,"ORIGPRICE":140.0,"QTY":1,"STATUS":"currentstock","SORTORDER":76,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/IN6435TS-IAMBK25-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/IN6435TS-IAMBK25-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/IN6435TS-IAMBK25-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/IN6435TS-IAMBK25-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Hobby Japan","CARBRAND":"Toyota","PRODUCT NAME":"Toyota Chaser 1997 JTCC Test car","MODEL NO.":"HJR641072A","PRICE":95.0,"ORIGPRICE":95.0,"QTY":1,"STATUS":"currentstock","SORTORDER":77,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/HJR641072A-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/HJR641072A-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/HJR641072A-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/HJR641072A-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"CM Model","CARBRAND":"Toyota","PRODUCT NAME":"Toyota Sequoia Orange","MODEL NO.":"CM64-Sequoia-03","PRICE":80.0,"ORIGPRICE":80.0,"QTY":1,"STATUS":"currentstock","SORTORDER":78,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-Sequoia-03-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-Sequoia-03-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-Sequoia-03-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/CM64-Sequoia-03-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Mini GT","CARBRAND":"Toyota","PRODUCT NAME":"Toyota Supra A80 Top Secret GT-300 Top Secret Purple","MODEL NO.":"MGT01067","PRICE":50.0,"ORIGPRICE":50.0,"QTY":1,"STATUS":"currentstock","SORTORDER":79,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01067-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01067-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01067-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/MGT01067-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""},{"BRAND":"Tarmac Works","CARBRAND":"Toyota","PRODUCT NAME":"Vertex Ridge TE3006 Soarer Chrome Red","MODEL NO.":"T64G-080-TE3006","PRICE":95.0,"ORIGPRICE":95.0,"QTY":1,"STATUS":"currentstock","SORTORDER":80,"IMG1":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/T64G-080-TE3006-01.jpg","IMG2":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/T64G-080-TE3006-02.jpg","IMG3":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/T64G-080-TE3006-03.jpg","IMG4":"https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/T64G-080-TE3006-04.jpg","IMG1POS":"center","IMG2POS":"center","IMG1ZOOM":100,"IMG2ZOOM":100,"REF IMG":""}];

var WASVG = '<svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.116 1.528 5.845L0 24l6.34-1.51A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.817 9.817 0 01-5.007-1.37l-.36-.214-3.727.888.929-3.633-.235-.373A9.787 9.787 0 012.182 12C2.182 6.582 6.582 2.182 12 2.182S21.818 6.582 21.818 12 17.418 21.818 12 21.818z"/></svg>';

function brandSlug(value){
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function imageModelKey(value){
  return String(value || '')
    .trim()
    .replace(/[\\/]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^A-Za-z0-9._-]/g, '-');
}

function imageUrlForModel(model, index){
  var key = imageModelKey(model);
  if(!key) return '';
  return IMAGE_BASE_URL + key + '-0' + index + '.jpg';
}

function applyPageBrandMeta(){
  var exactBrand = '';
  if(PAGE_BRAND_SLUG && Array.isArray(PRODUCTS) && PRODUCTS.length){
    PRODUCTS.some(function(p){
      if(brandSlug(p.brand) === PAGE_BRAND_SLUG){ exactBrand = p.brand; return true; }
      return false;
    });
  }
  if(exactBrand) PAGE_BRAND = exactBrand;

  var title = document.querySelector('.listing-title');
  var metaTitle = '64CAST : Diecast model UAE';

  if(PAGE_BRAND_SLUG){
    if(title) title.textContent = PAGE_BRAND;
    metaTitle = PAGE_BRAND.toUpperCase() + ' | 64CAST';
  }else if(PAGE_PRE_ORDERS){
    if(title) title.textContent = 'PRE-ORDER';
    metaTitle = 'PRE-ORDER | 64CAST';
  }else if(PAGE_NEW_ARRIVALS){
    if(title) title.textContent = 'New Arrivals';
    metaTitle = 'New Arrivals | 64CAST';
  }else{
    if(title) title.textContent = 'CURRENT STOCKS';
  }

  document.title = metaTitle;
  var ogTitle = document.querySelector('meta[property="og:title"]');
  if(ogTitle) ogTitle.setAttribute('content', metaTitle);
  var twTitle = document.querySelector('meta[name="twitter:title"]');
  if(twTitle) twTitle.setAttribute('content', metaTitle);
}

function currentPagePath(){
  if(PAGE_PRE_ORDERS) return PAGE_BRAND_SLUG ? '/pre-order/' + PAGE_BRAND_SLUG : '/pre-order';
  if(PAGE_NEW_ARRIVALS) return PAGE_BRAND_SLUG ? '/new-arrivals/' + PAGE_BRAND_SLUG : '/new-arrivals';
  return PAGE_BRAND_SLUG ? '/current-stock/' + PAGE_BRAND_SLUG : '/';
}

function normalize(row){
  return {
    name: (row['PRODUCT NAME']||'').toString(),
    brand: (row['BRAND']||'').toString(),
    carbrand: (row['CARBRAND']||'').toString(),
    model: (row['MODEL NO.']||'').toString(),
    price: parseFloat(row['PRICE'])||0,
    origPrice: parseFloat(row['ORIGPRICE'])||parseFloat(row['PRICE'])||0,
    qty: parseInt(row['QTY'])||0,
    tag: (function(v){ v=(v||'currentstock').toString().toLowerCase().replace(/[\s_-]+/g,''); return (v==='currentstock'||v==='ready'||v==='instock'||v==='available')?'currentstock':v; })(row['STATUS']||'currentstock'),
    eta: (row['ETA']||row['eta']||row['ETA MONTH']||row['ETAMONTH']||'').toString(),
    imgs: pickProductImages(row),
    img1Pos: (row['IMG1POS']||'center').toString(),
    img2Pos: (row['IMG2POS']||'center').toString(),
    img1Zoom: parseInt(row['IMG1ZOOM'])||100,
    img2Zoom: parseInt(row['IMG2ZOOM'])||100,
    imageScale: parseInt(row['IMAGE_SCALE']||row['IMGSCALE']||row['IMG SCALE']||row['IMAGE SCALE'])||100,
    refImg: row['REF IMG']||'',
    sortOrder: parseFloat(row['SORTORDER'] || row['SORT ORDER'] || row['ORDER'] || row['DISPLAY ORDER']) || 0,
    newArrival: (function(v){ v=String(v||'').toLowerCase(); return v==='yes'||v==='true'||v==='1'||v==='new'; })(row['NEW']||row['NEWARRIVAL']||row['NEW ARRIVAL']),
    featured: (function(v){ v=String(v||'').toLowerCase(); return v==='yes'||v==='true'||v==='1'; })(row['FEATURED']),
    description: (row['DESCRIPTION']||row['description']||'').toString()
  };
}

function denormalize(p){
  return {
    'REF IMG': p.refImg||'',
    'BRAND': p.brand,
    'CARBRAND': p.carbrand||'',
    'PRODUCT NAME': p.name,
    'MODEL NO.': p.model,
    'PRICE': p.price,
    'ORIGPRICE': p.origPrice,
    'QTY': p.qty,
    'STATUS': p.tag,
    'ETA': p.eta || '',
    'SORTORDER': p.sortOrder || 0,
    'IMG1': p.imgs[0]||'',
    'IMG2': p.imgs[1]||'',
    'IMG3': p.imgs[2]||'',
    'IMG4': p.imgs[3]||'',
    'IMG1POS': p.img1Pos||'center',
    'IMG2POS': p.img2Pos||'center',
    'IMG1ZOOM': p.img1Zoom||100,
    'IMG2ZOOM': p.img2Zoom||100,
    'IMAGE_SCALE': p.imageScale||100,
    'NEW': p.newArrival ? 'yes' : '',
    'FEATURED': p.featured ? 'yes' : '',
    'DESCRIPTION': p.description||''
  };
}

function pickProductImages(row){
  row = row || {};
  var arr = [];
  if(Array.isArray(row.imgs)) arr = row.imgs.slice(0,4);
  else if(Array.isArray(row.IMGS)) arr = row.IMGS.slice(0,4);

  function val(){
    for(var i=0;i<arguments.length;i++){
      var v = arguments[i];
      if(v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim();
    }
    return '';
  }

  var model = val(row['MODEL NO.'], row['MODEL NO'], row['Model No.'], row['Model No'], row.modelNo, row.model, row.MODEL);
  for(var i=0;i<4;i++){
    arr[i] = val(
      arr[i],
      row['IMG' + (i+1)],
      row['img' + (i+1)],
      row['IMAGE' + (i+1)],
      row['image' + (i+1)],
      row['IMAGE URL ' + (i+1)],
      row['Image URL ' + (i+1)],
      row['Image ' + (i+1) + ' URL'],
      row['IMAGE ' + (i+1) + ' URL'],
      row['Image URL' + (i+1)],
      row['IMAGE URL' + (i+1)],
      row['imageUrl' + (i+1)],
      row['image_url_' + (i+1)]
    );
    // If no URL is imported, automatically use the R2 image pattern.
    // Uploading MODEL-01.jpg, MODEL-02.jpg etc. to /PI/ will make it appear without editing the CSV again.
    if(!arr[i] && model) arr[i] = imageUrlForModel(model, i+1);
  }
  return [arr[0]||'', arr[1]||'', arr[2]||'', arr[3]||''];
}

function finaliseProducts(list){
  list.forEach(function(p,i){ if(!p.sortOrder || isNaN(p.sortOrder)) p.sortOrder = 100000 + i; });
  list.sort(function(a,b){
    var ao = Number(a.sortOrder)||999999;
    var bo = Number(b.sortOrder)||999999;
    if(ao !== bo) return ao - bo;
    return (a.name||'').localeCompare(b.name||'');
  });
  return list;
}

function showSync(on){ document.getElementById('syncBanner').classList.toggle('show', !!on); }
function showError(on){ var b=document.getElementById('errorBanner'); if(b) b.classList.toggle('show', !!on); }

function getAdminToken(){ try{ return sessionStorage.getItem(ADMIN_TOKEN_KEY)||''; }catch(e){ return ''; } }
function setAdminToken(t){ try{ sessionStorage.setItem(ADMIN_TOKEN_KEY, t||''); }catch(e){} }
function clearAdminToken(){ try{ sessionStorage.removeItem(ADMIN_TOKEN_KEY); }catch(e){} }

function handleAdminAuthFailure(){
  clearAdminToken();
  alert('Your admin session expired. Please log in again.');
  window.location.href = window.location.pathname + '?' + ADMIN_KEY;
}

function adminApiRequest(action, payload, cb, errCb){
  var body = Object.assign({action:action}, payload||{});
  var headers = {'Content-Type':'application/json;charset=utf-8'};
  var token = getAdminToken();
  if(token) headers.Authorization = 'Bearer ' + token;
  fetch(API_URL, {method:'POST', headers:headers, body:JSON.stringify(body)})
  .then(function(r){
    if(r.status===401 || r.status===403) throw {auth:true, status:r.status};
    return r.json().catch(function(){ return {}; }).then(function(json){
      if(!r.ok || json.ok===false) throw {status:r.status, json:json};
      return json;
    });
  })
  .then(function(res){ if(cb) cb(res); })
  .catch(function(err){
    console.error('Admin API error', err);
    if(err && err.auth){ handleAdminAuthFailure(); return; }
    if(errCb) errCb(err);
    else alert('Admin request failed. Check the API / Worker configuration and try again.');
    if(cb) cb(null);
  });
}

function adminLogin(password, cb){
  var headers = {'Content-Type':'application/json;charset=utf-8'};
  fetch(API_URL, {method:'POST', headers:headers, body:JSON.stringify({action:'admin-login', password:password})})
  .then(function(r){ return r.json().then(function(json){ return {status:r.status, json:json}; }); })
  .then(function(res){
    if(res.json && res.json.token){ setAdminToken(res.json.token); cb(true); }
    else { cb(false); }
  })
  .catch(function(){ cb(false); });
}

function verifyAdminSession(cb){
  if(!getAdminToken()){ cb(false); return; }
  adminApiRequest('admin-verify', {}, function(res){ cb(!!(res && res.ok)); }, function(){ cb(false); });
}

var CACHE_KEY = '64cast_products_cache';
var CACHE_TTL = 30000;

function rowsToProducts(rows){
  rows = Array.isArray(rows) ? rows : [];
  return finaliseProducts(rows.filter(function(r){ return r['MODEL NO.'] && r['MODEL NO.'].toString().trim()!==''; }).map(normalize));
}

function useEmbeddedProducts(){
  PRODUCTS = rowsToProducts(EMBEDDED_NEW_PRODUCT_LIST || []);
  window.PRODUCTS = PRODUCTS;
}

function fetchJsonArray(url){
  return fetch(url, {method:'GET', cache:'no-store'})
    .then(function(r){
      var ct = (r.headers && r.headers.get('content-type')) || '';
      return r.text().then(function(text){
        if(!r.ok) throw new Error('API GET '+r.status+' from '+url);
        if(ct.indexOf('application/json') === -1 && text.trim().charAt(0) !== '[') throw new Error('API returned non-JSON from '+url);
        var rows = JSON.parse(text);
        if(!Array.isArray(rows)) throw new Error('API did not return a product array from '+url);
        return rows;
      });
    });
}

function fetchProducts(cb){
  var cached = null;
  try{
    var raw = sessionStorage.getItem(CACHE_KEY);
    if(raw){
      var parsed = JSON.parse(raw);
      if(Date.now() - parsed.t < CACHE_TTL) cached = parsed.rows;
    }
  }catch(e){}

  if(cached){
    PRODUCTS = rowsToProducts(cached);
    window.PRODUCTS = PRODUCTS;
    showError(false);
    if(cb) cb();
    return;
  }

  showSync(true);
  var urls = [API_URL];
  if(API_FALLBACK_URL && API_FALLBACK_URL !== API_URL) urls.push(API_FALLBACK_URL);

  urls.reduce(function(chain, url){
    return chain.catch(function(){ return fetchJsonArray(url); });
  }, Promise.reject())
    .then(function(rows){
      try{ sessionStorage.setItem(CACHE_KEY, JSON.stringify({t:Date.now(), rows:rows})); }catch(e){}
      PRODUCTS = rowsToProducts(rows);
      window.PRODUCTS = PRODUCTS;
      showSync(false);
      showError(false);
      if(cb) cb();
    })
    .catch(function(err){
      console.error('Fetch error', err);
      useEmbeddedProducts();
      showSync(false);
      showError(true);
      var eb=document.getElementById('errorBanner');
      if(eb) eb.textContent='Live stock could not load — showing built-in backup catalogue.';
      if(cb) cb();
    });
}

function pushUpdate(product, cb){
  showSync(true);
  adminApiRequest('update', {product: denormalize(product)}, function(res){
    showSync(false); if(cb) cb(res);
  }, function(){
    showSync(false);
    alert('Could not save. Check your admin session and try again.');
    if(cb) cb(null);
  });
}

function pushDelete(modelNo, cb){
  showSync(true);
  adminApiRequest('delete', {modelNo: modelNo}, function(res){
    showSync(false); if(cb) cb(res);
  }, function(){
    showSync(false);
    alert('Could not delete. Check your admin session and try again.');
    if(cb) cb(null);
  });
}

function ph(n){
  var c=encodeURIComponent((n||'??').slice(0,2).toUpperCase());
  return "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><rect fill='%23f5f5f3' width='300' height='300'/><text x='50%25' y='50%25' text-anchor='middle' dy='.35em' font-size='34' fill='%23d0cfc8' font-family='Georgia,serif'>"+c+"</text></svg>";
}
window.ph = ph;

function getCardImageIndex(img){
  var m = String(img.className || '').match(/pcard-img-(\d+)/);
  return m ? parseInt(m[1], 10) : 1;
}

function refreshCardImageState(imgBox){
  if(!imgBox) return;
  var imgs = Array.prototype.slice.call(imgBox.querySelectorAll('img'));
  imgBox.dataset.imgCount = String(imgs.length);
  if(!imgs.length) return;
  var activeIdx = parseInt(imgBox.dataset.activeIdx, 10);
  var validIdxs = imgs.map(getCardImageIndex);
  if(validIdxs.indexOf(activeIdx) === -1){
    activeIdx = validIdxs[0];
    imgBox.dataset.activeIdx = String(activeIdx);
  }
  var isSold = !!imgBox.closest('.pcard.sold');
  imgs.forEach(function(img){
    var idx = getCardImageIndex(img);
    var visible = idx === activeIdx;
    img.style.setProperty('opacity', visible ? (isSold ? '.5' : '1') : '0', 'important');
  });
  imgBox.classList.toggle('show-img-2', activeIdx === 2);
}

function handleCardImageError(img){
  if(!img) return;
  img.onerror = null;
  var imgBox = img.closest ? img.closest('.pcard-img') : null;
  var wasVisible = !img.style.opacity || img.style.opacity !== '0';
  img.remove();
  if(imgBox){
    if(wasVisible || !imgBox.querySelector('img[style*="opacity: 1"]')){
      var first = imgBox.querySelector('img');
      if(first) imgBox.dataset.activeIdx = String(getCardImageIndex(first));
    }
    refreshCardImageState(imgBox);
  }
}
window.handleCardImageError = handleCardImageError;

function handleCardImageLoad(img){
  if(!img) return;
  img.classList.remove('blur-load');
  refreshCardImageState(img.closest ? img.closest('.pcard-img') : null);
  scheduleOpticalImageFit(img);
}
window.handleCardImageLoad = handleCardImageLoad;

var opticalFitCache = {};
function clampNum(v,min,max){ return Math.max(min, Math.min(max, v)); }
function scheduleOpticalImageFit(img){
  if(!img || !img.src) return;
  if(!img.closest || !img.closest('.product-grid')) return;
  window.requestAnimationFrame(function(){ applyOpticalImageFit(img); });
}
function applyOpticalImageFit(img){
  if(!img || !img.complete || !img.naturalWidth || !img.naturalHeight) return;
  var url = img.currentSrc || img.src;
  if(opticalFitCache[url]){
    setOpticalVars(img, opticalFitCache[url]);
    return;
  }
  var fit = {scale:1, x:0, y:0};
  try{
    var maxSide = 140;
    var iw = img.naturalWidth, ih = img.naturalHeight;
    var ratio = Math.min(maxSide/iw, maxSide/ih, 1);
    var cw = Math.max(1, Math.round(iw*ratio));
    var ch = Math.max(1, Math.round(ih*ratio));
    var canvas = document.createElement('canvas');
    canvas.width = cw; canvas.height = ch;
    var ctx = canvas.getContext('2d', {willReadFrequently:true});
    ctx.drawImage(img, 0, 0, cw, ch);
    var data = ctx.getImageData(0,0,cw,ch).data;
    function px(x,y){ var i=(y*cw+x)*4; return [data[i],data[i+1],data[i+2],data[i+3]]; }
    var samples=[];
    var n = Math.max(2, Math.round(Math.min(cw,ch)*0.06));
    for(var yy=0; yy<n; yy++){
      for(var xx=0; xx<n; xx++){
        samples.push(px(xx,yy), px(cw-1-xx,yy), px(xx,ch-1-yy), px(cw-1-xx,ch-1-yy));
      }
    }
    var bg=[0,0,0,0];
    samples.forEach(function(p){ bg[0]+=p[0]; bg[1]+=p[1]; bg[2]+=p[2]; bg[3]+=p[3]; });
    bg = bg.map(function(v){ return v/samples.length; });
    var minX=cw, minY=ch, maxX=-1, maxY=-1, count=0;
    var threshold = 34;
    for(var y=0; y<ch; y++){
      for(var x=0; x<cw; x++){
        var p=px(x,y);
        if(p[3] < 20) continue;
        var dr=p[0]-bg[0], dg=p[1]-bg[1], db=p[2]-bg[2];
        var dist=Math.sqrt(dr*dr+dg*dg+db*db);
        var isShadow = (p[0] < bg[0]-18 && p[1] < bg[1]-18 && p[2] < bg[2]-18);
        if(dist > threshold || isShadow){
          minX=Math.min(minX,x); minY=Math.min(minY,y); maxX=Math.max(maxX,x); maxY=Math.max(maxY,y); count++;
        }
      }
    }
    var total = cw*ch;
    if(count > total*0.012 && maxX > minX && maxY > minY){
      var bw=(maxX-minX+1)/cw;
      var bh=(maxY-minY+1)/ch;
      var cx=((minX+maxX+1)/2)/cw;
      var cy=((minY+maxY+1)/2)/ch;
      var target = 0.92;
      var rawScale = Math.min(target / Math.max(bw,0.01), target / Math.max(bh,0.01));
      // Two-column mobile grid targets 90-92% visible product fill while keeping safety margin.
      fit.scale = clampNum(rawScale, 1, 1.55);
      fit.x = clampNum((0.5 - cx) * 100, -12, 12);
      fit.y = clampNum((0.5 - cy) * 100, -12, 12);
      // If the detected object already fills most of the frame, preserve the full image.
      if(bw > 0.94 || bh > 0.94){ fit.scale = 1; fit.x = 0; fit.y = 0; }
    }
  }catch(e){
    fit = {scale:1, x:0, y:0};
  }
  opticalFitCache[url] = fit;
  setOpticalVars(img, fit);
}
function setOpticalVars(img, fit){
  img.style.setProperty('--optical-scale', String(fit.scale || 1));
  img.style.setProperty('--optical-x', (fit.x || 0) + '%');
  img.style.setProperty('--optical-y', (fit.y || 0) + '%');
}
window.applyOpticalImageFit = applyOpticalImageFit;

function qtyInfo(q){
  if(q===0) return {cls:'out',text:'Sold out'};
  if(q===1) return {cls:'low',text:'Only 1 left'};
  if(q<=3) return {cls:'low',text:'Only '+q+' left'};
  return {cls:'',text:q+' available'};
}
function disc(p){ return p.origPrice>p.price ? Math.round((1-p.price/p.origPrice)*100) : 0; }
function isSoldOut(p){ var t=String((p&&p.tag)||'').toLowerCase().replace(/[\s_-]+/g,''); return Number(p&&p.qty)===0 || t==='sold' || t==='soldout' || t==='outofstock'; }

function buildFilterTabs(){
  applyPageBrandMeta();

  // Always show every available brand in the filter drawer, even on a brand page.
  // Brand chips act as navigation: / = all products, /mini-gt = Mini GT, /poprace = PopRace, etc.
  var brands = [];
  var seen = {};
  PRODUCTS.forEach(function(p){
    var raw = (p.brand||'').trim();
    if(!raw) return;
    var key = raw.toLowerCase();
    if(!seen[key]){ seen[key] = raw; brands.push(raw); }
  });
  brands.sort(function(a,b){ return a.toLowerCase().localeCompare(b.toLowerCase()); });
  var html = '<button class="filter-drawer-opt '+(!PAGE_BRAND_SLUG ? 'active' : '')+'" data-brand="All">All Brands</button>';
  brands.forEach(function(b){
    var slug = brandSlug(b);
    html += '<button class="filter-drawer-opt '+(slug === PAGE_BRAND_SLUG ? 'active' : '')+'" data-brand="'+b+'">'+b+'</button>';
  });
  var brandWrap = document.getElementById('filterDrawerOptions');
  if(brandWrap) brandWrap.innerHTML = html;
  var brandTitle = document.querySelector('.filter-brand-title');
  if(brandTitle){ brandTitle.style.display = ''; brandTitle.classList.add('open'); }
  if(brandWrap){ brandWrap.style.display = ''; brandWrap.classList.add('open'); }

  var sourceProducts = PRODUCTS.filter(function(p){ return !PAGE_BRAND || brandSlug(p.brand) === PAGE_BRAND_SLUG; });

  var carBrands = [];
  var seenCar = {};
  sourceProducts.forEach(function(p){
    var raw = (p.carbrand||'').trim();
    if(!raw) return;
    var key = raw.toLowerCase();
    if(!seenCar[key]){ seenCar[key] = raw; carBrands.push(raw); }
  });
  carBrands.sort(function(a,b){ return a.toLowerCase().localeCompare(b.toLowerCase()); });
  var carBrandTitle = document.getElementById('carBrandTitle');
  var carBrandWrap = document.getElementById('carBrandDrawerOptions');
  if(carBrands.length){
    var carHtml = '<button class="filter-drawer-opt active" data-carbrand="All">All Car Brands</button>';
    carBrands.forEach(function(b){ carHtml += '<button class="filter-drawer-opt" data-carbrand="'+b+'">'+b+'</button>'; });
    carBrandWrap.innerHTML = carHtml;
    if(carBrandTitle) carBrandTitle.style.display = '';
    carBrandWrap.style.display = '';
  } else {
    if(carBrandTitle) carBrandTitle.style.display = 'none';
    carBrandWrap.style.display = 'none';
  }

  document.querySelectorAll('[data-brand]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var selectedBrand = this.dataset.brand || 'All';
      closeFilterDrawer();
      if(selectedBrand === 'All'){
        var allPath = PAGE_PRE_ORDERS ? '/pre-order' : (PAGE_NEW_ARRIVALS ? '/new-arrivals' : '/');
        if(window.location.pathname !== allPath) window.location.href = allPath;
        else { activeBrand = 'All'; updateActiveFilterUI(); renderGrid(); }
        return;
      }
      var slug = brandSlug(selectedBrand);
      if(slug && slug !== PAGE_BRAND_SLUG){
        window.location.href = PAGE_PRE_ORDERS ? ('/pre-order/' + slug) : (PAGE_NEW_ARRIVALS ? ('/new-arrivals/' + slug) : ('/current-stock/' + slug));
        return;
      }
      activeBrand = selectedBrand;
      document.querySelectorAll('[data-brand]').forEach(function(b){b.classList.remove('active');});
      this.classList.add('active');
      updateActiveFilterUI();
      renderGrid();
    });
  });

  document.querySelectorAll('[data-carbrand]').forEach(function(btn){
    btn.addEventListener('click', function(){
      activeCarBrand = this.dataset.carbrand;
      document.querySelectorAll('[data-carbrand]').forEach(function(b){b.classList.remove('active');});
      this.classList.add('active');
      updateActiveFilterUI();
      renderGrid();
      closeFilterDrawer();
    });
  });

  document.querySelectorAll('[data-sort]').forEach(function(btn){
    btn.addEventListener('click', function(){
      activeSort = this.dataset.sort || 'featured';
      document.querySelectorAll('[data-sort]').forEach(function(b){b.classList.remove('active');});
      this.classList.add('active');
      updateActiveFilterUI();
      renderGrid();
      closeFilterDrawer();
    });
  });

  document.querySelectorAll('.filter-section-toggle').forEach(function(title){
    if(title.dataset.toggleBound) return;
    title.dataset.toggleBound = '1';
    title.addEventListener('click', function(){
      var target = document.getElementById(this.dataset.target);
      if(!target) return;
      var nowOpen = !target.classList.contains('open');
      target.classList.toggle('open', nowOpen);
      this.classList.toggle('open', nowOpen);
    });
  });
}

function renderBrandNavigationLinks(){
  // Brand links have been removed from the menu drawer.
  // Brands remain available inside the Filter drawer on every page.
}

function updateActiveFilterUI(){
  var label = document.getElementById('activeBrandLabel');
  var btn = document.getElementById('openFiltersBtn');
  var activeLabels = [];

  if(activeBrand !== 'All') activeLabels.push(activeBrand);
  if(activeCarBrand !== 'All') activeLabels.push(activeCarBrand);
  if(activeSort === 'price-asc') activeLabels.push('Price: Low to High');
  if(activeSort === 'price-desc') activeLabels.push('Price: High to Low');

  var countEl = document.getElementById('filterCountNum');
  if(countEl) countEl.textContent = '('+activeLabels.length+')';

  if(!activeLabels.length){
    label.textContent = '';
    btn.classList.remove('has-active');
  } else {
    label.textContent = activeLabels.join(' · ');
    btn.classList.add('has-active');
  }
}

function openFilterDrawer(){
  document.getElementById('filterDrawer').classList.add('open');
  document.getElementById('filterDrawerOverlay').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeFilterDrawer(){
  document.getElementById('filterDrawer').classList.remove('open');
  document.getElementById('filterDrawerOverlay').classList.remove('open');
  document.body.style.overflow='';
}
function clearAllFilters(){
  activeBrand = PAGE_BRAND || 'All';
  activeCarBrand = 'All';
  activeSort = 'featured';
  document.querySelectorAll('[data-brand]').forEach(function(b){
    var isActive = !PAGE_BRAND_SLUG ? b.dataset.brand==='All' : brandSlug(b.dataset.brand)===PAGE_BRAND_SLUG;
    b.classList.toggle('active', isActive);
  });
  document.querySelectorAll('[data-carbrand]').forEach(function(b){ b.classList.toggle('active', b.dataset.carbrand==='All'); });
  document.querySelectorAll('[data-sort]').forEach(function(b){ b.classList.toggle('active', b.dataset.sort==='featured'); });
  updateActiveFilterUI();
  renderGrid();
  closeFilterDrawer();
}

function openMenuPanel(){
  document.getElementById('menuPanel').classList.add('open');
  document.getElementById('menuOverlay').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeMenuPanel(){
  document.getElementById('menuPanel').classList.remove('open');
  document.getElementById('menuOverlay').classList.remove('open');
  document.body.style.overflow='';
}

function getFiltered(){
  var q = ((document.getElementById('search-inp-drawer') && document.getElementById('search-inp-drawer').value) || (document.getElementById('search-inp-desktop') && document.getElementById('search-inp-desktop').value) || '').toLowerCase();
  var pathParts = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase().split('/').filter(Boolean);
  var firstPart = pathParts[0] || '';
  var isExplicitCurrentRoute = firstPart === 'current-stock' || firstPart === 'current-stocks';
  var isExplicitPreRoute = firstPart === 'pre-order' || firstPart === 'pre-orders' || firstPart === 'preorders';
  var isRootBrandRoute = !!PAGE_BRAND_SLUG && !isExplicitCurrentRoute && !isExplicitPreRoute && !PAGE_NEW_ARRIVALS;

  var list = PRODUCTS.filter(function(p){
    var pageBrandMatch = !PAGE_BRAND_SLUG || brandSlug(p.brand) === PAGE_BRAND_SLUG;
    var bm = activeBrand==='All' || p.brand===activeBrand;
    var cbm = activeCarBrand==='All' || p.carbrand===activeCarBrand;
    var sm = !q || p.name.toLowerCase().indexOf(q)>=0 || p.brand.toLowerCase().indexOf(q)>=0 || p.model.toLowerCase().indexOf(q)>=0;
    var status = String(p.tag || '').toLowerCase().replace(/[\s_-]+/g,'');
    var isPre = status === 'preorder' || status === 'preorders';
    var isSold = Number(p.qty) === 0 || status === 'sold' || status === 'soldout' || status === 'outofstock';
    var routeStatusMatch = true;

    if(PAGE_NEW_ARRIVALS){
      routeStatusMatch = true;
    }else if(isExplicitPreRoute || PAGE_PRE_ORDERS){
      routeStatusMatch = isPre;
    }else if(isExplicitCurrentRoute){
      routeStatusMatch = !isPre;
    }else if(isRootBrandRoute){
      if(activeStatusFilter === 'preorder') routeStatusMatch = isPre;
      else if(activeStatusFilter === 'currentstock' || activeStatusFilter === 'currentstock') routeStatusMatch = !isPre;
      else routeStatusMatch = true;
    }else{
      if(homeStatusFilter === 'preorder') routeStatusMatch = isPre;
      else if(homeStatusFilter === 'all') routeStatusMatch = true;
      else routeStatusMatch = !isPre;
    }
    return pageBrandMatch && bm && cbm && sm && routeStatusMatch;
  });

  var cmp;
  if(activeSort === 'price-asc'){
    cmp = function(a,b){ return (Number(a.price)||0) - (Number(b.price)||0); };
  } else if(activeSort === 'price-desc'){
    cmp = function(a,b){ return (Number(b.price)||0) - (Number(a.price)||0); };
  } else {
    cmp = function(a,b){
      var ao = Number(a.sortOrder)||0;
      var bo = Number(b.sortOrder)||0;
      if(ao || bo){
        if(!ao) ao = 999999;
        if(!bo) bo = 999999;
        if(ao !== bo) return ao - bo;
      }
      var ac = String(a.carbrand || '').toLowerCase();
      var bc = String(b.carbrand || '').toLowerCase();
      if(ac !== bc) return ac.localeCompare(bc);
      var ab = String(a.brand || '').toLowerCase();
      var bb = String(b.brand || '').toLowerCase();
      if(ab !== bb) return ab.localeCompare(bb);
      return String(a.name || '').toLowerCase().localeCompare(String(b.name || '').toLowerCase());
    };
  }
  list = list.slice().sort(function(a,b){
    var aSold = isSoldOut(a) ? 1 : 0;
    var bSold = isSoldOut(b) ? 1 : 0;
    if(aSold !== bSold) return aSold - bSold;
    return cmp(a,b);
  });
  return list;
}

function renderGrid(){
  visibleCount = window.__64CAST_PAGE_SIZE; // any filter/search/brand change resets back to the first page
  var grid = document.getElementById('product-grid');
  grid.style.transition = 'opacity .2s ease';
  grid.style.opacity = '0.35';
  setTimeout(function(){ renderGridInner(grid); grid.style.opacity = '1'; }, 120);
}

function loadMoreProducts(){
  visibleCount += window.__64CAST_PAGE_SIZE;
  renderGridInner(document.getElementById('product-grid'));
}


function totalVisibleQty(list){
  return (list || []).reduce(function(total,p){ return total + (Number(p.qty) || 0); }, 0);
}
function updateListingCount(list){
  var countEl = document.getElementById('filter-count');
  if(!countEl) return;
  var qty = totalVisibleQty(list);
  countEl.textContent = '(' + qty + ')';
}

function renderGridInner(grid){
  var filtered = getFiltered();
  var visible = filtered.slice(0, visibleCount);
  updateListingCount(filtered);
  var loadMoreWrap = document.getElementById('loadMoreWrap');
  if(!filtered.length){
    grid.innerHTML='<div class="grid-empty">No models found</div>';
    if(loadMoreWrap) loadMoreWrap.style.display='none';
    return;
  }
  grid.innerHTML = visible.map(function(p){
    var sold = p.qty===0 || p.tag==='sold';
    var qi = qtyInfo(p.qty);
    var d = disc(p);
    var img = p.imgs[0] || ph(p.name);
    var pos1 = p.img1Pos || 'center';
    var pos2 = p.img2Pos || 'center';
    var zoom1 = (p.img1Zoom||100)/100;
    var zoom2 = (p.img2Zoom||100)/100;
    var imageScale = Math.max(0.7, Math.min(1.3, (parseFloat(p.imageScale)||100)/100));
    var finalScale1 = +(zoom1 * imageScale).toFixed(3);
    var finalScale2 = +(zoom2 * imageScale).toFixed(3);
    var extraImgsHtml = '';
    var extraCount = 0;
    for(var gi=1; gi<4; gi++){
      var src = p.imgs[gi];
      if(!src) continue;
      extraCount++;
      var idx = gi+1; // pcard-img-2/3/4
      var pos = idx===2 ? pos2 : 'center';
      var zoom = idx===2 ? zoom2 : 1;
      var finalScale = +((zoom * imageScale).toFixed(3));
      extraImgsHtml += '<img class="pcard-img-'+idx+' blur-load" src="'+src+'" alt="'+p.name+'" loading="lazy" style="object-position:'+pos+';--zoom:'+zoom+';--img-scale:'+imageScale+';--final-scale:'+finalScale+'" onerror="handleCardImageError(this)" onload="handleCardImageLoad(this)">';
    }
    var isPreorder = String(p.tag||'').toLowerCase().replace(/[\s_-]+/g,'') === 'preorder';
    return '<div class="pcard'+(sold?' sold':'')+'" data-preview="'+p.model+'" data-model="'+p.model+'">'
      +'<div class="pcard-img" data-img-count="'+(1+extraCount)+'" data-active-idx="1"><img class="pcard-img-1 blur-load" src="'+img+'" alt="'+p.name+'" loading="lazy" style="object-position:'+pos1+';--zoom:'+zoom1+';--img-scale:'+imageScale+';--final-scale:'+finalScale1+'" onerror="handleCardImageError(this)" onload="handleCardImageLoad(this)">'
        +extraImgsHtml
        +'<div class="sold-overlay'+(sold?' show':'')+'"><div class="sold-label">Sold Out</div></div>'
        +(isPreorder ? '<div class="preorder-overlay show"><div class="preorder-label">Pre-Order</div></div>' : '')
        +(!sold && !isPreorder && qi.cls==='low' ? '<div class="low-stock-badge"><div class="low-stock-label">'+qi.text.replace(/^Only /,'')+'</div></div>' : '')
        +'<button class="card-cart-btn"'+(sold?' disabled':'')+' data-add="'+p.model+'" title="Add to cart"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 8h11l1 11.5a2 2 0 0 1-2 2.1H7.5a2 2 0 0 1-2-2.1L6.5 8z"/><path d="M9 10V6.5a3 3 0 0 1 6 0V10"/></svg></button>'
      +'</div>'
      +'<div class="pcard-body"><div class="pcard-body-inner">'
        +'<div class="pcard-brand">'+p.brand+'</div>'
        +'<div class="pcard-name-row"><div class="pcard-name">'+p.name+'</div></div>'
        +'<div class="pcard-price-row"><span style="font-size:.92rem;font-weight:700">AED</span><span class="price-offer-num">'+p.price+'</span>'
          +(p.origPrice!==p.price?'<span class="price-orig-num">'+p.origPrice+'</span>':'')
        +'</div>'+(isPreorder && p.eta ? '<div class="pcard-eta">ETA '+p.eta+'</div>' : '')+'</div>'
      +'</div>'
    +'</div>';
  }).join('');

  grid.querySelectorAll('[data-preview]').forEach(function(c){ c.addEventListener('click', function(e){ openPreview(this.dataset.preview); }); });
  grid.querySelectorAll('[data-add]').forEach(function(b){ b.addEventListener('click', function(e){ e.stopPropagation(); addToCart(this.dataset.add); }); });
  grid.querySelectorAll('[data-buy]').forEach(function(b){ b.addEventListener('click', function(e){ e.stopPropagation(); buyNow(this.dataset.buy); }); });

  if(loadMoreWrap) loadMoreWrap.style.display = (visibleCount < filtered.length) ? 'flex' : 'none';

  observeCardsForFadeIn();
  bindCardImageSwipe(grid);
}

function bindCardImageSwipe(grid){
  var SWIPE_THRESHOLD = 30;
  grid.querySelectorAll('.pcard-img').forEach(function(imgBox){
    refreshCardImageState(imgBox);

    // Desktop hover: show secondary image with a smooth change.
    // This uses the same active-index logic as mobile swipe, so inline image state never blocks hover.
    if(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches){
      imgBox.addEventListener('mouseenter', function(){
        if(imgBox.querySelector('.pcard-img-2')){
          imgBox.dataset.activeIdx = '2';
          refreshCardImageState(imgBox);
        }
      });
      imgBox.addEventListener('mouseleave', function(){
        var first = imgBox.querySelector('.pcard-img-1') || imgBox.querySelector('img');
        if(first){
          imgBox.dataset.activeIdx = String(getCardImageIndex(first));
          refreshCardImageState(imgBox);
        }
      });
    }

    var startX=0, startY=0, tracking=false, moved=false;

    imgBox.addEventListener('touchstart', function(e){
      if(!e.touches || !e.touches.length) return;
      if(imgBox.querySelectorAll('img').length < 2) return; // only one real image — nothing to swipe to
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      tracking = true;
      moved = false;
    }, {passive:true});

    imgBox.addEventListener('touchmove', function(e){
      if(!tracking || !e.touches || !e.touches.length) return;
      var dx = e.touches[0].clientX - startX;
      var dy = e.touches[0].clientY - startY;
      if(Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)){
        moved = true;
      }
    }, {passive:true});

    imgBox.addEventListener('touchend', function(e){
      if(!tracking) return;
      tracking = false;
      var imgs = Array.prototype.slice.call(imgBox.querySelectorAll('img'));
      if(imgs.length < 2) return;
      if(!moved) return;
      e.preventDefault();
      var dx = (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : startX) - startX;
      if(Math.abs(dx) < SWIPE_THRESHOLD) return;

      var idxs = imgs.map(getCardImageIndex);
      var activeIdx = parseInt(imgBox.dataset.activeIdx, 10);
      var pos = idxs.indexOf(activeIdx);
      if(pos < 0) pos = 0;
      if(dx < 0){
        pos = pos >= idxs.length - 1 ? 0 : pos + 1;
      }else{
        pos = pos <= 0 ? idxs.length - 1 : pos - 1;
      }
      imgBox.dataset.activeIdx = String(idxs[pos]);
      refreshCardImageState(imgBox);
    }, {passive:false});
  });
}

function observeCardsForFadeIn(){
  var cards = document.querySelectorAll('.pcard:not(.in-view)');
  if(!('IntersectionObserver' in window)){
    cards.forEach(function(c){ c.classList.add('in-view'); });
    return;
  }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, {rootMargin:'0px 0px -40px 0px', threshold:0.05});
  cards.forEach(function(c){ io.observe(c); });
}

function findByModel(model){
  var target = String(model || '').trim();
  try{ target = decodeURIComponent(target); }catch(e){}
  return PRODUCTS.find(function(p){return String(p.model || '').trim() === target;});
}

function cartModel(item){
  return String((item && (item.model || item.modelNo || item['MODEL NO.'] || item.MODEL_NO)) || '').trim();
}

function cartItemForStorage(item){
  var model = cartModel(item);
  return {
    brand: item.brand || item.BRAND || '',
    carbrand: item.carbrand || item.CARBRAND || '',
    name: item.name || item['PRODUCT NAME'] || '',
    model: model,
    modelNo: model,
    price: Number(item.price || item.PRICE || 0),
    origPrice: Number(item.origPrice || item.ORIGPRICE || item.price || item.PRICE || 0),
    qty: Math.max(1, Number(item.qty || item.quantity || 1)),
    stockQty: Math.max(0, Number(item.stockQty || item.QTY || item.qty || 0)),
    status: item.status || item.STATUS || '',
    imgs: Array.isArray(item.imgs) ? item.imgs.filter(Boolean) : [item.IMG1,item.IMG2,item.IMG3,item.IMG4].filter(Boolean)
  };
}

function loadSavedCart(){
  try{
    var raw = localStorage.getItem(CART_KEY);
    if(!raw) return [];
    var rows = JSON.parse(raw);
    if(!Array.isArray(rows)) return [];
    return rows.map(cartItemForStorage).filter(function(item){ return item && item.model; });
  }catch(e){
    return [];
  }
}

function saveCart(){
  try{
    localStorage.setItem(CART_KEY, JSON.stringify(cart.map(cartItemForStorage)));
  }catch(e){}
}

function clearCart(){
  cart = [];
  try{ localStorage.removeItem(CART_KEY); }catch(e){}
  updateCartUI();
}

function reconcileCartWithProducts(){
  if(!cart.length || !PRODUCTS.length) return;
  cart = cart.map(function(item){
    var live = findByModel(item.model);
    if(!live) return item;
    var next = Object.assign({}, live, { qty: Math.max(1, Number(item.qty || 1)) });
    if(next.qty > live.qty) next.qty = live.qty;
    return next;
  }).filter(function(item){ return item && item.model && Number(item.qty || 0) > 0 && Number(item.qty || 0) <= Math.max(Number(item.stockQty || item.qty || 1), 1); });
  saveCart();
}

function addToCart(model){
  var p = findByModel(model); if(!p||p.qty===0)return;
  var ex = cart.find(function(c){return c.model===model;});
  var inCart = ex?ex.qty:0;
  if(inCart>=p.qty){ alert('Only '+p.qty+' available for this model.'); return; }
  if(ex) ex.qty++; else cart.push(Object.assign({},p,{qty:1}));
  saveCart();
  updateCartUI();
  showToast(p.name+' added to cart');
}

var toastTimer = null;
function showToast(msg){
  var t = document.getElementById('toast');
  t.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>'+msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ t.classList.remove('show'); }, 2200);
}
function removeFromCart(model){ cart=cart.filter(function(c){return c.model!==model;}); saveCart(); updateCartUI(); renderCartDrawer(); }
function changeQty(model,delta){
  var item=cart.find(function(c){return c.model===model;}); if(!item)return;
  var prod=findByModel(model);
  item.qty+=delta;
  if(item.qty<=0){removeFromCart(model);return;}
  if(prod && item.qty>prod.qty) item.qty=prod.qty;
  saveCart();
  updateCartUI(); renderCartDrawer();
}
function cartTotal(){ return cart.reduce(function(s,c){return s+c.price*c.qty;},0); }
function cartCount(){ return cart.reduce(function(s,c){return s+c.qty;},0); }
function updateCartUI(){
  var count=cartCount(), total=cartTotal();
  document.getElementById('cart-badge').textContent=count;
  document.getElementById('cart-total-display').textContent='AED '+total;
}
function renderCartDrawer(){
  var el=document.getElementById('cart-items-list'); var footer=document.getElementById('cart-footer');
  document.getElementById('cart-count-head').textContent = cart.length?('('+cartCount()+')'):'';
  if(!cart.length){
    el.innerHTML='<div class="cart-empty-msg"><strong>Your selection is empty.</strong><br>Browse the catalogue and add the models you want to reserve.</div>';
    footer.style.display='none'; return;
  }
  footer.style.display='flex';
  el.innerHTML=cart.map(function(item){
    var img = item.imgs && item.imgs[0] ? item.imgs[0] : ph(item.name);
    return '<div class="cart-item"><img class="cart-item-img" src="'+img+'" alt="'+item.name+'" data-open-preview="'+item.model+'" style="cursor:pointer">'
      +'<div class="cart-item-info"><div class="ci-brand">'+item.brand+'</div><div class="ci-name">'+item.name+'</div>'
      +'<div class="ci-price">AED '+(item.price*item.qty)+'</div>'
      +'<div class="ci-controls"><button class="qty-btn" data-dec="'+item.model+'">&minus;</button><span class="qty-num">'+item.qty+'</span><button class="qty-btn" data-inc="'+item.model+'">+</button><button class="ci-remove" data-rm="'+item.model+'">Remove</button></div></div></div>';
  }).join('');
  el.querySelectorAll('[data-dec]').forEach(function(b){b.addEventListener('click',function(){changeQty(this.dataset.dec,-1);});});
  el.querySelectorAll('[data-inc]').forEach(function(b){b.addEventListener('click',function(){changeQty(this.dataset.inc,1);});});
  el.querySelectorAll('[data-rm]').forEach(function(b){b.addEventListener('click',function(){removeFromCart(this.dataset.rm);});});
  el.querySelectorAll('[data-open-preview]').forEach(function(img){
    img.addEventListener('click', function(){
      closeCart();
      openPreview(this.dataset.openPreview);
    });
  });
}
function openCart(){ renderCartDrawer(); document.getElementById('cart-drawer').classList.add('open'); document.getElementById('cart-overlay').classList.add('open'); document.body.style.overflow='hidden'; }
function closeCart(){ document.getElementById('cart-drawer').classList.remove('open'); document.getElementById('cart-overlay').classList.remove('open'); document.body.style.overflow=''; }

async function createPendingOrder(items){
  var safeItems = items.map(function(i){
    var model = cartModel(i);
    return {
      modelNo: model,
      model: model,
      'MODEL NO.': model,
      name: i.name || i['PRODUCT NAME'] || '',
      brand: i.brand || i.BRAND || '',
      carbrand: i.carbrand || i.CARBRAND || '',
      qty: Math.max(1, Number(i.qty || i.quantity || 1)),
      price: Number(i.price || i.PRICE || 0)
    };
  }).filter(function(i){ return i.modelNo; });

  if(!safeItems.length){
    try{ localStorage.removeItem(CART_KEY); }catch(e){}
    cart = [];
    updateCartUI();
    renderCartDrawer();
    throw new Error('Cart item data was old. Please add the product to cart again.');
  }

  var orderId = '64C-' + Date.now().toString(36).toUpperCase();
  var total = safeItems.reduce(function(s,i){ return s + (Number(i.price||0) * Number(i.qty||0)); }, 0);

  var res = await fetch(API_URL, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({
      action: 'create-pending-order',
      orderId: orderId,
      sourceUrl: window.location.href,
      createdAt: new Date().toISOString(),
      total: total,
      items: safeItems
    })
  });

  var data = null;
  try{ data = await res.json(); }catch(e){}
  if(!res.ok || (data && data.ok === false)) throw new Error((data && data.error) || 'Could not create pending order');
  return (data && data.order && data.order.id) || (data && data.orderId) || orderId;
}

function buildMsg(items, orderId){
  var lines=items.map(function(i,idx){
    var lineTotal=Number(i.price||0)*Number(i.qty||0);
    return (idx+1)+'. '+(i.brand||'')+' — '+(i.name||'')+' ('+(i.model||cartModel(i))+')\n'
      +'   '+productShareUrl(i)+'\n'
      +'   Qty '+(i.qty||1)+' × AED '+formatAEDPlain(i.price||0)+' = AED '+formatAEDPlain(lineTotal);
  }).join('\n\n');
  var pendingLine = orderId ? '\n\nPending Order ID: '+orderId : '';
  return lines + pendingLine;
}

function formatAEDPlain(n){
  n = Number(n || 0);
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

async function buyNow(model){
  var p=findByModel(model); if(!p||p.qty===0)return;
  var item = Object.assign({},p,{qty:1});
  var orderId = '';
  try{
    orderId = await createPendingOrder([item]);
  }catch(e){
    console.warn('Pending order could not be created, continuing to WhatsApp:', e);
  }
  window.open('https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent(buildMsg([item], orderId)),'_blank');
}

async function orderViaWhatsApp(){
  if(!cart.length)return;
  var btn=document.getElementById('waOrderBtn');
  var checkoutItems = cart.slice();
  var orderId = '';
  try{
    if(btn){ btn.disabled=true; btn.dataset.oldText=btn.textContent; btn.textContent='Opening WhatsApp...'; }
    try{
      orderId = await createPendingOrder(checkoutItems);
    }catch(e){
      console.warn('Pending order could not be created, continuing to WhatsApp:', e);
    }
    window.open('https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent(buildMsg(checkoutItems, orderId)),'_blank');
    clearCart(); renderCartDrawer(); closeCart();
  }catch(e){ alert((e && e.message) || 'Could not open WhatsApp.'); }
  finally{
    if(btn){ btn.disabled=false; btn.textContent=btn.dataset.oldText || 'Buy Now via WhatsApp'; }
  }
}

function productShareUrl(p){
  var model = (p && (p.model || p.modelNo || p['MODEL NO.'])) || '';
  try{ if(!model && typeof cartModel === 'function') model = cartModel(p); }catch(e){}
  return window.location.origin + '/product/' + encodeURIComponent(String(model || '').trim());
}

function absoluteUrl(value){
  try{
    if(!value) return '';
    return new URL(value, window.location.href).toString();
  }catch(e){
    return value || '';
  }
}
function productPrimaryImageUrl(p){
  var imgs = (p && p.imgs) ? p.imgs : [];
  for(var i=0;i<imgs.length;i++){
    if(typeof imgs[i] !== 'string') continue;
    var clean = imgs[i].trim();
    if(clean && clean !== 'null' && clean !== 'undefined' && clean !== '#'){
      return absoluteUrl(clean);
    }
  }
  return absoluteUrl(ph(p && p.name ? p.name : 'Product'));
}
async function shareProduct(model){
  var p = findByModel(model || previewModel); if(!p) return;
  var shareUrl = productShareUrl(p);
  var title = p.brand+' - '+p.name;
  var shareData = {title:title, url:shareUrl};

  if(navigator.share){
    navigator.share(shareData).catch(function(){});
    return;
  }

  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(shareUrl).then(function(){ showToast('Product link copied'); }).catch(function(){ window.open('https://wa.me/?text='+encodeURIComponent(shareUrl),'_blank'); });
  }else{
    window.open('https://wa.me/?text='+encodeURIComponent(shareUrl),'_blank');
  }
}

function openCheckout(){ orderViaWhatsApp(); }
function closeCheckout(){}
function buildMsgWithDetails(items, details){ return buildMsg(items); }
function submitCheckout(){ orderViaWhatsApp(); }

var previewModel = null;
var previewImgs = [];
var previewImgIdx = 0;
var previewImgPositions = [];
var previewImgZooms = [];
var suppressPreviewImgError = false;

function setPreviewImage(idx){
  if(!previewImgs.length) return;
  if(idx < 0) idx = previewImgs.length - 1;
  if(idx >= previewImgs.length) idx = 0;
  previewImgIdx = idx;
  var el = document.getElementById('previewImgEl');
  if(!el) return;
  el.style.display = 'block';
  el.alt = (findByModel(previewModel) || {}).name || '';
  el.style.objectPosition = (previewImgPositions[idx] || 'center');
  el.style.setProperty('--zoom', previewImgZooms[idx] || 1);
  suppressPreviewImgError = true;
  el.src = previewImgs[idx];
  setTimeout(function(){ suppressPreviewImgError = false; }, 0);
  document.querySelectorAll('.preview-thumb').forEach(function(t,i){ t.classList.toggle('active', i===idx); });
  document.querySelectorAll('.preview-img-dots .dot').forEach(function(d,i){ d.classList.toggle('active', i===idx); });
}

function renderPreviewControls(){
  var thumbsEl = document.getElementById('previewThumbs');
  var dotsEl = document.getElementById('previewImgDots');
  if(!thumbsEl || !dotsEl) return;
  if(previewImgs.length > 1){
    thumbsEl.style.display = 'flex';
    thumbsEl.innerHTML = previewImgs.map(function(im,idx){
      return '<div class="preview-thumb'+(idx===previewImgIdx?' active':'')+'" data-thumb="'+idx+'"><img src="'+esc(im)+'" alt="'+esc((findByModel(previewModel) || {}).name || '')+' thumbnail '+(idx+1)+'" data-preview-thumb-img="'+idx+'"></div>';
    }).join('');
    thumbsEl.querySelectorAll('[data-thumb]').forEach(function(t){
      t.addEventListener('click', function(){ goToPreviewImg(parseInt(this.dataset.thumb, 10)); });
    });
    thumbsEl.querySelectorAll('[data-preview-thumb-img]').forEach(function(img){
      img.onerror = function(){ removeBrokenPreviewImg(parseInt(this.getAttribute('data-preview-thumb-img'), 10)); };
    });
    dotsEl.style.display = 'flex';
    dotsEl.innerHTML = previewImgs.map(function(im,idx){ return '<div class="dot'+(idx===previewImgIdx?' active':'')+'"></div>'; }).join('');
  }else{
    thumbsEl.style.display = 'none';
    thumbsEl.innerHTML = '';
    dotsEl.style.display = 'none';
    dotsEl.innerHTML = '';
  }
}

function removeBrokenPreviewImg(idx){
  if(!Number.isFinite(idx) || idx < 0 || idx >= previewImgs.length) return;
  previewImgs.splice(idx, 1);
  previewImgPositions.splice(idx, 1);
  previewImgZooms.splice(idx, 1);
  if(!previewImgs.length){
    var p = findByModel(previewModel);
    previewImgs = [ph(p && p.name ? p.name : 'Product')];
    previewImgPositions = ['center'];
    previewImgZooms = [1];
    previewImgIdx = 0;
  }else if(previewImgIdx >= previewImgs.length){
    previewImgIdx = previewImgs.length - 1;
  }else if(idx < previewImgIdx){
    previewImgIdx--;
  }
  renderPreviewControls();
  setPreviewImage(previewImgIdx);
}

function openPreview(model){
  var p = findByModel(model); if(!p) return;
  previewModel = model;
  var descBodyReset = document.getElementById('previewDescBody');
  var descToggleReset = document.getElementById('previewDescToggle');
  if(descBodyReset){ descBodyReset.classList.remove('open'); }
  if(descToggleReset){ descToggleReset.setAttribute('aria-expanded','false'); }
  var sold = p.qty===0 || p.tag==='sold';
  var qi = qtyInfo(p.qty);
  var d = disc(p);
  var rawImgs = (p.imgs||[]);
  var rawPositions = [p.img1Pos||'center', p.img2Pos||'center', 'center', 'center'];
  var rawZooms = [(p.img1Zoom||200)/100, (p.img2Zoom||200)/100, 1, 1];
  var imgs = [];
  var imgPositions = [];
  var imgZooms = [];
  rawImgs.forEach(function(i, idx){
    if(typeof i !== 'string') return;
    var clean = i.trim();
    if(!clean || clean === 'null' || clean === 'undefined' || clean === '#') return;
    imgs.push(clean);
    imgPositions.push(rawPositions[idx] || 'center');
    imgZooms.push(rawZooms[idx] || 1);
  });
  if(!imgs.length){
    imgs = [ph(p.name)];
    imgPositions = ['center'];
    imgZooms = [1];
  }
  previewImgs = imgs;
  previewImgIdx = 0;
  previewImgPositions = imgPositions;
  previewImgZooms = imgZooms;

  var mainPreviewImg = document.getElementById('previewImgEl');
  if(mainPreviewImg){
    mainPreviewImg.onerror = function(){
      if(suppressPreviewImgError) return;
      removeBrokenPreviewImg(previewImgIdx);
    };
  }
  renderPreviewControls();
  setPreviewImage(0);
  document.getElementById('previewBrand').textContent = p.brand;
  document.getElementById('previewName').textContent = p.name;
  document.getElementById('previewModel').textContent = p.model;
  var etaLine = document.getElementById('previewEtaLine');
  if(etaLine){
    var isPreorderProduct = String(p.tag||'').toLowerCase().replace(/[\s_-]+/g,'') === 'preorder';
    var etaVal = String(p.eta || p.ETA || '').trim();
    if(isPreorderProduct && etaVal){
      etaLine.textContent = 'Expected arrival: ' + etaVal;
      etaLine.style.display = '';
    }else{
      etaLine.textContent = '';
      etaLine.style.display = 'none';
    }
  }
  document.getElementById('previewQty').innerHTML = (qi.cls==='out'||qi.cls==='low') ? ('<span class="qty-pip '+qi.cls+'"></span>'+qi.text) : '';
  document.getElementById('previewPriceRow').innerHTML =
    '<span class="preview-price-offer">AED '+p.price+'</span>'
    +(p.origPrice!==p.price?'<span class="preview-price-orig">'+p.origPrice+'</span>':'')
    +(d>0?'<span class="preview-price-disc">-'+d+'%</span>':'');

  var buyBtn = document.getElementById('previewBuyBtn');
  var cartBtn = document.getElementById('previewCartBtn');
  var shareBtn = document.getElementById('previewShareBtn');
  buyBtn.disabled = sold;
  cartBtn.disabled = sold;
  cartBtn.textContent = sold ? 'Sold Out' : 'Add to Cart';
  if(shareBtn){
    shareBtn.onclick = function(){ shareProduct(p.model); };
  }

  document.getElementById('preview-drawer').classList.add('open');
  document.getElementById('preview-overlay').classList.add('open');
  document.body.style.overflow='hidden';
}

function goToPreviewImg(idx){
  setPreviewImage(idx);
}

function closePreview(){
  document.getElementById('preview-drawer').classList.remove('open');
  document.getElementById('preview-overlay').classList.remove('open');
  document.body.style.overflow='';
}

document.addEventListener('keydown', function(e){
  var drawer = document.getElementById('preview-drawer');
  if(!drawer || !drawer.classList.contains('open')) return;
  if(e.key === 'ArrowLeft'){ goToPreviewImg(previewImgIdx - 1); }
  else if(e.key === 'ArrowRight'){ goToPreviewImg(previewImgIdx + 1); }
  else if(e.key === 'Escape'){ closePreview(); }
});

function openSharedProductFromUrl(){
  try{
    var params = new URLSearchParams(window.location.search);
    var model = params.get('product');
    var pathMatch = window.location.pathname.match(/^\/product\/([^\/?#]+)/i);
    if(!model && pathMatch) model = pathMatch[1];
    if(model && typeof openPreview === 'function'){
      openPreview(model);
    }
  }catch(e){}
}

function initStockSwitch(){
  var el = document.getElementById('stockSwitch');
  if(!el) return;
  var isPlainHome = !PAGE_BRAND_SLUG && !PAGE_NEW_ARRIVALS && !PAGE_PRE_ORDERS
    && !/^\/(current-stock|current-stocks|pre-order|pre-orders|preorders)(\/|$)/i.test(window.location.pathname);
  if(!isPlainHome){ el.style.display = 'none'; return; }
  function markActive(view){
    el.querySelectorAll('.stock-switch-btn').forEach(function(b){
      b.classList.toggle('active', b.getAttribute('data-stock-view') === view);
    });
  }
  function setActive(view){
    homeStatusFilter = view;
    markActive(view);
    renderGrid();
  }
  el.querySelectorAll('.stock-switch-btn').forEach(function(b){
    b.addEventListener('click', function(){ setActive(this.getAttribute('data-stock-view')); });
  });
  markActive(homeStatusFilter);
}

function initShop(){
  applyPageBrandMeta();
  initStockSwitch();
  fetchProducts(function(){
    reconcileCartWithProducts();
    updateCartUI();
    buildFilterTabs();
    renderBrandNavigationLinks();
    renderGrid();
    openSharedProductFromUrl();
  });
  document.getElementById('openCartBtn').addEventListener('click', openCart);

  var filterRowSearch = document.querySelector('.filter-row-search');
  var filterRowSearchInput = document.getElementById('search-inp-drawer');
  if(filterRowSearch && filterRowSearchInput){
    filterRowSearch.addEventListener('click', function(e){
      if(window.innerWidth > 767) return; // desktop: always expanded, no toggle needed
      if(!filterRowSearch.classList.contains('expanded')){
        filterRowSearch.classList.add('expanded');
        setTimeout(function(){ filterRowSearchInput.focus(); }, 50);
      }
    });
    filterRowSearchInput.addEventListener('keydown', function(e){
      if(window.innerWidth > 767) return;
      if(e.key === 'Enter' || e.key === 'Escape'){
        e.preventDefault();
        filterRowSearchInput.blur();
        if(filterRowSearchInput.value.trim() === ''){
          filterRowSearch.classList.remove('expanded');
        }
      }
    });
    document.addEventListener('click', function(e){
      if(window.innerWidth > 767) return;
      if(!filterRowSearch.contains(e.target)){
        filterRowSearchInput.blur();
        if(filterRowSearchInput.value.trim() === ''){
          filterRowSearch.classList.remove('expanded');
        }
      }
    });
  }

  var grid2Btn = document.getElementById('gridView2col');
  var grid1Btn = document.getElementById('gridView1col');
  if(grid2Btn && grid1Btn){
    grid2Btn.addEventListener('click', function(){
      document.getElementById('product-grid').classList.remove('list-view');
      grid2Btn.classList.add('active');
      grid1Btn.classList.remove('active');
    });
    grid1Btn.addEventListener('click', function(){
      document.getElementById('product-grid').classList.add('list-view');
      grid1Btn.classList.add('active');
      grid2Btn.classList.remove('active');
    });
  }
  document.getElementById('closeCartBtn').addEventListener('click', closeCart);
  document.getElementById('continueBtn').addEventListener('click', closeCart);
  document.getElementById('cart-overlay').addEventListener('click', closeCart);
  document.getElementById('waOrderBtn').addEventListener('click', orderViaWhatsApp);
  var footWaBtn = document.getElementById('footWaSubmit');
  if(footWaBtn) footWaBtn.addEventListener('click', function(){
    var input = document.getElementById('footWaInput');
    var num = input.value.trim();
    if(!num){ alert('Please enter your WhatsApp number first.'); return; }
    footWaBtn.disabled = true;
    fetch(API_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'join-community',phone:num})})
      .then(function(r){return r.json().then(function(d){ if(!r.ok || !d.ok) throw new Error(d.error||'Request failed'); return d; });})
      .then(function(){
        input.value='';
        if(typeof showToast==='function') showToast('Thanks! We will add you to the community soon.');
        else alert('Thanks! We will add you to the community soon.');
      })
      .catch(function(err){ alert(err.message || 'Could not submit right now. Please try again.'); })
      .finally(function(){ footWaBtn.disabled = false; });
  });
  document.getElementById('closePreviewBtn').addEventListener('click', closePreview);
  document.getElementById('preview-overlay').addEventListener('click', closePreview);
  var descToggle = document.getElementById('previewDescToggle');
  if(descToggle) descToggle.addEventListener('click', function(){
    var body = document.getElementById('previewDescBody');
    var isOpen = body.classList.toggle('open');
    descToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
  document.getElementById('loadMoreBtn').addEventListener('click', loadMoreProducts);
  document.getElementById('openFiltersBtn').addEventListener('click', openFilterDrawer);
  document.getElementById('closeFiltersBtn').addEventListener('click', closeFilterDrawer);
  document.getElementById('filterDrawerOverlay').addEventListener('click', closeFilterDrawer);
  document.getElementById('clearFiltersBtn').addEventListener('click', clearAllFilters);
  document.getElementById('openMenuBtn').addEventListener('click', openMenuPanel);
  document.getElementById('closeMenuBtn').addEventListener('click', closeMenuPanel);
  document.getElementById('menuOverlay').addEventListener('click', closeMenuPanel);
  document.getElementById('previewBuyBtn').addEventListener('click', function(){ if(previewModel) buyNow(previewModel); });
  document.getElementById('previewCartBtn').addEventListener('click', function(){
    if(!previewModel) return;
    addToCart(previewModel);
    this.textContent='Added ✓';
    var self=this;
    setTimeout(function(){ self.textContent='Add to Cart'; }, 1500);
  });
  var searchDesktop = document.getElementById('search-inp-desktop');
  var searchDrawer = document.getElementById('search-inp-drawer');
  function syncSearch(source, target){ if(target && target.value !== source.value) target.value = source.value; renderGrid(); }
  if(searchDesktop) searchDesktop.addEventListener('input', function(){ syncSearch(this, searchDrawer); });
  if(searchDrawer) searchDrawer.addEventListener('input', function(){ syncSearch(this, searchDesktop); });

  initPreviewSwipe();
}

function initPreviewSwipe(){
  var imgMain = document.getElementById('previewImgMain');
  var drawer = document.getElementById('preview-drawer');
  var SWIPE_THRESHOLD = 40; // minimum px movement to register as a swipe, avoids accidental triggers

  var imgStartX=0, imgStartY=0, imgTracking=false;
  imgMain.addEventListener('touchstart', function(e){
    if(!e.touches || !e.touches.length) return;
    imgStartX = e.touches[0].clientX;
    imgStartY = e.touches[0].clientY;
    imgTracking = true;
  }, {passive:true});
  imgMain.addEventListener('touchend', function(e){
    if(!imgTracking) return;
    imgTracking = false;
    var endX = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientX : imgStartX;
    var endY = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientY : imgStartY;
    var dx = endX - imgStartX, dy = endY - imgStartY;
    if(Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)){
      if(dx < 0) goToPreviewImg(previewImgIdx + 1); // swiped left -> next image
      else goToPreviewImg(previewImgIdx - 1);       // swiped right -> previous image
    }
  }, {passive:true});

  var mouseStartX=0, mouseStartY=0, mouseTracking=false;
  imgMain.addEventListener('mousedown', function(e){
    if(e.button !== 0) return;
    mouseStartX = e.clientX;
    mouseStartY = e.clientY;
    mouseTracking = true;
    imgMain.classList.add('dragging');
  });
  window.addEventListener('mouseup', function(e){
    if(!mouseTracking) return;
    mouseTracking = false;
    imgMain.classList.remove('dragging');
    var dx = e.clientX - mouseStartX;
    var dy = e.clientY - mouseStartY;
    if(Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)){
      if(dx < 0) goToPreviewImg(previewImgIdx + 1); // dragged left -> next image
      else goToPreviewImg(previewImgIdx - 1);       // dragged right -> previous image
    }
  });
  imgMain.addEventListener('dragstart', function(e){ e.preventDefault(); });

  var bodyStartX=0, bodyStartY=0, bodyTracking=false;
  drawer.addEventListener('touchstart', function(e){
    if(!e.touches || !e.touches.length) return;
    if(imgMain.contains(e.target)) return; // image area handles next/previous image swipe only
    bodyStartX = e.touches[0].clientX;
    bodyStartY = e.touches[0].clientY;
    bodyTracking = true;
  }, {passive:true});
  drawer.addEventListener('touchend', function(e){
    if(!bodyTracking) return;
    bodyTracking = false;
    var endX = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientX : bodyStartX;
    var endY = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientY : bodyStartY;
    var dx = endX - bodyStartX, dy = endY - bodyStartY;
    var isHorizontalSwipe = Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.2;
    var isDownSwipe = dy > SWIPE_THRESHOLD * 1.5 && Math.abs(dy) > Math.abs(dx) && drawer.scrollTop <= 0;
    if(isHorizontalSwipe || isDownSwipe){
      closePreview(); // return to product grid
    }
  }, {passive:true});
}

function admStats(){
  var p=PRODUCTS, total=p.length;
  var rtc=p.filter(function(x){return x.tag==='currentstock';}).length;
  var avail=p.filter(function(x){return x.qty>0&&x.tag!=='sold';}).length;
  var low=p.filter(function(x){return x.qty>0&&x.qty<=3&&x.tag!=='sold';}).length;
  var out=p.filter(function(x){return x.qty===0||x.tag==='sold';}).length;
  document.getElementById('admStats').innerHTML=
    '<div><div class="adm-stat-num">'+total+'</div><div class="adm-stat-lbl">Total</div></div><div class="adm-sdiv"></div>'
    +'<div><div class="adm-stat-num">'+rtc+'</div><div class="adm-stat-lbl">CURRENT STOCKS</div></div><div class="adm-sdiv"></div>'
    +'<div><div class="adm-stat-num adm-c-green">'+avail+'</div><div class="adm-stat-lbl">In Stock</div></div><div class="adm-sdiv"></div>'
    +'<div><div class="adm-stat-num adm-c-orange">'+low+'</div><div class="adm-stat-lbl">Low Stock</div></div><div class="adm-sdiv"></div>'
    +'<div><div class="adm-stat-num adm-c-red">'+out+'</div><div class="adm-stat-lbl">Sold / Out</div></div>';
}
function admBrandFilter(){
  var brands=[], sel=document.getElementById('admFilterBrand'), cur=sel.value;
  PRODUCTS.forEach(function(x){ if(x.brand&&brands.indexOf(x.brand)<0)brands.push(x.brand); });
  brands.sort();
  sel.innerHTML='<option value="">All Brands</option>';
  brands.forEach(function(b){ var o=document.createElement('option'); o.value=b; o.textContent=b; if(b===cur)o.selected=true; sel.appendChild(o); });

  var carbrands=[], csel=document.getElementById('admFilterCarbrand');
  if(csel){
    var ccur=csel.value;
    PRODUCTS.forEach(function(x){ if(x.carbrand&&carbrands.indexOf(x.carbrand)<0)carbrands.push(x.carbrand); });
    carbrands.sort();
    csel.innerHTML='<option value="">All Vehicle Makes</option>';
    carbrands.forEach(function(b){ var o=document.createElement('option'); o.value=b; o.textContent=b; if(b===ccur)o.selected=true; csel.appendChild(o); });
  }
}
function admTable(){
  var q=document.getElementById('admSearch').value.toLowerCase();
  var ft=document.getElementById('admFilterTag').value;
  var fb=document.getElementById('admFilterBrand').value;
  var fcb=(document.getElementById('admFilterCarbrand')||{}).value||'';
  var list=PRODUCTS.filter(function(p){
    return (!q||p.name.toLowerCase().indexOf(q)>=0||p.model.toLowerCase().indexOf(q)>=0||p.brand.toLowerCase().indexOf(q)>=0)
      &&(!ft||p.tag===ft)&&(!fb||p.brand===fb)&&(!fcb||p.carbrand===fcb);
  });
  list = list.slice().sort(function(a,b){
    var aSold = isSoldOut(a) ? 1 : 0;
    var bSold = isSoldOut(b) ? 1 : 0;
    return aSold - bSold; // sold-out items sink to the end of the table (display only — does not change actual sortOrder)
  });
  var tb=document.getElementById('admTbody');
  if(!list.length){ tb.innerHTML='<tr class="adm-empty-r"><td colspan="10">No products found</td></tr>'; return; }
  var TAGC={currentstock:'adm-t-rtc',instock:'adm-t-ins',preorder:'adm-t-pre',sold:'adm-t-sol'};
  var TAGL={currentstock:'CURRENT STOCKS',instock:'In Stock',preorder:'Pre Order',sold:'Sold Out'};
  tb.innerHTML=list.map(function(p,i){
    var d=disc(p);
    var qc=p.qty===0?'adm-qty-out':p.qty<=3?'adm-qty-low':'adm-qty-ok';
    var im=p.imgs[0]?'<img class="adm-thumb" src="'+p.imgs[0]+'">':'<div class="adm-thumb-ph">No img</div>';
    var op=p.origPrice!==p.price?'<span class="adm-torig">'+p.origPrice+'</span>'+(d>0?' <span class="adm-tdisc">-'+d+'%</span>':''):'&mdash;';
    return '<tr class="adm-row" draggable="true" data-model="'+p.model+'"><td class="adm-order-cell"><span class="adm-drag-handle" title="Drag to reorder">☰</span><input type="number" class="adm-order-input" data-order-model="'+p.model+'" value="'+(Number(p.sortOrder)||i+1)+'" min="1"></td><td>'+im+'</td>'
      +'<td class="adm-pname">'+p.name+'<br><span class="adm-pbrand">'+p.brand+'</span></td>'
      +'<td class="adm-pcarbrand">'+(p.carbrand?p.carbrand:'<span class="adm-pcarbrand-empty">&mdash;</span>')+'</td>'
      +'<td class="adm-pmodel">'+p.model+'</td>'
      +'<td><span class="adm-tbadge '+(TAGC[p.tag]||'')+'">'+(TAGL[p.tag]||p.tag)+'</span></td>'
      +'<td class="'+qc+'">'+p.qty+'</td>'
      +'<td class="adm-tprice">AED '+p.price+'</td>'
      +'<td>'+op+'</td>'
      +'<td><div class="adm-tacts"><button class="adm-tedit" data-e="'+p.model+'">Edit</button><button class="adm-tdel" data-d="'+p.model+'">Delete</button></div></td>'
      +'</tr>';
  }).join('');
  tb.querySelectorAll('[data-e]').forEach(function(b){b.addEventListener('click',function(){admEditOpen(this.dataset.e);});});
  tb.querySelectorAll('[data-d]').forEach(function(b){b.addEventListener('click',function(){admDelete(this.dataset.d);});});
  bindAdminDragRows();
  bindAdminOrderInputs();
}

function bindAdminOrderInputs(){
  var tb = document.getElementById('admTbody');
  if(!tb) return;
  tb.querySelectorAll('[data-order-model]').forEach(function(input){
    function commit(){
      var model = input.dataset.orderModel;
      var newPos = parseInt(input.value, 10);
      if(!newPos || newPos < 1) return;
      reorderProductsToPosition(model, newPos);
    }
    input.addEventListener('keydown', function(e){
      if(e.key === 'Enter'){ e.preventDefault(); commit(); input.blur(); }
    });
    input.addEventListener('blur', commit);
  });
}

function reorderProductsToPosition(model, newPos){
  var fromIdx = PRODUCTS.findIndex(function(p){return p.model===model;});
  if(fromIdx < 0) return;
  var moved = PRODUCTS.splice(fromIdx,1)[0];
  var toIdx = Math.max(0, Math.min(newPos-1, PRODUCTS.length));
  PRODUCTS.splice(toIdx,0,moved);
  PRODUCTS.forEach(function(p,i){ p.sortOrder = i + 1; });
  admTable();
}

var admDragModel = null;
function bindAdminDragRows(){
  var tb = document.getElementById('admTbody');
  if(!tb) return;
  tb.querySelectorAll('tr[data-model]').forEach(function(row){
    row.addEventListener('dragstart', function(e){
      admDragModel = this.dataset.model;
      this.classList.add('dragging');
      if(e.dataTransfer){ e.dataTransfer.effectAllowed='move'; e.dataTransfer.setData('text/plain', admDragModel); }
    });
    row.addEventListener('dragend', function(){ this.classList.remove('dragging'); admDragModel=null; });
    row.addEventListener('dragover', function(e){ e.preventDefault(); this.classList.add('drag-over'); });
    row.addEventListener('dragleave', function(){ this.classList.remove('drag-over'); });
    row.addEventListener('drop', function(e){
      e.preventDefault();
      this.classList.remove('drag-over');
      var fromModel = admDragModel || (e.dataTransfer && e.dataTransfer.getData('text/plain'));
      var toModel = this.dataset.model;
      if(fromModel && toModel && fromModel !== toModel) reorderProducts(fromModel, toModel);
    });
  });
}
function reorderProducts(fromModel, toModel){
  var fromIdx = PRODUCTS.findIndex(function(p){return p.model===fromModel;});
  var toIdx = PRODUCTS.findIndex(function(p){return p.model===toModel;});
  if(fromIdx < 0 || toIdx < 0) return;
  var moved = PRODUCTS.splice(fromIdx,1)[0];
  PRODUCTS.splice(toIdx,0,moved);
  PRODUCTS.forEach(function(p,i){ p.sortOrder = i + 1; });
  admTable();
}
function saveManualOrder(){
  if(!PRODUCTS.length) return;
  PRODUCTS.forEach(function(p,i){ p.sortOrder = i + 1; });
  if(!confirm('Save this product order to the live inventory?')) return;
  showSync(true);
  var i = 0;
  function next(){
    if(i >= PRODUCTS.length){
      try{ sessionStorage.removeItem(CACHE_KEY); }catch(e){}
      showSync(false);
      alert('Product order saved.');
      fetchProducts(admRefreshAll);
      return;
    }
    pushUpdate(PRODUCTS[i], function(){ i++; next(); });
  }
  next();
}
function admRefreshAll(){ admStats(); admBrandFilter(); admTable(); }

var ADM_IMAGE_BASE_PATH = 'https://pub-93350f16ecf844b7824fa0a683487d84.r2.dev/PI/';
var ADM_IMAGE_EXT = '.jpg';

function admBuildSlots(){
  var grid=document.getElementById('admImgGrid'); grid.innerHTML='';
  for(var i=0;i<4;i++){
    (function(idx){
      var slot=document.createElement('div');
      slot.className='adm-islot-url'+(admImgs[idx]?' filled':'');

      var lbl=document.createElement('label');
      lbl.className='adm-islot-url-lbl';
      lbl.textContent=ADM_LABELS[idx]+' image URL';

      var row=document.createElement('div');
      row.className='adm-islot-url-row';

      var previewWrap=document.createElement('div');
      previewWrap.className='adm-islot-url-preview-wrap';

      var inp=document.createElement('input');
      inp.type='text';
      inp.placeholder='https://wdcollect.com/images/example.jpg';
      inp.value=admImgs[idx]||'';
      inp.addEventListener('input',function(){
        admImgs[idx]=this.value.trim();
        preview.src = admImgs[idx] || '';
        previewWrap.style.display = admImgs[idx] ? 'block' : 'none';
        slot.classList.toggle('filled', !!admImgs[idx]);
      });

      var rm=document.createElement('button');
      rm.type='button'; rm.className='adm-islot-url-rm'; rm.textContent='Clear';
      rm.addEventListener('click',function(){
        admImgs[idx]='';
        inp.value='';
        preview.src='';
        previewWrap.style.display='none';
        slot.classList.remove('filled');
      });

      var preview=document.createElement('img');
      preview.className='adm-islot-url-preview';
      previewWrap.style.display = admImgs[idx] ? 'block' : 'none';
      if(admImgs[idx]) preview.src = admImgs[idx];
      preview.style.objectPosition = (idx<2 ? admImgPos[idx] : 'center');
      preview.style.transform = (idx<2 ? 'scale('+(admImgZoom[idx]/100)+')' : 'none');
      preview.onerror=function(){ previewWrap.style.display='none'; };
      preview.onload=function(){ previewWrap.style.display='block'; };
      previewWrap.appendChild(preview);

      row.appendChild(inp);
      row.appendChild(rm);
      slot.appendChild(lbl);
      slot.appendChild(row);

      if(idx < 2){
        var posRow=document.createElement('div');
        posRow.className='adm-islot-pos-row';
        var posLbl=document.createElement('span');
        posLbl.className='adm-islot-pos-lbl';
        posLbl.textContent='Crop focus:';
        var posSel=document.createElement('select');
        posSel.className='adm-islot-pos-select';
        ADM_POSITIONS.forEach(function(pos){
          var opt=document.createElement('option');
          opt.value=pos; opt.textContent=pos.charAt(0).toUpperCase()+pos.slice(1);
          if(admImgPos[idx]===pos) opt.selected=true;
          posSel.appendChild(opt);
        });
        posSel.addEventListener('change',function(){
          admImgPos[idx]=this.value;
          preview.style.objectPosition=this.value;
        });
        posRow.appendChild(posLbl);
        posRow.appendChild(posSel);
        slot.appendChild(posRow);

        var zoomRow=document.createElement('div');
        zoomRow.className='adm-islot-zoom-row';
        var zoomLbl=document.createElement('span');
        zoomLbl.className='adm-islot-pos-lbl';
        zoomLbl.textContent='Zoom:';
        var zoomVal=document.createElement('span');
        zoomVal.className='adm-islot-zoom-val';
        zoomVal.textContent=admImgZoom[idx]+'%';
        var zoomSlider=document.createElement('input');
        zoomSlider.type='range'; zoomSlider.min='100'; zoomSlider.max='400'; zoomSlider.step='5';
        zoomSlider.value=admImgZoom[idx];
        zoomSlider.className='adm-islot-zoom-slider';
        zoomSlider.addEventListener('input',function(){
          admImgZoom[idx]=parseInt(this.value);
          preview.style.transform='scale('+(admImgZoom[idx]/100)+')';
          zoomVal.textContent=admImgZoom[idx]+'%';
        });
        zoomRow.appendChild(zoomLbl);
        zoomRow.appendChild(zoomSlider);
        zoomRow.appendChild(zoomVal);
        slot.appendChild(zoomRow);
      }

      slot.appendChild(previewWrap);
      grid.appendChild(slot);
    })(i);
  }
}
function g(id){ return document.getElementById(id); }
function admClear(){
  g('admFId').value=''; g('admFName').value=''; g('admFBrand').value=''; g('admFCarbrand').value='';
  g('admFModel').value=''; g('admFTag').value='currentstock'; g('admFPrice').value=''; g('admFOrigPrice').value='';
  g('admFQty').value=''; g('admFEta').value=''; admImgs=['','','',''];
  admImgPos=['center','center'];
  admImgZoom=[100,100];
  admBuildSlots();
}
function admAddOpen(){ g('admModalTitle').textContent='Add Product'; admClear(); g('admEditOverlay').classList.add('open'); }
function admEditOpen(model){
  var p=findByModel(model); if(!p)return;
  g('admModalTitle').textContent='Edit Product';
  g('admFId').value=p.model;
  g('admFName').value=p.name; g('admFBrand').value=p.brand; g('admFCarbrand').value=p.carbrand||'';
  g('admFModel').value=p.model; g('admFTag').value=p.tag;
  g('admFPrice').value=p.price; g('admFOrigPrice').value=p.origPrice!==p.price?p.origPrice:''; g('admFQty').value=p.qty;
  g('admFEta').value=p.eta||'';
  admImgs=p.imgs.slice(); while(admImgs.length<4)admImgs.push('');
  admImgPos=[p.img1Pos||'center', p.img2Pos||'center'];
  admImgZoom=[p.img1Zoom||100, p.img2Zoom||100, p.imageScale||100];
  admBuildSlots();
  g('admEditOverlay').classList.add('open');
}
function admClose(){ g('admEditOverlay').classList.remove('open'); }

function admSave(){
  var name=g('admFName').value.trim(), brand=g('admFBrand').value.trim(), model=g('admFModel').value.trim();
  var price=parseFloat(g('admFPrice').value), qty=parseInt(g('admFQty').value);
  if(!name||!brand||!model||isNaN(price)||isNaN(qty)){ alert('Please fill in all required fields.'); return; }
  var origPrice=parseFloat(g('admFOrigPrice').value); if(isNaN(origPrice))origPrice=price;
  var oldModel = g('admFId').value;
  var product = { name:name, brand:brand, carbrand:g('admFCarbrand').value.trim(), model:model, price:price, origPrice:origPrice, qty:qty, tag:g('admFTag').value, imgs:admImgs.slice(), img1Pos:admImgPos[0], img2Pos:admImgPos[1], img1Zoom:admImgZoom[0], img2Zoom:admImgZoom[1], imageScale: ((findByModel(oldModel)||{}).imageScale || 100), eta:g('admFEta').value.trim(), sortOrder: oldModel ? ((findByModel(oldModel)||{}).sortOrder || PRODUCTS.length+1) : PRODUCTS.length+1 };

  function afterSave(){
    try{ sessionStorage.removeItem(CACHE_KEY); }catch(e){}
    fetchProducts(function(){ admRefreshAll(); admClose(); });
  }

  if(oldModel && oldModel!==model){

    pushDelete(oldModel, function(){ pushUpdate(product, afterSave); });
  } else {
    pushUpdate(product, afterSave);
  }
}
function admExportJson(){
  var data = JSON.stringify(PRODUCTS.map(function(p){
    return {
      'BRAND': p.brand, 'CARBRAND': p.carbrand||'',
      'PRODUCT NAME': p.name, 'MODEL NO.': p.model,
      'PRICE': p.price, 'ORIGPRICE': p.origPrice,
      'QTY': p.qty, 'STATUS': p.tag,
      'SORTORDER': p.sortOrder||0,
      'IMG1': p.imgs[0]||'', 'IMG2': p.imgs[1]||'',
      'IMG3': p.imgs[2]||'', 'IMG4': p.imgs[3]||'',
      'IMG1POS': p.img1Pos||'center', 'IMG2POS': p.img2Pos||'center',
      'IMG1ZOOM': p.img1Zoom||100, 'IMG2ZOOM': p.img2Zoom||100
    };
  }), null, 2);
  var blob = new Blob([data], {type:'application/json'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '64cast_export_' + new Date().toISOString().slice(0,10) + '.json';
  a.click();
}

function cleanImportRow(row){
  var out = {};
  row = row || {};
  Object.keys(row).forEach(function(k){
    var key = String(k || '').trim();
    if(!key) return;
    var val = row[k];
    if(typeof val === 'string') val = val.trim();
    out[key] = val;
  });
  return out;
}

function parseCsvText(text){
  text = String(text || '').replace(/^\uFEFF/, '');
  var rows = [];
  var row = [];
  var cur = '';
  var inQuotes = false;
  for(var i=0;i<text.length;i++){
    var ch = text[i];
    if(inQuotes){
      if(ch === '"'){
        if(text[i+1] === '"'){ cur += '"'; i++; }
        else inQuotes = false;
      }else cur += ch;
    }else{
      if(ch === '"') inQuotes = true;
      else if(ch === ','){ row.push(cur); cur = ''; }
      else if(ch === '\n'){
        row.push(cur); rows.push(row); row = []; cur = '';
      }else if(ch !== '\r') cur += ch;
    }
  }
  row.push(cur); rows.push(row);
  rows = rows.filter(function(r){ return r.some(function(c){ return String(c || '').trim() !== ''; }); });
  if(!rows.length) return [];
  var headers = rows[0].map(function(h){ return String(h || '').trim(); });
  return rows.slice(1).map(function(r){
    var obj = {};
    headers.forEach(function(h, idx){ if(h) obj[h] = r[idx] === undefined ? '' : r[idx]; });
    return cleanImportRow(obj);
  });
}

function loadSheetJs(cb){
  if(window.XLSX){ cb(true); return; }
  var existing = document.getElementById('sheetjsLoader');
  if(existing){ existing.addEventListener('load', function(){ cb(!!window.XLSX); }); existing.addEventListener('error', function(){ cb(false); }); return; }
  var sc = document.createElement('script');
  sc.id = 'sheetjsLoader';
  sc.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
  sc.onload = function(){ cb(!!window.XLSX); };
  sc.onerror = function(){ cb(false); };
  document.head.appendChild(sc);
}

function parseImportFile(file, cb){
  var name = (file && file.name || '').toLowerCase();
  if(name.endsWith('.json')){
    var jr = new FileReader();
    jr.onload = function(e){
      try{
        var data = JSON.parse(e.target.result);
        if(!Array.isArray(data)) throw new Error('JSON root is not an array');
        cb(null, data.map(cleanImportRow), 'JSON');
      }catch(err){ cb('Invalid JSON file. Please check the file and try again.'); }
    };
    jr.onerror = function(){ cb('Could not read the JSON file.'); };
    jr.readAsText(file);
    return;
  }
  if(name.endsWith('.csv')){
    var cr = new FileReader();
    cr.onload = function(e){
      try{ cb(null, parseCsvText(e.target.result), 'CSV'); }
      catch(err){ cb('Invalid CSV file. Please check the file and try again.'); }
    };
    cr.onerror = function(){ cb('Could not read the CSV file.'); };
    cr.readAsText(file);
    return;
  }
  if(name.endsWith('.xlsx') || name.endsWith('.xls')){
    loadSheetJs(function(ok){
      if(!ok){ cb('Excel import needs the SheetJS parser. Please check your internet connection, or export the Excel file as CSV and import that.'); return; }
      var xr = new FileReader();
      xr.onload = function(e){
        try{
          var wb = XLSX.read(new Uint8Array(e.target.result), {type:'array'});
          var sheetName = wb.SheetNames[0];
          var ws = wb.Sheets[sheetName];
          var rows = XLSX.utils.sheet_to_json(ws, {defval:'', raw:false});
          cb(null, rows.map(cleanImportRow), 'Excel');
        }catch(err){ cb('Invalid Excel file. Please check the first sheet and try again.'); }
      };
      xr.onerror = function(){ cb('Could not read the Excel file.'); };
      xr.readAsArrayBuffer(file);
    });
    return;
  }
  cb('Unsupported file type. Please import .xlsx, .xls, .csv, or .json.');
}

function importRowsReplaceInventory(rows, sourceLabel){
  rows = (rows || []).map(cleanImportRow).filter(function(r){
    return String(r['MODEL NO.'] || r.model || r['Model No'] || r['Model No.'] || '').trim() !== '';
  });
  if(!rows.length){ alert('No products found. Please make sure the file has a MODEL NO. column.'); return; }
  if(!confirm('Replace the current live inventory with ' + rows.length + ' products from this ' + sourceLabel + ' file?\n\nThis will delete the old live products and upload the imported list.')) return;

  var btn = g('admBtnImport');
  if(btn){ btn.disabled = true; btn.textContent = 'Preparing...'; }
  showSync(true);
  var oldModels = PRODUCTS.map(function(p){ return p.model; }).filter(Boolean);
  var deleteIndex = 0;
  var importIndex = 0;
  var errors = 0;

  function finish(){
    try{ sessionStorage.removeItem(CACHE_KEY); }catch(e){}
    showSync(false);
    if(btn){ btn.disabled = false; btn.textContent = 'Import Excel / CSV'; }
    fetchProducts(function(){ admRefreshAll(); });
    if(errors) alert('Import finished with ' + errors + ' warning(s). Please check the Product Manager list.');
    else alert('Done — imported ' + rows.length + ' products from ' + sourceLabel + '. Images will display from the URLs in the file.');
  }

  function importNext(){
    if(importIndex >= rows.length){ finish(); return; }
    var prod = productRowToInternal(rows[importIndex], importIndex);
    if(btn){ btn.textContent = 'Uploading ' + (importIndex + 1) + '/' + rows.length + '...'; }
    pushUpdate(prod, function(res){ if(!res) errors++; importIndex++; importNext(); });
  }

  function deleteNext(){
    if(deleteIndex >= oldModels.length){ importNext(); return; }
    if(btn){ btn.textContent = 'Deleting old ' + (deleteIndex + 1) + '/' + oldModels.length + '...'; }
    pushDelete(oldModels[deleteIndex], function(res){ if(!res) errors++; deleteIndex++; deleteNext(); });
  }

  deleteNext();
}

function admImportFile(file){
  var btn = g('admBtnImport');
  if(btn){ btn.disabled = true; btn.textContent = 'Reading file...'; }
  parseImportFile(file, function(err, rows, sourceLabel){
    if(btn){ btn.disabled = false; btn.textContent = 'Import Excel / CSV'; }
    if(err){ alert(err); return; }
    importRowsReplaceInventory(rows, sourceLabel || 'imported');
  });
}

function rowVal(row){
  row = row || {};
  for(var i=1;i<arguments.length;i++){
    var key = arguments[i];
    if(row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') return row[key];
  }
  return '';
}

function productRowToInternal(p, idx){
  var price = Number(rowVal(p, 'PRICE', 'Price', 'price', 'SALE PRICE', 'Sale Price') || 0);
  var orig = rowVal(p, 'ORIGPRICE', 'ORIG PRICE', 'Original Price', 'ORIGINAL PRICE', 'origPrice');
  return {
    name: rowVal(p, 'PRODUCT NAME', 'Product Name', 'PRODUCT', 'NAME', 'name'),
    brand: rowVal(p, 'BRAND', 'Brand', 'brand', 'Manufacturer', 'MANUFACTURER'),
    carbrand: rowVal(p, 'CARBRAND', 'CAR BRAND', 'Vehicle Make', 'VEHICLE MAKE', 'Car Brand', 'carbrand'),
    model: rowVal(p, 'MODEL NO.', 'MODEL NO', 'Model No.', 'Model No', 'MODEL', 'model'),
    price: price,
    origPrice: Number(orig || price),
    qty: Number(rowVal(p, 'QTY', 'Qty', 'Quantity', 'QUANTITY', 'qty') || 0),
    tag: rowVal(p, 'STATUS', 'Status', 'status', 'TAG', 'tag') || 'currentstock',
    sortOrder: Number(rowVal(p, 'SORTORDER', 'SORT ORDER', 'ORDER', 'DISPLAY ORDER', 'sortOrder') || idx+1),
    imgs: pickProductImages(p),
    img1Pos: rowVal(p, 'IMG1POS', 'IMG1 POS', 'Image 1 Position') || 'center',
    img2Pos: rowVal(p, 'IMG2POS', 'IMG2 POS', 'Image 2 Position') || 'center',
    img1Zoom: Number(rowVal(p, 'IMG1ZOOM', 'IMG1 ZOOM', 'Image 1 Zoom') || 100),
    img2Zoom: Number(rowVal(p, 'IMG2ZOOM', 'IMG2 ZOOM', 'Image 2 Zoom') || 100),
    imageScale: Number(rowVal(p, 'IMAGE_SCALE', 'IMAGE SCALE', 'IMGSCALE', 'IMG SCALE') || 100),
    refImg: rowVal(p, 'REF IMG', 'Reference Image', 'REFIMG') || ''
  };
}

function replaceWithEmbeddedNewList(){
  var btn = g('admBtnReplaceNewList');
  var newRows = EMBEDDED_NEW_PRODUCT_LIST || [];
  if(!newRows.length){ alert('No embedded new list found in this HTML file.'); return; }
  if(!confirm('Replace the current live inventory with the new list of ' + newRows.length + ' products?\n\nThis will delete the old products from the live sheet and upload the new list.')) return;
  if(btn){ btn.disabled = true; btn.textContent = 'Preparing...'; }
  showSync(true);
  var oldModels = PRODUCTS.map(function(p){ return p.model; }).filter(Boolean);
  var deleteIndex = 0;
  var importIndex = 0;
  var errors = 0;

  function finish(){
    try{ sessionStorage.removeItem(CACHE_KEY); }catch(e){}
    showSync(false);
    if(btn){ btn.disabled = false; btn.textContent = 'Replace With New List'; }
    fetchProducts(function(){ admRefreshAll(); });
    if(errors){
      alert('Finished with ' + errors + ' warning(s). Please check the Product Manager list.');
    }else{
      alert('Done — replaced the inventory with ' + newRows.length + ' products from the new list.');
    }
  }

  function importNext(){
    if(importIndex >= newRows.length){ finish(); return; }
    var prod = productRowToInternal(newRows[importIndex], importIndex);
    if(btn){ btn.textContent = 'Uploading ' + (importIndex+1) + '/' + newRows.length + '...'; }
    pushUpdate(prod, function(res){ if(!res) errors++; importIndex++; importNext(); });
  }

  function deleteNext(){
    if(deleteIndex >= oldModels.length){ importNext(); return; }
    if(btn){ btn.textContent = 'Deleting old ' + (deleteIndex+1) + '/' + oldModels.length + '...'; }
    pushDelete(oldModels[deleteIndex], function(res){ if(!res) errors++; deleteIndex++; deleteNext(); });
  }

  deleteNext();
}

function admExportCsv(){
  var headers = ['BRAND','CARBRAND','PRODUCT NAME','MODEL NO.','PRICE','ORIGPRICE','QTY','STATUS','SORTORDER','IMG1','IMG2','IMG3','IMG4','IMG1POS','IMG2POS','IMG1ZOOM','IMG2ZOOM','IMAGE_SCALE'];
  var rows = [headers.join(',')];
  PRODUCTS.forEach(function(p){
    var vals = [
      p.brand, p.carbrand||'', p.name, p.model,
      p.price, p.origPrice, p.qty, p.tag, p.sortOrder||0,
      p.imgs[0]||'', p.imgs[1]||'', p.imgs[2]||'', p.imgs[3]||'',
      p.img1Pos||'center', p.img2Pos||'center',
      p.img1Zoom||100, p.img2Zoom||100, p.imageScale||100
    ];
    rows.push(vals.map(function(v){ var s=String(v||''); return s.includes(',') || s.includes('"') ? '"'+s.replace(/"/g,'""')+'"' : s; }).join(','));
  });
  var blob = new Blob([rows.join('\n')], {type:'text/csv'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '64cast_export_' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
}

function admDelete(model){
  if(!confirm('Delete this product from the live Google Sheet? This cannot be undone.')) return;
  pushDelete(model, function(){ fetchProducts(function(){ admRefreshAll(); }); });
}

function showAdminLogin(){
  document.getElementById('shop-view').classList.add('hide');
  var lv = document.getElementById('admin-login-view');
  if(lv){ lv.classList.add('show'); lv.style.display='flex'; }
  var form = document.getElementById('adminLoginForm');
  var passInput = document.getElementById('adminPasswordInput');
  var err = document.getElementById('adminLoginError');
  var submitBtn = document.getElementById('adminLoginSubmit');
  if(!form || !passInput) return;
  setTimeout(function(){ passInput.focus(); }, 50);
  if(form.dataset.bound==='1') return;
  form.dataset.bound = '1';
  form.addEventListener('submit', function(e){
    e.preventDefault();
    err.style.display='none'; err.textContent='';
    var pass = passInput.value;
    if(!pass){ err.style.display='block'; err.textContent='Please enter a password.'; return; }
    if(submitBtn){ submitBtn.disabled=true; submitBtn.textContent='Checking...'; }
    adminLogin(pass, function(ok){
      if(submitBtn){ submitBtn.disabled=false; submitBtn.textContent='Login'; }
      if(!ok){ err.style.display='block'; err.textContent='Wrong password. Try again.'; passInput.select(); return; }
      err.style.display='none';
      passInput.value='';
      unlockAdmin();
    });
  });
}

function unlockAdmin(){
  var lv = document.getElementById('admin-login-view');
  if(lv){
    lv.classList.remove('show');
    lv.style.display = 'none';
  }
  document.getElementById('shop-view').classList.add('hide');
  document.getElementById('admin-view').classList.add('show');
  document.title = '64 - Manager';
  var favicon = document.getElementById('siteFavicon');
  if(favicon){
    var greenCircleSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#22c55e"/></svg>';
    favicon.href = 'data:image/svg+xml,' + encodeURIComponent(greenCircleSvg);
  }
  try{ sessionStorage.removeItem(CACHE_KEY); }catch(e){}
  fetchProducts(admRefreshAll);
  g('admBtnAdd').addEventListener('click', admAddOpen);
  g('admBtnImport').addEventListener('click', function(){ g('admImportFile').value=''; g('admImportFile').click(); });
  g('admImportFile').addEventListener('change', function(){ if(this.files[0]) admImportFile(this.files[0]); });
  g('admBtnExport').addEventListener('click', admExportJson);
  g('admBtnExportCsv').addEventListener('click', admExportCsv);
  if(g('admBtnReplaceNewList')) g('admBtnReplaceNewList').addEventListener('click', replaceWithEmbeddedNewList);
  g('admBtnLogout').addEventListener('click', function(){ clearAdminToken(); window.location.href = window.location.pathname; });
  g('admBtnRefresh').addEventListener('click', function(){ try{ sessionStorage.removeItem(CACHE_KEY); }catch(e){} fetchProducts(admRefreshAll); });
  g('admBtnSaveOrder').addEventListener('click', saveManualOrder);
  
  g('admMCloseBtn').addEventListener('click', admClose);
  g('admMCancelBtn').addEventListener('click', admClose);
  g('admMSaveBtn').addEventListener('click', admSave);
  g('admSearch').addEventListener('input', admTable);
  g('admFilterTag').addEventListener('change', admTable);
  g('admFilterBrand').addEventListener('change', admTable);
  if(g('admFilterCarbrand')) g('admFilterCarbrand').addEventListener('change', admTable);
  g('admEditOverlay').addEventListener('click', function(e){ if(e.target===this) admClose(); });
}

function initAdmin(){
  document.getElementById('shop-view').classList.add('hide');
  verifyAdminSession(function(valid){
    if(!valid){ showAdminLogin(); return; }
    unlockAdmin();
  });
}

if(isAdmin){ window.location.href = '/admin-8822'; } else { initShop(); }

})();




(function(){
  function bindGridCartAnimation(){
    document.addEventListener('click', function(e){
      var btn = e.target.closest && e.target.closest('.card-cart-btn');
      if(!btn) return;
      btn.classList.remove('cart-pop');
      void btn.offsetWidth;
      btn.classList.add('cart-pop');
      setTimeout(function(){ btn.classList.remove('cart-pop'); }, 620);
    }, true);
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', bindGridCartAnimation);
  }else{
    bindGridCartAnimation();
  }
})();




(function(){
  function fixText(value){
    return value.replace(/\u00D0\s*/g, 'AED ').replace(/AED\s*/g, 'AED ');
  }
  function patchCurrency(root){
    (root || document).querySelectorAll('*').forEach(function(el){
      if(el.children.length) return;
      var text = el.textContent;
      if(text && (text.indexOf('AED') !== -1 || text.indexOf('\u00D0') !== -1)){
        el.textContent = fixText(text);
      }
    });
  }
  function run(){
    patchCurrency(document);
    setTimeout(function(){ patchCurrency(document); }, 500);
    setTimeout(function(){ patchCurrency(document); }, 1500);
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', run);
  }else{
    run();
  }
  var observer = new MutationObserver(function(muts){
    muts.forEach(function(m){
      if(!m.addedNodes) return;
      m.addedNodes.forEach(function(n){
        if(n.nodeType === 1){
          patchCurrency(n);
        }else if(n.nodeType === 3 && n.nodeValue && (n.nodeValue.indexOf('AED') !== -1 || n.nodeValue.indexOf('\u00D0') !== -1)){
          n.nodeValue = fixText(n.nodeValue);
        }
      });
    });
  });
  observer.observe(document.documentElement, {childList:true, subtree:true});
})();




(function(){
  function setImportant(el, prop, value){
    if(el) el.style.setProperty(prop, value, 'important');
  }
  function alignFilterBar(){
    var headerGroup = document.querySelector('.sticky-header-group');
    var filterRow = document.querySelector('.listing-filters-row');
    if(!headerGroup || !filterRow) return;
    var groupH = headerGroup.getBoundingClientRect().height;
    if(groupH > 0){
      setImportant(filterRow, 'top', groupH + 'px');
    }
  }
  function run(){
    alignFilterBar();
    setTimeout(alignFilterBar, 300);  // re-check after web fonts/images settle
    setTimeout(alignFilterBar, 1000);
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', run);
  }else{
    run();
  }
  window.addEventListener('resize', alignFilterBar);
})();



(function(){
  function norm(v){ return String(v == null ? '' : v).trim(); }
  function modelOf(p){ return norm(p && (p['MODEL NO.'] || p.model || p.modelNo)); }
  function statusOf(p){ return norm(p && (p.STATUS || p.status)).toLowerCase(); }
  function isNewArrivalProductLocal(p){
    if(p && p.newArrival) return true;
    var v = norm(p && (p.NEWARRIVAL || p['NEW ARRIVAL'] || p.newArrival || p.newarrival)).toLowerCase();
    return v === 'yes' || v === 'true' || v === '1' || v === 'new';
  }
  function isPreOrderProduct(p){
    var s = statusOf(p).replace(/[\s_-]/g,'');
    return s === 'preorder' || s === 'preorders';
  }
  function currentRoute(){
    return location.pathname.replace(/^\/+|\/+$/g,'').toLowerCase();
  }
  function productFromCard(card){
    var model = card.getAttribute('data-model') || '';
    var btn = card.querySelector('[data-model]');
    if(!model && btn) model = btn.getAttribute('data-model') || '';
    var imgs = card.querySelectorAll('img[src]');
    if(!model && imgs.length){
      imgs.forEach(function(img){
        var m = (img.getAttribute('src') || '').match(/\/PI\/([^\/?#]+?)(?:-\d\d)?\.(?:jpg|jpeg|png|webp)/i);
        if(m && !model) model = m[1];
      });
    }
    return (window.PRODUCTS || []).find(function(p){ return modelOf(p) === model; }) || null;
  }
  function applyRouteFilterAndBadges(){
    if(!window.PRODUCTS) return;
    var route = currentRoute();
    var cards = Array.from(document.querySelectorAll('.pcard'));
    var shown = 0;

    cards.forEach(function(card){
      var p = productFromCard(card);
      if(!p) return;

      var show = true;
      if(route === 'new-arrivals'){
        show = isNewArrivalProductLocal(p) && shown < 100;
      }else if(route === 'pre-order' || route === 'pre-orders' || route.indexOf('pre-order/') === 0 || route.indexOf('pre-orders/') === 0){
        show = isPreOrderProduct(p);
      }

      card.style.display = show ? '' : 'none';
      if(show) shown++;

      var eta = norm(p.ETA || p.eta);
      var body = card.querySelector('.pcard-body-inner') || card.querySelector('.pcard-body');
      if(eta && body && !card.querySelector('.pcard-eta')){
        var e = document.createElement('div');
        e.className = 'pcard-eta';
        e.textContent = 'ETA ' + eta;
        body.appendChild(e);
      }

      if(isNewArrivalProductLocal(p) && !card.querySelector('.pcard-new-badge')){
        var b = document.createElement('div');
        b.className = 'pcard-new-badge';
        b.textContent = 'New';
        (card.querySelector('.pcard-img') || card).appendChild(b);
      }
    });

    var count = document.getElementById('filter-count');
    if(count && (route === 'new-arrivals' || route.indexOf('new-arrivals/') === 0 || route === 'pre-order' || route === 'pre-orders' || route.indexOf('pre-order/') === 0 || route.indexOf('pre-orders/') === 0)){
      var qty = 0;
      document.querySelectorAll('.pcard').forEach(function(card){
        if(card.style.display === 'none') return;
        var pp = productFromCard(card);
        if(pp) qty += Number(pp.QTY || pp.qty || 0) || 0;
      });
      count.textContent = '(' + qty + ')';
    }
  }

  function applyPreviewETA(){ /* superseded — ETA is now set directly in openPreview() */ }

  setInterval(function(){
    applyRouteFilterAndBadges();
    applyPreviewETA();
  }, 500);
})();



(function(){
  function productRouteModel(){
    var path = location.pathname.replace(/^\/+|\/+$/g,'');
    var m = path.match(/^product\/([^\/?#]+)$/i);
    if(m) return decodeURIComponent(m[1]);
    return new URLSearchParams(location.search).get('product') || '';
  }
  function openProductFromRoute(){
    var model = productRouteModel();
    if(!model) return;
    var tries = 0;
    var timer = setInterval(function(){
      tries++;
      try{
        if(typeof openPreview === 'function'){ openPreview(model); clearInterval(timer); }
        else if(typeof openProduct === 'function'){ openProduct(model); clearInterval(timer); }
        else if(typeof showProduct === 'function'){ showProduct(model); clearInterval(timer); }
        else if(tries > 20){ clearInterval(timer); }
      }catch(e){ if(tries > 20) clearInterval(timer); }
    }, 300);
  }
  window.productShareUrl = function(p){
    var model = '';
    try{
      model = (p && (p.model || p.modelNo || p['MODEL NO.'])) || '';
      if(!model && typeof cartModel === 'function') model = cartModel(p);
    }catch(e){}
    model = String(model || '').trim();
    return location.origin + '/product/' + encodeURIComponent(model);
  };
  document.addEventListener('DOMContentLoaded', openProductFromRoute);
  setTimeout(openProductFromRoute, 700);
})();



(function(){
  function norm(v){return String(v==null?'':v).trim();}
  function slug(v){return norm(v).toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');}
  function titleFromSlug(v){return norm(v).split('-').filter(Boolean).map(function(x){return x==='gt'?'GT':x==='cm'?'CM':x==='bbr'?'BBR':x.charAt(0).toUpperCase()+x.slice(1);}).join(' ');}
  function route(){var parts=location.pathname.replace(/^\/+|\/+$/g,'').toLowerCase().split('/').filter(Boolean);var first=parts[0]||'';if(!first)return{type:'home',brandSlug:''};if(first==='current-stock'||first==='current-stocks')return{type:'current',brandSlug:parts[1]||''};if(first==='pre-order'||first==='pre-orders'||first==='preorders')return{type:'preorder',brandSlug:parts[1]||''};if(first==='new-arrivals')return{type:'new',brandSlug:parts[1]||''};if(parts.length>2)return{type:'current',brandSlug:''};return{type:'brand',brandSlug:first};}
  function productBrand(p){return norm(p&&(p.brand||p.BRAND));}
  function productModel(p){return norm(p&&(p.model||p['MODEL NO.']||p.modelNo));}
  function productName(p){return norm(p&&(p.name||p['PRODUCT NAME']));}
  function productStatus(p){return norm(p&&(p.tag||p.STATUS||p.status)).toLowerCase().replace(/[\s_-]+/g,'');}
  function isPre(p){var s=productStatus(p);return s==='preorder'||s==='preorders';}
  function isSold(p){var s=productStatus(p);return Number(p&&(p.qty||p.QTY))===0||s==='sold'||s==='soldout'||s==='outofstock';}
  function brandNameFromSlug(brandSlug){var found='';(window.PRODUCTS||[]).some(function(p){var b=productBrand(p);if(slug(b)===brandSlug){found=b;return true;}return false;});return found||titleFromSlug(brandSlug);}
  function hideStatusInFilter(){var t=document.querySelector('.filter-status-title');var o=document.getElementById('statusDrawerOptions');if(t)t.style.display='none';if(o){o.style.display='none';o.innerHTML='';}}
  function renderMenuBrands(){var body=document.querySelector('.menu-panel-body');if(!body)return;var brands=Array.from(new Set((window.PRODUCTS||[]).map(productBrand).filter(Boolean))).sort(function(a,b){return a.localeCompare(b);});if(!brands.length)return;var key=brands.join('|');var old=body.querySelector('.menu-brand-section');if(old&&old.dataset.brandsKey===key)return;var wasOpen=old&&old.classList.contains('open');var html='<div class="menu-brand-section'+(wasOpen?' open':'')+'" data-brands-key="'+key.replace(/"/g,'&quot;')+'"><button class="menu-brand-toggle" type="button"><span>SHOP BY BRANDS</span><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"></path></svg></button><div class="menu-brand-list">'+brands.map(function(b){return '<a class="menu-brand-item" href="/'+slug(b)+'">'+b+'</a>';}).join('')+'</div></div>';if(old){old.outerHTML=html;}else{var pre=Array.from(body.querySelectorAll('.menu-link')).find(function(a){return (a.textContent||'').toLowerCase().indexOf('whatsapp')!==-1;});if(pre)pre.insertAdjacentHTML('beforebegin',html);else body.insertAdjacentHTML('beforeend',html);}var section=body.querySelector('.menu-brand-section');var toggle=body.querySelector('.menu-brand-toggle');if(toggle&&!toggle.dataset.bound){toggle.dataset.bound='1';toggle.addEventListener('click',function(){section.classList.toggle('open');});}}
  function renderBrandSwitch(){var r=route();var old=document.querySelector('.brand-stock-switch');if(old)old.remove();if(!r.brandSlug||r.type==='new')return;var header=document.querySelector('.listing-header')||document.getElementById('shop-view');if(!header)return;var b=brandNameFromSlug(r.brandSlug);var html='<div class="brand-stock-switch" aria-label="Brand stock switch"><a href="/'+r.brandSlug+'" class="'+(r.type==='brand'?'active':'')+'">All</a><a href="/current-stock/'+r.brandSlug+'" class="'+(r.type==='current'?'active':'')+'">Current Stock</a><a href="/pre-order/'+r.brandSlug+'" class="'+(r.type==='preorder'?'active':'')+'">Pre-Order</a></div>';header.insertAdjacentHTML('afterend',html);}
  function applyTitles(){var r=route();var listing=document.getElementById('listingTitle');var pageTitle='64CAST : Diecast model UAE';if(r.brandSlug){var b=brandNameFromSlug(r.brandSlug);if(listing)listing.textContent=b.toUpperCase();pageTitle=b.toUpperCase()+' | 64CAST';}else if(r.type==='preorder'){if(listing)listing.textContent='PRE-ORDER';pageTitle='PRE-ORDER | 64CAST';}else if(r.type==='new'){if(listing)listing.textContent='NEW ARRIVALS';pageTitle='NEW ARRIVALS | 64CAST';}else{if(listing)listing.textContent='CURRENT STOCKS';}document.title=pageTitle;var og=document.querySelector('meta[property="og:title"]');if(og)og.setAttribute('content',pageTitle);var tw=document.querySelector('meta[name="twitter:title"]');if(tw)tw.setAttribute('content',pageTitle);}
  function applyETA(){ /* superseded — ETA is now set directly in openPreview() */ }
  function updateCount(){var count=document.getElementById('filter-count')||document.getElementById('filterCountNum');if(!count)return;var qty=0;document.querySelectorAll('.pcard').forEach(function(card){if(card.style.display==='none')return;var m=card.getAttribute('data-model')||card.getAttribute('data-preview')||'';var p=(window.PRODUCTS||[]).find(function(x){return productModel(x)===m;});if(p)qty+=Number(p.qty||p.QTY||0)||0;});count.textContent='('+qty+')';}
  function updateMenuActive(){
    var r=route();
    document.querySelectorAll('.menu-link').forEach(function(a){a.classList.remove('active');});
    var links=Array.from(document.querySelectorAll('.menu-link'));
    var target=null;
    if(r.type==='preorder') target=links.find(function(a){return /pre-order/i.test(a.textContent);});
    else if(r.type==='new') target=links.find(function(a){return /new arrivals/i.test(a.textContent);});
    else target=links.find(function(a){return /current stocks/i.test(a.textContent);});
    if(target) target.classList.add('active');
  }
  // Status-filter buttons are hidden (hideStatusInFilter) — brand-page pills (renderBrandSwitch)
  // navigate instead, so clicks on the old buttons are no-ops.
  document.addEventListener('click',function(e){var btn=e.target&&e.target.closest?e.target.closest('[data-statusfilter]'):null;if(!btn)return;e.preventDefault();e.stopImmediatePropagation();return false;},true);
  function tick(){hideStatusInFilter();renderMenuBrands();renderBrandSwitch();applyTitles();applyETA();updateCount();updateMenuActive();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',tick);else tick();
  setInterval(tick,1000);
})();
