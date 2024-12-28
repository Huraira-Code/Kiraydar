import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import Logo from '../resource/logo.png';
import Avatar from '../resource/avatar.png';
import Wallet from '../resource/wallet.png';
import Help from '../resource/help.png';
import Gear from '../resource/gear.png';
import {StreamChat} from 'stream-chat';
import {ScrollView} from 'react-native-virtualized-view';
import BottomBar from '../components/BottomBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
const Profile = ({navigation}) => {
  const chatClient = StreamChat.getInstance('STREAM_API_KEY'); // Replace with your API key

  const handleLogout = async () => {
    try {
      // Disconnect the user
      await chatClient.disconnectUser();
      console.log('User disconnected successfully.');
      await AsyncStorage.removeItem('token');
      navigation.reset({
        index: 0, // Start at the first screen
        routes: [{name: 'Login'}], // Replace with the 'Login' screen
      });
      // Clear any local storage or authentication tokens if needed
      // Example: AsyncStorage.removeItem('authToken'); (React Native)
    } catch (error) {
      console.error('Error disconnecting user:', error);
    }
  };
  return (
    <>
      <ScrollView style={styles.container}>
        <View>
          <Image style={styles.logoImage} source={Logo}></Image>
        </View>
        <View style={styles.imageContainer}>
          <Image source={Avatar} style={styles.avatarImage}></Image>
          <Text style={styles.avatarText}>Huraira Shahid</Text>
        </View>
        <TouchableOpacity style={styles.EditTextContainer}>
          <Text style={styles.EditText}>View and Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.EditTextContainer}>
          <Text style={styles.EditText}>Logout From Profile</Text>
        </TouchableOpacity>
        <View>
          <TouchableOpacity style={[styles.SearchContainer, {marginTop: 20}]}>
            <Image source={Wallet} style={styles.ColonImage}></Image>
            <View style={{textAlign: 'left', marginLeft: 8}}>
              <Text style={styles.SearchContainerHeading}>
                {' '}
                Buy packages & My orders
              </Text>
              <Text style={styles.SearchContainerText}>
                {' '}
                packages,orders,billing and invoices
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.SearchContainer, {marginTop: 20}]}>
            <Image source={Gear} style={styles.ColonImage}></Image>
            <TouchableOpacity
              onPress={handleLogout}
              style={{textAlign: 'left', marginLeft: 8}}>
              <Text style={styles.SearchContainerHeading}> Settings</Text>
              <Text style={styles.SearchContainerText}> Privacy Policy</Text>
            </TouchableOpacity>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.SearchContainer, {marginTop: 20}]}>
            <Image source={Help} style={styles.ColonImage}></Image>
            <View style={{textAlign: 'left', marginLeft: 8}}>
              <Text style={styles.SearchContainerHeading}> Help & support</Text>
              <Text style={styles.SearchContainerText}>
                {' '}
                Help centre and legal terms
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.SearchContainer, {marginTop: 20}]}>
            <Image source={Wallet} style={styles.ColonImage}></Image>
            <View style={{textAlign: 'left', marginLeft: 8}}>
              <Text style={styles.SearchContainerHeading}>
                {' '}
                Select language
              </Text>
              <Text style={styles.SearchContainerText}> English</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomBar></BottomBar>
    </>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    backgroundColor: 'white',
  },
  logoImage: {
    width: 70,
    height: 70,
    marginTop: 10,
  },
  imageContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  avatarImage: {
    width: 110,
    height: 110,
  },
  avatarText: {
    fontSize: 24,
    color: 'black',
    marginLeft: 5,
    fontFamily: 'Abel-Regular',
  },
  EditTextContainer: {
    backgroundColor: '#0a8ed9',
    marginTop: 10,
  },
  EditText: {
    fontSize: 18,
    color: 'white',
    marginHorizontal: 'auto',
    marginVertical: 10,
    fontFamily: 'Abel-Regular',
    borderRadius: 10,
  },
  SearchContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingBottom: 15,
    borderBottomColor: '#808080',
  },
  SearchContainerHeading: {
    color: '#000',
    fontSize: 20,
  },
  SearchContainerText: {
    color: 'grey',
    fontSize: 15,
  },
  ColonImage: {
    width: 50,
    height: 50,
  },
});
