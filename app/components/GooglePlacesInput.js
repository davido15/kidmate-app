import React from 'react';
import { Image, Text } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
 
const GooglePlacesInput = () => {
  return (
    <GooglePlacesAutocomplete
      placeholder='Search'
      onPress={(data, details = null) => {
        // 'details' is provided when fetchDetails = true
        console.log(data, details);
      }}
      query={{
        key: 'AIzaSyAL-w4b6yXUQEiQCNuVOq1FUmZcfha3eW',
        language: 'en',
      }}
    />
  );
};
 
const styles = StyleSheet.create({
  container:{
    flex:1,
    margin:50
  }
})
export default GooglePlacesInput;