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
import React, {useEffect, useState} from 'react';
import Logo from '../resource/logo.png';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Formik} from 'formik';
import axios from 'axios';
import {BASE_URL} from '../api';
import Loading from '../components/Loading';
import {API_KEY} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AlertBox from '../components/AlertBox';

const Login = ({navigation}) => {
  const [error, setError] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescriptiion] = useState('');
  const [errorValue, setErrorValue] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log(error);
  console.log(errorValue);
  const toggleShowAlert = stateChange => {
    setShowAlert(stateChange);
  };

  function switchScreen(location) {
    navigation.reset({
      index: 0, // Start at the first screen
      routes: [{name: location}], // Replace with the 'Login' screen
    });
  }
  async function setToken(tokenKey, tokenValue) {
    await AsyncStorage.setItem(tokenKey, tokenValue);
  }
  const CreateAccount = async data => {
    setLoading(true)
    
    console.log(data);
    try {
      const dataResponse = await axios.post(
        `${BASE_URL}/api/user/signin`,
        {
          email: data.email,
          password: data.password,
        },
      );
      console.log('this is response', dataResponse.data);

      if (dataResponse.data.errors === undefined) {
        console.log("abc  ")
        console.log("w" ,dataResponse.data);
        await setToken('token', dataResponse.data);
        setLoading(false)
        switchScreen('MainScreen');
      } else {
        console.log("kamal")
        setLoading(false)

        console.log(dataResponse.data.errors);
        setError(true);
        setErrorValue(dataResponse.data.errors);
      }
    } catch (error) {
      setLoading(false)
      setShowAlert(true)
      setTitle("Authentication Failed")
      setDescriptiion(error.response.data.msg)
      console.log("abc" ,error.response.data.msg);
      // Set error to true if an exception occurs
    }
  };

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        setLoading(false);

        navigation.navigate('MainScreen'); // Redirect to the Main screen if token is found
      } else {
        setLoading(false); // Token check complete, hide loading screen
      }
    };
    checkToken();
  }, [navigation]);

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
        SIGN IN NOW
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
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
              placeholder="Password"
              secureTextEntry
            />
            <Button
              style={{backgroundColor: '#0a8ed9'}}
              onPress={handleSubmit}
              title="Sign In"
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
          switchScreen('SignUp');
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
          Sign Up with Email
        </Text>
      </Pressable>
      <Modal
        transparent={true}
        visible={showAlert}
        animationType="fade"
        onRequestClose={() => setIsPopupVisible(false)}>
        <AlertBox
          callFunction={toggleShowAlert}
          title={title}
          description={description}
        
        />
      </Modal>
      <Modal transparent={true} visible={loading} animationType="fade">
        <View style={styles.overlay}>
          <Loading />
        </View>
      </Modal>
    </ScrollView>
  );
};

export default Login;

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
