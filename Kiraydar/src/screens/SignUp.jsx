import {
  Image,
  TextInput,
  Pressable,
  StyleSheet,
  Text,
  Button,
  View,
  ImageBackground,
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
import ImagePicker from 'react-native-image-crop-picker';
import {API_KEY} from '@env';
import AwesomeIcon from 'react-native-vector-icons/FontAwesome';
import CommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loading from '../components/Loading';
const SignUp = ({navigation}) => {
  const defaultImages = Array(10).fill({
    uri: 'https://www.olx.com.pk/assets/iconAddPhoto_noinline.8924e2486f689a28af51da37a7bda6ec.svg',
  }); // Placeholder images

  const [error, setError] = useState(false);
  const [errorValue, setErrorValue] = useState([]);
  const [loading, setLoading] = useState(false);
  const uploadPhotoFromDevice = async (setFieldValue, values) => {
    try {
      const images = await ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: true,
        multiple: true,
      });

      const newImages = images.map(image => ({
        uri: image.path,
        name: image.path.split('/').pop(),
        type: image.mime,
      }));

      setFieldValue('images', [...values.images, ...newImages]);
    } catch (error) {
      console.error('Image selection error:', error);
    }
  };
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
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('cnic', data.cnic);
      formData.append('username', data.userName);
      formData.append('phonenumber', data.phoneNumber);
      formData.append('password', data.password);
      formData.append('bankAccount', data.bankAccount);
      data.images.forEach((image, index) => {
        formData.append('images', {
          uri: image.uri,
          type: image.type,
          name: image.name,
        });
      });
      console.log("this is form data" , formData);
      
      const dataResponse = await axios.post(
        `${BASE_URL}/api/user/signup`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (dataResponse.status === 202) {
        console.log(dataResponse.data);
        await setToken('token', dataResponse.data.token);
        setLoading(false);
        switchScreen('MainScreen');
        // switchScreen('MainScreen');
      } else {
        setLoading(false);
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
          bankAccount: '',
          password: '',
          images: [],
        }}
        onSubmit={values => {
          CreateAccount(values);
        }}>
        {({handleChange, handleBlur, handleSubmit, setFieldValue, values}) => (
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
              onChangeText={handleChange('bankAccount')}
              onBlur={handleBlur('bankAccount')}
              value={values.bankAccount}
              placeholder="Enter Your Bank Account"
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
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                marginBottom: 30,
                alignItems: 'center',
              }}>
              <Pressable
                onPress={() => uploadPhotoFromDevice(setFieldValue, values)}
                style={styles.addImageBox}>
                <AwesomeIcon style={styles.addImageIcon} name="cloud-upload" />
                <Text style={{fontSize: 10, paddingRight: 10}}>
                  Upload CNIC Image
                </Text>
              </Pressable>

              {(values.images.length > 0 ? values.images : defaultImages)
                .slice(0, 2)
                .map((image, index) => (
                  <View key={index} style={{paddingHorizontal: 5}}>
                    <ImageBackground
                      style={{
                        width: 60,
                        height: 60,
                        borderColor: '#868e96',
                        borderRadius: 20,
                      }}
                      source={{uri: image.uri}}
                    />
                  </View>
                ))}
            </View>

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
  addImageContainer: {
    flexDirection: 'row',
    marginTop: 1,
    paddingHorizontal: 0,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'grey',
  },
  addImageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#ebf1ff',
    marginBottom: 10,
  },
  addImageIcon: {
    fontSize: 20,
    paddingLeft: 10,
    marginRight: 10,
    paddingVertical: 20,
  },
  addImageText: {
    fontSize: 15,
    fontFamily: 'Abel-Regular',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay
  },
});
