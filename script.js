
// Elements
const toggleBtn = document.getElementById('toggleLang');
const title = document.getElementById('title');
const description = document.getElementById('description');
const lblProd = document.getElementById('lblProd');
const lblExp = document.getElementById('lblExp');
const lblToday = document.getElementById('lblToday');
const lblTodayHijri = document.getElementById('lblTodayHijri');
const todayGregorian = document.getElementById('todayGregorian');
const todayHijri = document.getElementById('todayHijri');
const prodInput = document.getElementById('productionDate');
const expInput = document.getElementById('expiryDate');
const calcBtn = document.getElementById('calcBtn');
const result = document.getElementById('result');
const resultText = document.getElementById('resultText');

let currentLang = 'ar'; // default

// Text resources
const TEXT = {
  ar: {
    title: 'نسبة صلاحية المنتج الغذائي',
    description: 'احسب نسبة صلاحية المنتج الغذائي بسهولة بإدخال تاريخ الإنتاج والانتهاء.',
    prod: 'تاريخ الإنتاج',
    exp: 'تاريخ الانتهاء',
    today: 'تاريخ اليوم (ميلادي)',
    todayHijri: 'التاريخ الهجري',
    calc: 'احسب النسبة',
    result_in: (p, r) => `تم استهلاك ${p}% من مدة الصلاحية، وبقي ${r}%`,
    result_out: 'تاريخ الإنتاج يجب أن يسبق تاريخ الانتهاء.',
    result_future: 'المنتج لم يبدأ بعد (تاريخ الإنتاج في المستقبل).',
    footer: '© أسواق التميمي - Tamimi Markets',
    switchBtn: 'English'
  },
  en: {
    title: 'Food Product Shelf Life Calculator',
    description: 'Calculate the percentage of product shelf life by entering production and expiry dates.',
    prod: 'Production Date',
    exp: 'Expiry Date',
    today: "Today's Date (Gregorian)",
    todayHijri: 'Hijri Date',
    calc: 'Calculate percentage',
    result_in: (p, r) => `${p}% of shelf life has passed, ${r}% remaining`,
    result_out: 'Production date must be before expiry date.',
    result_future: 'Product has not started yet (production date is in the future).',
    footer: '© Tamimi Markets',
    switchBtn: 'ع'
  }
};

// Initialize
function setLang(lang){
  currentLang = lang;
  document.body.classList.remove('ar','en');
  document.body.classList.add(lang === 'ar' ? 'ar' : 'en');
  document.documentElement.lang = (lang === 'ar') ? 'ar' : 'en';
  title.textContent = TEXT[lang].title;
  description.textContent = TEXT[lang].description;
  lblProd.textContent = TEXT[lang].prod;
  lblExp.textContent = TEXT[lang].exp;
  lblToday.textContent = TEXT[lang].today;
  lblTodayHijri.textContent = TEXT[lang].todayHijri;
  calcBtn.textContent = TEXT[lang].calc;
  toggleBtn.textContent = TEXT[lang].switchBtn;
}
toggleBtn.addEventListener('click', () => {
  setLang(currentLang === 'ar' ? 'en' : 'ar');
});

// Date helpers
function pad(n){return n<10?'0'+n:n;}
function formatGregorian(d){
  return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate());
}

// Convert Gregorian date to Julian Day Number
function gregorianToJd(year, month, day){
  if(month <= 2){ year -= 1; month += 12; }
  const A = Math.floor(year/100);
  const B = 2 - A + Math.floor(A/4);
  const jd = Math.floor(365.25*(year+4716)) + Math.floor(30.6001*(month+1)) + day + B - 1524.5;
  return jd;
}

// Convert Islamic (tabular) to JD
function islamicToJd(year, month, day){
  return day + Math.ceil(29.5*(month-1)) + (year-1)*354 + Math.floor((3 + 11*year)/30) + 1948439.5 - 1;
}

// JD to Islamic (tabular)
function jdToIslamic(jd){
  jd = Math.floor(jd) + 0.5;
  const days = jd - 1948439.5;
  const year = Math.floor((30*days + 10646) / 10631);
  const start = islamicToJd(year, 1, 1);
  let month = Math.ceil((jd - start + 1) / 29.5);
  if(month > 12) month = 12;
  const day = Math.floor(jd - islamicToJd(year, month, 1) + 1);
  return { year, month, day };
}

function updateTodayDisplays(){
  const now = new Date();
  todayGregorian.textContent = formatGregorian(now);
  const jd = gregorianToJd(now.getFullYear(), now.getMonth()+1, now.getDate());
  const h = jdToIslamic(jd);
  todayHijri.textContent = `${h.year}-${String(h.month).padStart(2,'0')}-${String(h.day).padStart(2,'0')}`;
}

// Calculation
function calculate(){
  result.classList.add('hidden');
  const prodVal = prodInput.value;
  const expVal = expInput.value;
  if(!prodVal || !expVal) {
    alert(currentLang === 'ar' ? 'الرجاء إدخال تاريخي الإنتاج والانتهاء.' : 'Please enter production and expiry dates.');
    return;
  }
  const prod = new Date(prodVal + 'T00:00:00');
  const exp = new Date(expVal + 'T00:00:00');
  const today = new Date();
  // normalize time portion
  prod.setHours(0,0,0,0); exp.setHours(0,0,0,0); today.setHours(0,0,0,0);

  if(prod > exp){
    resultText.textContent = TEXT[currentLang].result_out;
    result.classList.remove('hidden');
    return;
  }
  if(today < prod){
    resultText.textContent = TEXT[currentLang].result_future;
    result.classList.remove('hidden');
    return;
  }

  const total = (exp - prod) / (1000*60*60*24); // days
  const passed = (today - prod) / (1000*60*60*24);
  let percentPassed = Math.round((passed / total) * 100);
  if(percentPassed < 0) percentPassed = 0;
  if(percentPassed > 100) percentPassed = 100;
  const remaining = 100 - percentPassed;
  resultText.textContent = TEXT[currentLang].result_in(percentPassed, remaining);
  result.classList.remove('hidden');
}

// Set initial values and event hookups
updateTodayDisplays();
setInterval(updateTodayDisplays, 60*60*1000); // update hourly (day changes will be covered)
calcBtn.addEventListener('click', calculate);

// Pre-fill today's date in inputs as placeholders (not required)
const todayISO = new Date().toISOString().slice(0,10);
if(!prodInput.value) prodInput.setAttribute('placeholder', '');
if(!expInput.value) expInput.setAttribute('placeholder', '');

// default language
setLang('ar');
