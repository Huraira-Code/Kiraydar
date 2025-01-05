import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  View,
  Modal,
} from 'react-native';

import React, {useState, useEffect} from 'react';
import Logo from '../resource/logo.png';
import Feather from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/Entypo';
import AwesomeIcon from 'react-native-vector-icons/FontAwesome';
import CommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Property from '../resource/property.png';
import {Shadow} from 'react-native-shadow-2';
import loadAndDecodeToken from '../Controller/LoadAndDecodeToken';
import axios from 'axios';
import {BASE_URL} from '../api';
import {StreamChat} from 'stream-chat';

import Main from '../resource/HomeScreenMain.png';
import BottomBar from '../components/BottomBar';
import Loading from '../components/Loading';
const MainScreen = ({navigation}) => {
  const [loading, setLoading] = useState(true);
  function switchScreen(location) {
    navigation.navigate(location);
  }
  function openProperty(location, data) {
    navigation.navigate(location, {data});
  }
  const [recommendation, setRecommendation] = useState([]);
  const [decodeData, setDecodeData] = useState();
  // const [decodedToken, setDecodedToken] = useState(null);

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
    console.log('EFFECT 1');
    if (decodeData) {
      const chatClient = StreamChat.getInstance('f4jd4sm2swcv'); // Replace with your API Key

      const connect = async () => {
        await chatClient.connectUser(
          {
            id: decodeData.response._id, // User ID
            name: decodeData.response.username, // User Name
          },
          chatClient.devToken(decodeData.response._id),
        );
      };

      connect();
    }

    const fetchRecommendation = async () => {
      console.log(
        'this is decoded data from MainScreen',
        decodeData.response._id,
      );

      try {
        const response = await axios.post(
          `${BASE_URL}/api/property/freshRecommendation`,
          {
            propertyowner: decodeData.response._id,
          },
        );
        setRecommendation(response.data);
        setLoading(false)
        console.log('this is data from property owner', response.data);
      } catch (err) {
        console.log(err);
        setLoading(false)
      }
    };
    fetchRecommendation();
  }, [decodeData]);

  return (
    <>
      <ScrollView style={{backgroundColor: 'white'}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 10,
            // paddingBottom:10,
            // borderBottomWidth:1,
            // borderColor:"grey"
          }}>
          <Image
            style={{width: '15%', height: 50, marginTop: 5}}
            source={Logo}></Image>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Icon
              name="location-pin"
              style={{fontSize: 30, color: '#0a8ed9'}}></Icon>
            <Text
              style={{
                fontFamily: 'Abel-Regular',
                fontSize: 18,
                color: 'black',
              }}>
              Clifton 1, Karachi
            </Text>
          </View>
        </View>
        <View
          style={{
            marginTop: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 10,
            borderBottomWidth: 1,
            paddingBottom: 15,
            borderColor: 'grey',
          }}>
          <View
            style={{
              paddingHorizontal: 10,
              flexDirection: 'row',
              width: '87%',
              backgroundColor: 'white',
              borderRadius: 5,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'grey',
            }}>
            <Feather
              name="search"
              size={20}
              color="#0a8ed9"
              style={{fontSize: 20}}
              placeholder="Search"></Feather>
            <TextInput style={{fontSize: 15}} placeholder="Search"></TextInput>
          </View>
          <Icon name="bell" style={{fontSize: 35, color: '#0a8ed9'}}></Icon>
        </View>
        <View
          style={{
            backgroundColor: '#0a8ed9',
            marginTop: 15,
            width: '95%',
            borderRadius: 5,
            padding: 20,
            marginHorizontal: 'auto',
            flexDirection: 'row',
          }}>
          <View style={{width: '45%'}}>
            <View>
              <Text
                style={{
                  fontFamily: 'Abel-Regular',
                  color: 'white',
                  fontSize: 20,
                }}>
                Kirayedar
              </Text>
            </View>
            <Text
              style={{
                fontSize: 22,
                color: 'white',
                marginTop: 20,
                fontFamily: 'Aclonica-Regular',
              }}>
              Find Your Home to Stay
            </Text>
          </View>
          <Image
            style={{width: '50%', height: 140, marginVertical: 10}}
            source={Main}></Image>
        </View>
        <View style={{marginTop: 15, paddingHorizontal: 10}}>
          <Text
            style={{fontSize: 20, fontFamily: 'Abel-Regular', color: 'black'}}>
            Browse Categories
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 10,
              marginHorizontal: 10,
              alignItems: 'center',
            }}>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <Icon name="home" style={{fontSize: 50, color: '#0a8ed9'}}></Icon>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: 'Abel-Regular',
                  fontWeight: '800',
                }}>
                House
              </Text>
            </View>
            <View style={{justifyContent: '', alignItems: 'center'}}>
              <CommunityIcon
                name="office-building"
                style={{fontSize: 50, color: '#0a8ed9'}}></CommunityIcon>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: 'Abel-Regular',
                  fontWeight: '800',
                }}>
                Flats
              </Text>
            </View>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <AwesomeIcon
                name="home"
                style={{fontSize: 50, color: '#0a8ed9'}}></AwesomeIcon>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: 'Abel-Regular',
                  fontWeight: '800',
                }}>
                Hostel
              </Text>
            </View>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <CommunityIcon
                name="home-city"
                style={{fontSize: 50, color: '#0a8ed9'}}></CommunityIcon>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: 'Abel-Regular',
                  fontWeight: '800',
                }}>
                Property
              </Text>
            </View>
          </View>
        </View>
        <View style={{paddingHorizontal: 10, marginTop: 10}}>
          <Text
            style={{
              fontSize: 20,
              fontFamily: 'Abel-Regular',
              color: 'black',
              marginBottom: 10,
            }}>
            Fresh recommendetations
          </Text>
          <ScrollView>
            {recommendation.map((fresh, index) => {
              const imageUrl = fresh.assest[0];
              return (
                <TouchableOpacity
                  style={{width: '50%'}}
                  onPress={() => {
                    openProperty('IndiviualProperty', fresh);
                  }}
                  style={[styles.item2, {backgroundColor: 'white'}]}>
                  <Image
                    style={{
                      marginHorizontal: 'auto',
                      marginBottom: 10,
                      width: '100%',
                      height: 200,
                    }}
                    source={{
                      uri: imageUrl,
                    }}></Image>
                  <Text
                    style={{fontWeight: '800', color: 'black', fontSize: 20}}>
                    Rs {fresh.rent}
                  </Text>
                  <Text style={{color: 'black'}}>{fresh.title}</Text>
                  <Text style={{color: 'black'}}>{fresh.description}</Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 5,
                    }}>
                    <Icon
                      style={{fontSize: 14, color: '#0a8ed9'}}
                      name="location-pin"></Icon>
                    <Text style={{fontSize: 12}}>{fresh.address}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
        <Modal transparent={true} visible={loading} animationType="fade">
          <View style={styles.overlay}>
            <Loading />
          </View>
        </Modal>
      </ScrollView>

      <BottomBar />
    </>
  );
};

export default MainScreen;

const styles = StyleSheet.create({
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
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay
  },
});
