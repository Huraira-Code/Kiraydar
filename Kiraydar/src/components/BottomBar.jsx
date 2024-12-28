import {TouchableOpacity, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import AwesomeIcon from 'react-native-vector-icons/FontAwesome';
import {useNavigation} from '@react-navigation/native';

const BottomBar = () => {
  const navigation = useNavigation();

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingTopTop: 20,
        paddingBottom: 10,
        paddingTop: 10,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.6,
        shadowRadius: 4,
        // Android shadow (elevation)
        elevation: 5,
      }}>
      <TouchableOpacity
        style={[styles.box]}
        onPress={() => navigation.navigate('MainScreen')}>
        <AwesomeIcon style={[styles.boxIcon]} name="home"></AwesomeIcon>
        <Text style={[styles.boxText]}>HOME</Text>
      </TouchableOpacity>
      <TouchableOpacity  onPress={() => navigation.navigate('ChatScreen')} style={[styles.box]}>
        <AwesomeIcon style={[styles.boxIcon]} name="wechat"></AwesomeIcon>
        <Text style={[styles.boxText]}>CHATS</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate('AddProperty')}
        style={[styles.box]}>
        <AwesomeIcon
          style={[styles.boxIcon, {fontSize: 40}]}
          name="plus-square-o"></AwesomeIcon>
        <Text style={[styles.boxText]}>SELL</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.box]}
        onPress={() => navigation.navigate('MyAds')}>
        <AwesomeIcon style={[styles.boxIcon]} name="heart-o"></AwesomeIcon>
        <Text style={[styles.boxText]}>MY ADS</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.box]}
        onPress={() => navigation.navigate('Profile')}>
        <AwesomeIcon style={[styles.boxIcon]} name="user"></AwesomeIcon>
        <Text style={[styles.boxText]}>ACCOUNT</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BottomBar;

const styles = StyleSheet.create({
  box: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxIcon: {
    fontSize: 28,
    color: '#0a8ed9',
  },
  boxText: {
    fontSize: 8,
  },
});
