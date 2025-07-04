// dashboard.js (updated)
const GAS_URL      = '${NEW_GAS_URL}';
const MAPS_API_KEY = '${MAPS_KEY}';

// Sidebar toggle
document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  document.querySelectorAll('.btn-toggle').forEach(btn =>
    btn.addEventListener('click', () => sidebar.classList.toggle('active'))
  );
});

// Google Maps picker init
function initMap() {
  const map = new google.maps.Map(document.getElementById('map'), {
    center: { lat:-17.8249, lng:31.0498 },
    zoom: 6
  });
  const marker = new google.maps.Marker({ map, draggable:true });
  const input = document.getElementById('mapSearchInput');
  const ac = new google.maps.places.Autocomplete(input);
  ac.bindTo('bounds', map);
  ac.addListener('place_changed', () => {
    const p = ac.getPlace();
    if (p.geometry) {
      map.setCenter(p.geometry.location);
      marker.setPosition(p.geometry.location);
      document.getElementById('latitude').value  = p.geometry.location.lat();
      document.getElementById('longitude').value = p.geometry.location.lng();
    }
  });
  const geo = new google.maps.Geocoder();
  marker.addListener('dragend', () => {
    geo.geocode({ latLng: marker.getPosition() }, (res, status) => {
      if (status==='OK' && res[0]) {
        input.value = res[0].formatted_address;
        document.getElementById('latitude').value  = res[0].geometry.location.lat();
        document.getElementById('longitude').value = res[0].geometry.location.lng();
      }
    });
  });
}

// Helper to POST JSON
async function postJSON(data) {
  const r = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return r.json();
}

// Form handlers
document.addEventListener('DOMContentLoaded', () => {
  const appForm = document.getElementById('appForm');
  if (appForm) appForm.addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target;
    const toB64 = file => new Promise(r => {
      const fr = new FileReader();
      fr.onload = () => r(fr.result.split(',')[1]);
      fr.readAsDataURL(file);
    });
    const data = { mode: 'applyTeacher' };
    new FormData(f).forEach((v,k) => data[k]=v);
    const [r64,d64] = await Promise.all([
      toB64(f.resume.files[0]), 
      toB64(f.docs.files[0])
    ]);
    data.resumeBase64 = r64; data.resumeName = f.resume.files[0].name;
    data.docsBase64   = d64; data.docsName   = f.docs.files[0].name;
    const json = await postJSON(data);
    document.getElementById('ok').textContent  = json.success ? 'Application submitted!' : '';
    document.getElementById('err').textContent = json.success ? '' : (json.error||'Submission error');
  });

  const regForm = document.getElementById('registerForm');
  if (regForm) regForm.addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target;
    const data = { mode: 'registerLearner' };
    new FormData(f).forEach((v,k) => data[k]=v);
    if (data.password !== data.confirmPassword) {
      return document.getElementById('err').textContent = 'Passwords do not match';
    }
    const json = await postJSON(data);
    document.getElementById('ok').textContent  = json.success ? 'Check your email to verify' : '';
    document.getElementById('err').textContent = json.success ? '' : (json.error||'Registration error');
  });
});
