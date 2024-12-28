import {
  Button,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React from 'react';
import Logo from '../resource/locationLogo.png';
import Icon from 'react-native-vector-icons/Entypo';

const LocationScreen = () => {
 
  return (
    <ScrollView style={styles.main}>
      <Image
        style={{
          width: '65%',
          height: 350,
          marginHorizontal: 'auto',
          marginTop: 70,
        }}
        source={Logo}></Image>
      <Text
        style={[
          styles.TextStyle,
          {marginTop: 15, marginBottom: 10, fontSize: 25, fontWeight: '700'},
        ]}>
        Where is your location?
      </Text>
      <Text style={[styles.TextStyle, {marginHorizontal: 13}]}>
        enjoy a personalized selling and buying experiance by telling us your
        location
      </Text>
      <Pressable
        style={{
          backgroundColor: '#0a8ed9',
          width: '90%',
          marginHorizontal: 'auto',
          paddingVertical: 12,
          borderRadius: 5,
          marginTop: 30,
          flexDirection: 'row',
          justifyContent: 'center',
        }}>
        <Icon
          name="location-pin"
          style={{fontSize: 25, color: 'white', marginRight: 5}}></Icon>
        <Text
          style={{
            color: 'white',
            fontSize: 20,
            fontFamily: 'Abel-Regular',
          }}>
          Find My Location
        </Text>
      </Pressable>
    </ScrollView>
  );
};

export default LocationScreen;

const styles = StyleSheet.create({
  main: {
    backgroundColor: 'white',
  },
  TextStyle: {
    fontSize: 15,
    textAlign: 'center',
    fontFamily: 'Abel-Regular',
  },
});
