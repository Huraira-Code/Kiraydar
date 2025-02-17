import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import Logo from '../resource/logo.png';
import Icon from 'react-native-vector-icons/FontAwesome';

const Prelogin = ({navigation}) => {
  function switchScreen(location) {
    navigation.navigate(location);
  }
  return (
    <SafeAreaView style={styles.main}>
      <Image style={styles.logoImage} source={Logo}></Image>
      <Text style={styles.mainFont}>kirayedar</Text>
      <View style={styles.bottomContainer}>
        <Pressable
          style={styles.bottomButtonContainer}
          onPress={() => {
            switchScreen('Login');
          }}>
          <Icon
            style={{color: '#0a8ed9', marginRight: 29}}
            name="mobile-phone"
            size={40}
            color="#900"></Icon>
          <Text style={{fontSize: 18, fontFamily: 'Abel-Regular'}}>
            Continue with Email
          </Text>
        </Pressable>
        <Pressable style={[styles.bottomButtonContainer, {marginTop: 14}]}>
          <Icon
            style={{
              color: '#0a8ed9',
              marginRight: 15,
              fontSize: 24,
            }}
            name="google-plus"
            size={40}
            color="#900"></Icon>
          <Text style={{fontSize: 18, fontFamily: 'Abel-Regular'}}>
            Continue with Google
          </Text>
        </Pressable>
        <Text
          style={{
            fontSize: 20,
            color: 'white',
            marginTop: 12,
            marginBottom: 9,
            fontWeight: '300',
            fontFamily: 'Abel-Regular',
          }}>
          OR
        </Text>
        <Pressable
          onPress={() => {
            switchScreen('SignUp');
          }}>
          <Text
            style={{
              color: 'white',
              fontSize: 20,
              fontWeight: '300',
              textDecorationLine: 'underline',
              marginBottom: 30,
              fontFamily: 'Abel-Regular',
            }}>
            Signup with Email
          </Text>
        </Pressable>
        <Text
          style={{
            textAlign: 'center',
            color: 'white',
            fontSize: 15,
            fontWeight: 300,
            marginBottom: 12,
            width: '90%',
            fontFamily: 'Abel-Regular',
          }}>
          if you countinue, you are accepting{'\n'}kirayedar{' '}
          <Text style={{textDecorationLine: 'underline'}}>
            Term and conditions and privacy policy
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default Prelogin;

const styles = StyleSheet.create({
  main: {
    backgroundColor: 'white',
    height: '100%',
  },
  logoImage: {
    width: '60%',
    height: '30%',
    marginHorizontal: 'auto',
    marginTop: '20%',
  },
  mainFont: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0a8ed9',
    marginHorizontal: 'auto',
    marginTop: 12,
  },
  bottomContainer: {
    alignItems: 'center',
    backgroundColor: '#0a8ed9',
    marginTop: 'auto',
    paddingTop: '10%',
  },
  bottomButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    height: 50,
    width: '85%',
    backgroundColor: '#d9d9d9',
    paddingHorizontal: '5%',
  },
});
