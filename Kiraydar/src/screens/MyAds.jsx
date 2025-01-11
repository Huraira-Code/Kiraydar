import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {ScrollView} from 'react-native-virtualized-view';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Property from '../resource/property.png';
import Icon from 'react-native-vector-icons/Entypo';
import axios from 'axios';
import loadAndDecodeToken from '../Controller/LoadAndDecodeToken';
import Logo from '../resource/logo.png';
TouchableOpacity;
import {BASE_URL} from '../api';
import BottomBar from '../components/BottomBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
const MyAds = ({navigation}) => {
  console.log(process.env.API_URL);

  function switchScreen(location, data) {
    navigation.navigate(location, {data});
  }
  const [ads, setAds] = useState([]);
  const [decodeData, setDecodeData] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typeOfData, setTypeOfData] = useState('ads');
  const [buyerScreen, setBuyerScreen] = useState(false);
  useEffect(() => {
    const handleLoadAndDecode = async () => {
      try {
        const decoded = await loadAndDecodeToken(); // Assuming loadAndDecodeToken does not require any parameters
        setDecodeData(decoded); // Assuming you want to log the decoded token
      } catch (error) {
        console.error('Error loading and decoding token:', error);
      }
    };
    handleLoadAndDecode();
  }, []);
  
  useEffect(() => {
    setLoading(true);
    const fetchAds = async () => {
      console.log('this is ads');
      try {
        const response = await axios.post(
          `${BASE_URL}/api/property/findmyproperty`,
          {
            propertyowner: decodeData.response._id,
          },
        );
        console.log('data from ads', response.data);
        setBuyerScreen(false);

        setAds(response.data);
        setLoading(false);
      } catch (err) {
        console.log(err);

        setError(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchfavourite = async () => {
      const token = await AsyncStorage.getItem('token'); // Replace with your key
      try {
        const response = await axios.post(
          `${BASE_URL}/api/property/myAgreement`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include the JWT in the headers
            },
          },
        );
        console.log('response from favourite', response.data);
        setBuyerScreen(false);

        setAds(response.data);
        setLoading(false);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchBuyer = async () => {
      const token = await AsyncStorage.getItem('token'); // Replace with your key
      try {
        const response = await axios.post(
          `${BASE_URL}/api/property/myBuyers`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include the JWT in the headers
            },
          },
        );
        console.log('response from buyer', response.data);

        setAds(response.data);
        setBuyerScreen(true);
        setLoading(false);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    if (typeOfData == 'ads') {
      console.log('making milk');
      fetchAds();
    } else if (typeOfData == 'favourite') {
      fetchfavourite();
    } else if (typeOfData == 'buyers') {
      fetchBuyer();
    }
  }, [decodeData, typeOfData]);
  return (
    <>
      <ScrollView style={{paddingHorizontal: 15, backgroundColor: 'white'}}>
        <View>
          <Image style={styles.logoImage} source={Logo}></Image>
          <Text
            style={{
              fontSize: 28,
              fontFamily: 'Abel-Regular',
              color: '#000',
              letterSpacing: 1,
            }}>
            My Ads
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            textAlign: 'center',
            borderBottomWidth: 1,
            borderBottomColor: '#808080',
            paddingBottom: 6,
            marginTop: 15,
            marginBottom: 15,
          }}>
          <TouchableOpacity
            style={{width: '33.33%'}}
            onPress={() => setTypeOfData('ads')}>
            <Text
              style={[
                styles.textButton,
                {textAlign: 'center'},
                typeOfData === 'ads' && {
                  borderBottomWidth: 2,
                  borderBottomColor: '#0a8ed9',
                }, // Add border if active
              ]}>
              ADS
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{width: '33.33%'}}
            onPress={() => setTypeOfData('favourite')}>
            <Text
              style={[
                styles.textButton,
                {textAlign: 'center'},
                typeOfData === 'favourite' && {
                  borderBottomWidth: 2,
                  borderBottomColor: '#0a8ed9',
                }, // Add border if active
              ]}>
              FAVOURITES
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{width: '33.33%'}}
            onPress={() => setTypeOfData('buyers')}>
            <Text
              style={[
                styles.textButton,
                {textAlign: 'center'},
                typeOfData === 'buyers' && {
                  borderBottomWidth: 2,
                  borderBottomColor: '#0a8ed9',
                }, // Add border if active
              ]}>
              BUYERS
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#0a8ed9" />
        ) : ads.length > 0 ? (
          ads.map((ad, index) => {
            const imageUrl = ad.assest[0];
            if (buyerScreen == false) {
              return (
                <TouchableOpacity
                  key={index} // Don't forget to add a unique key for each item
                  onPress={() => {
                    switchScreen('IndiviualProperty', ad);
                  }}
                  style={[styles.item2, {backgroundColor: 'white'}]}>
                  <Image
                    style={{
                      marginHorizontal: 'auto',
                      marginBottom: 10,
                      width: '100%',
                      height: 200,
                    }}
                    source={{uri: imageUrl}}
                    onError={() =>
                      console.log('Error loading image:', imageUrl)
                    } // Log image load errors
                  />
                  <Text
                    style={{fontWeight: '800', color: 'black', fontSize: 20}}>
                    Rs {ad.rent}
                  </Text>
                  <Text style={{color: 'black'}}>{ad.title}</Text>
                  <Text style={{color: 'black'}}>{ad.description}</Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 5,
                    }}>
                    <Icon
                      style={{fontSize: 14, color: '#0a8ed9'}}
                      name="location-pin"
                    />
                    <Text style={{fontSize: 12}}>{ad.address}</Text>
                  </View>
                </TouchableOpacity>
              );
            } else {
              return (
                <View
                  key={index} // Don't forget to add a unique key for each item
                  style={[styles.item2, {backgroundColor: 'white'}]}>
                  <View
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: 'blue',
                      borderStyle: 'dashed',
                      marginBottom: 10,
                      paddingVertical: 10,
                    }}>
                    <Text
                      style={{fontWeight: '800', color: 'black', fontSize: 18}}>
                      {ad.title}
                    </Text>
                    <Text
                      style={{fontWeight: '500', color: 'grey', fontSize: 14}}>
                      {ad.description}
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 5,
                      }}>
                      <Icon
                        style={{fontSize: 14, color: '#0a8ed9'}}
                        name="location-pin"
                      />
                      <Text style={{fontSize: 14}}>{ad.address}</Text>
                    </View>
                  </View>
                  <Text
                    style={{fontWeight: '800', color: 'black', fontSize: 20}}>
                    {ad.propertySelling.agreementMaker.username}
                  </Text>
                  <Text style={{color: 'black'}}>
                    {ad.propertySelling.agreementMaker.email}
                  </Text>
                  <Text style={{color: 'black'}}>
                    +92 {ad.propertySelling.agreementMaker.phonenumber}
                  </Text>
                  <TouchableOpacity style={{borderRadius: 5}}>
                    <Text
                      style={{
                        backgroundColor: '#0a8ed9',
                        color: 'white',
                        textAlign: 'center',
                        paddingVertical: 10,
                        marginTop: 10,
                        borderRadius: 5,
                      }}>
                      Chat With The Client
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            }
          })
        ) : (
          <Text style={{textAlign: 'center', fontSize: 18, color: 'gray'}}>
            No ads available.
          </Text>
        )}
      </ScrollView>
      <BottomBar />
    </>
  );
};

export default MyAds;

const styles = StyleSheet.create({
  logoImage: {
    width: 70,
    height: 70,
    marginTop: 10,
  },
  item2: {
    //flex: 0.5, //why this doesnt work???
    padding: 10,
    marginHorizontal: 10,
    marginBottom: 10,
    marginTop: 5,
    backgroundColor: 'white',
    marginVertical: 3,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  textButton: {
    color: '#000',
    fontSize: 15,
  },
});
