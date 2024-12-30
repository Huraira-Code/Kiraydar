import {
  Image,
  TextInput,
  Pressable,
  StyleSheet,
  Text,
  Button,
  View,
  ScrollView,
  Modal,
} from 'react-native';
import {TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import Logo from '../resource/logo.png';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Formik} from 'formik';
import axios from 'axios';
import {BASE_URL} from '../api';

import {API_KEY} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loading from '../components/Loading';
const SignUp = ({navigation}) => {
  const [error, setError] = useState(false);
  const [errorValue, setErrorValue] = useState([]);
    const [loading, setLoading] = useState(false);
  
  console.log(error);
  console.log(errorValue);
  function switchScreen(location) {
    navigation.reset({
      index: 0, // Start at the first screen
      routes: [{name: location}], // Replace with the 'Login' screen
    });
  }
  async function setToken(tokenKey, tokenValue) {
    await AsyncStorage.setItem(tokenKey, tokenValue);
  }
  console.log(process.env.API_URL);
  const CreateAccount = async data => {
    setLoading(true)
    try {
      const dataResponse = await axios.post(
        `${BASE_URL}/api/user/signup`,
        {
          email: data.email,
          cnic: data.cnic,
          username: data.userName,
          phonenumber: data.phoneNumber,
          password: data.password,
        },
      );

      if (dataResponse.status === 202) {
        console.log(dataResponse.data)
        await setToken('token', dataResponse.data.token);
        setLoading(false)
        switchScreen('MainScreen');
        // switchScreen('MainScreen');
      } else {
        setLoading(false)
        console.log(dataResponse.data.errors);
        setError(true);
        setErrorValue(dataResponse.data.errors);
      }
    } catch (error) {
      console.log(error);
      // Set error to true if an exception occurs
    }
  };

  return (
    <ScrollView style={styles.main}>
      <Image style={styles.logoImage} source={Logo}></Image>
      <Text
        style={{
          fontSize: 24,
          fontWeight: 700,
          marginHorizontal: 'auto',
          color: '#0a8ed9',
          fontFamily: 'Abel-Regular',
        }}>
        SIGN UP NOW
      </Text>
      {error && (
        <View style={styles.errorContainer}>
          {errorValue.map(e => {
            return (
              <Text style={[styles.errorText, {marginTop: 10}]}>{e.msg}</Text>
            );
          })}
        </View>
      )}
      <Formik
        initialValues={{
          email: '',
          cnic: '',
          userName: '',
          phoneNumber: '',
          password: '',
        }}
        onSubmit={values => {
          CreateAccount(values);
        }}>
        {({handleChange, handleBlur, handleSubmit, values}) => (
          <View style={{width: '80%', marginHorizontal: 'auto'}}>
            <TextInput
              style={{
                borderWidth: 1,
                borderRadius: 12,
                marginTop: 20,
                marginBottom: 15,
                paddingLeft: 10,
                borderColor: 'grey',
              }}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
              placeholder="Email Address"
              type="email"
              validate={value => {
                if ((value = '')) {
                }
              }}
            />
            <TextInput
              style={{
                borderWidth: 1,
                borderRadius: 12,
                marginTop: 0,
                marginBottom: 25,
                paddingLeft: 10,
                borderColor: 'grey',
              }}
              onChangeText={handleChange('cnic')}
              onBlur={handleBlur('cnic')}
              value={values.cnic}
              placeholder="CNIC NO"
              type="number"
              keyboardType="numeric"
            />

            <TextInput
              style={{
                borderWidth: 1,
                borderRadius: 12,
                marginTop: 0,
                marginBottom: 25,
                paddingLeft: 10,
                borderColor: 'grey',
              }}
              onChangeText={handleChange('userName')}
              onBlur={handleBlur('userName')}
              value={values.userName}
              placeholder="User Name"
            />
            <TextInput
              style={{
                borderWidth: 1,
                borderRadius: 12,
                marginTop: 0,
                marginBottom: 25,
                paddingLeft: 10,
                borderColor: 'grey',
              }}
              onChangeText={handleChange('phoneNumber')}
              onBlur={handleBlur('phoneNumber')}
              value={values.phoneNumber}
              placeholder="Phone Number"
              keyboardType="numeric"
            />
            <TextInput
              style={{
                borderWidth: 1,
                borderRadius: 12,
                marginTop: 0,
                marginBottom: 25,
                paddingLeft: 10,
                borderColor: 'grey',
              }}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
              placeholder="Password"
              secureTextEntry
            />
            <Button
              style={{backgroundColor: '#0a8ed9'}}
              onPress={handleSubmit}
              title="Sign Up "
            />
          </View>
        )}
      </Formik>
      <Text
        style={{
          marginHorizontal: 'auto',
          fontSize: 20,
          marginTop: 20,
          marginBottom: 10,
          fontWeight: 300,
          fontFamily: 'Abel-Regular',
        }}>
        OR
      </Text>
      <Pressable
        onPress={() => {
          switchScreen('Login');
        }}>
        <Text
          style={{
            marginHorizontal: 'auto',
            fontSize: 20,
            fontWeight: 400,
            textDecorationLine: 'underline',
            marginBottom: 20,
            fontFamily: 'Abel-Regular',
          }}>
          Sign In with Email
        </Text>
      </Pressable>
      <Modal transparent={true} visible={loading} animationType="fade">
        <View style={styles.overlay}>
          <Loading />
        </View>
      </Modal>
    </ScrollView>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  main: {
    backgroundColor: 'white',
  },
  logoImage: {
    width: '40%',
    height: 150,
    marginHorizontal: 'auto',
    marginTop: '20%',
    marginBottom: '5%',
  },
  errorContainer: {
    marginHorizontal: 'auto',
    borderRadius: 5,
    marginTop: 10,
    width: '100%',
  },
  errorText: {
    backgroundColor: 'red',
    width: '60%',

    marginHorizontal: 'auto',
    color: 'white',
    paddingVertical: 10,
    fontFamily: 'Abel-Regular',
    fontSize: 15,
    textAlign: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay
  },
});
