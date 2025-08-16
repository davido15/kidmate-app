// Test Google Places API Key
const API_KEY = process.env.GOOGLE_PLACES_API_KEY || 'YOUR_API_KEY_HERE';

// Test URL for Google Places API
const testUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=restaurant&inputtype=textquery&fields=formatted_address,name,geometry&key=${API_KEY}`;

console.log('Testing Google Places API...');
console.log('API Key:', API_KEY.substring(0, 10) + '...');
console.log('Test URL:', testUrl);

// You can test this URL in your browser or use fetch in a web environment
fetch(testUrl)
  .then(response => response.json())
  .then(data => {
    console.log('API Response:', data);
    if (data.status === 'OK') {
      console.log('✅ API Key is working!');
      console.log('Found places:', data.candidates?.length || 0);
    } else {
      console.log('❌ API Error:', data.status, data.error_message);
    }
  })
  .catch(error => {
    console.log('❌ Network Error:', error.message);
  }); 