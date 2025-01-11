import {
  Image,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {useRoute} from '@react-navigation/native';
import Logo from '../resource/logo.png';
import Icon from 'react-native-vector-icons/Entypo';
import AwesomeIcon from 'react-native-vector-icons/FontAwesome';
import {StripeProvider, useStripe} from '@stripe/stripe-react-native';
import axios from 'axios';
import {BASE_URL} from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import loadAndDecodeToken from '../Controller/LoadAndDecodeToken';
import Mapbox from '@rnmapbox/maps';

Mapbox.setAccessToken(
  'pk.eyJ1IjoiaHVyYWlyYXNoYWhpZCIsImEiOiJjbTVrcmlqaWQxZjN5MmtzN2s0cDhkbjNvIn0.wJjeZBrpoJF7Un50Qrl2VQ',
);
import {
  useChatContext,
  Channel as StreamChannel,
  MessageList,
  MessageInput,
} from 'stream-chat-react-native';
import Loading from '../components/Loading';

const IndiviualProperty = ({navigation}) => {
  const [data, setData] = useState();
  const [decodeData, setDecodeData] = useState();
  const [showAgreement, setShowAgreement] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showLocation,setShowLocation] = useState(false)
  const route = useRoute();
  const {initPaymentSheet, presentPaymentSheet} = useStripe();
  const {client} = useChatContext(); // Same client as in ChatScreen
  console.log(route.params.data);

  const sendToChat = async () => {
    if (decodeData) {
      console.log(route.params.data.propertyowner);
      console.log(decodeData.response._id);
      const channel = client.channel(
        'messaging',
        `${decodeData.response._id}-${route.params.data._id}`, // Unique channel ID
        {
          members: [route.params.data.propertyowner, decodeData.response._id],
          name: `${route.params.data.title}`, // Add name dynamically
        },
      );
      await channel.watch();
      navigation.navigate('Channel', {
        channelId: `${decodeData.response._id}-${route.params.data._id}`,
      }); // Navigate to ChannelScreen with channelId
    }
  };

  const onCheckout = async () => {

    try {
      // 1. Create a Payment Intent
      const dataResponse = await axios.post(`${BASE_URL}/api/stripe/intents`, {
        amount: route.params.data.advance,
      });
  
      console.log("DataResponse", dataResponse.data);
  
      // 2. Initialize the Payment Sheet
      const initResponse = await initPaymentSheet({
        merchantDisplayName: 'notJust.dev',
        paymentIntentClientSecret: dataResponse.data.paymentIntent,
        googlePay: true, // Enable Google Pay if required 
      });
     
      if (initResponse.error) {
        console.log('Error initializing payment sheet:', initResponse.error);
        Alert.alert('Error', initResponse.error.message);
        return;
      }
  
      // 3. Present Payment Sheet
      const result = await presentPaymentSheet();
  
      // 4. Handle Payment Result
      if (result.error) {
        console.log('Payment failed:', result.error);
        Alert.alert('Payment failed', result.error.message);
      } else {
        console.log(result)
        console.log('Payment successful!');
        Alert.alert('Payment Successful', 'Your payment was successful!');
        console.log(dataResponse.data.paymentIntent)
        
        // Uncomment the line below to save data in the database
        await MakeAgreementDone(); 
      }
    } catch (error) {
      console.log('Error in payment process:', error);
      Alert.alert('Error', error.message);
    }
  };
  
  const MakeAgreementDone = async () => {
    const token = await AsyncStorage.getItem('token'); // Replace with your key
    try {
      const response = await axios.post(
        `${BASE_URL}/api/property/makeAgreemnet`, // API endpoint
        {
          propertyId: route.params.data._id,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the JWT in the headers
          },
        },
      );
      if (response.status == 200) {
        Alert.alert(
          'HURRAH , YOUR TRASCATION HAVE BEEN SENDED TO ESCROW NOW YOU CAN CHAT WITH OWNER',
        );
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  useEffect(() => {
    const handleLoadAndDecode = async () => {
      try {
        const decoded = await loadAndDecodeToken(); // Assuming loadAndDecodeToken does not require any parameters
        setDecodeData(decoded); // Assuming you want to log the decoded token
        if(decoded.response._id == route.params.data.propertyowner){
          setShowChat(false)
          setShowAgreement(false)
        }
     
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading and decoding token:', error);
      }
    };
    handleLoadAndDecode();
  }, []);

  return (
    <ScrollView style={{backgroundColor: 'white'}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 10,
        }}>
        <Image style={{width: 60, height: 50, marginTop: 5}} source={Logo} />
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Icon name="location-pin" style={{fontSize: 30, color: '#0a8ed9'}} />
          <Text
            style={{fontFamily: 'Abel-Regular', fontSize: 18, color: 'black'}}>
            Clifton 1, Karachi
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal={true}
        style={{height: 300, marginHorizontal: 20, marginTop: 20}}>
        {route.params.data.assest.map((ad, index) => (
          <Image
            key={index} // Add key for list items
            style={{
              width: 300,
              height: 400,
              marginHorizontal: 5,
              borderRadius: 10,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,

              elevation: 5,
            }}
            source={{uri: ad}}
            onError={error =>
              console.log('Error loading image:', error.nativeEvent.error)
            } // Updated error logging
          />
        ))}
      </ScrollView>
      <View>
        <Text
          style={{
            textAlign: 'center',
            fontSize: 18,
            color: 'black',
            marginTop: 10,
          }}>
          {route.params.data.title}
        </Text>
        <Text style={{textAlign: 'center'}}>
          {route.params.data.description}
        </Text>
      </View>
      <View
        style={{
          marginTop: 15,
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginHorizontal: 20,
          marginBottom: 10,
        }}>
        <View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
            }}>
            <AwesomeIcon
              style={{fontSize: 20, marginRight: 10, color: 'blue'}}
              name="bed">
              <Text style={{fontSize: 14, color: 'black'}}>No of bedroom</Text>
            </AwesomeIcon>
            <Text>{route.params.data.bedroom}</Text>
          </View>
        </View>
        <View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
            }}>
            <AwesomeIcon
              style={{fontSize: 20, marginRight: 10, color: 'blue'}}
              name="shower">
              <Text style={{fontSize: 14, color: 'black'}}>No of Shower</Text>
            </AwesomeIcon>
            <Text>{route.params.data.bathroom}</Text>
          </View>
        </View>
      </View>
      <View
        style={{
          marginTop: 15,
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 20,
          marginHorizontal: 20,
        }}>
        <View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
            }}>
            <AwesomeIcon
              style={{fontSize: 20, marginRight: 10, color: 'blue'}}
              name="square">
              <Text style={{fontSize: 14, color: 'black'}}>
                Area in sq/feet
              </Text>
            </AwesomeIcon>
            <Text>{route.params.data.areaofhouse}</Text>
          </View>
        </View>
        <View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
            }}>
            <AwesomeIcon
              style={{fontSize: 20, marginRight: 10, color: 'blue'}}
              name="group">
              {' '}
              <Text style={{fontSize: 14, color: 'black'}}>
                No of People Sharing
              </Text>
            </AwesomeIcon>
            <Text>{route.params.data.peoplesharing}</Text>
          </View>
        </View>
      </View>
      <Text
        style={{
          backgroundColor: 'blue',
          marginHorizontal: 20,
          paddingVertical: 10,
          color: 'white',
          fontSize: 15,
          textAlign: 'center',
          borderRadius: 10,
        }}>
        One Time Advance : {route.params.data.advance} Rs
      </Text>
      <Text
        style={{
          backgroundColor: 'blue',
          marginHorizontal: 20,
          paddingVertical: 10,
          marginTop: 10,
          color: 'white',
          fontSize: 15,
          textAlign: 'center',
          borderRadius: 10,
        }}>
        Monthly Rent : {route.params.data.rent} Rs
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginHorizontal: 20,
          marginTop: 20,
        }}>
        <AwesomeIcon
          style={{fontSize: 30, marginRight: 10, color: 'blue'}}
          name="map-marker"></AwesomeIcon>
        <Text style={{color: 'black'}}>{route.params.data.address}</Text>
      </View>
      <View>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'blue',
              paddingHorizontal: 20,
              paddingVertical: 10,
              marginHorizontal: 20,
              marginTop:10
            }} onPress={() => {setShowLocation(true)}}>
            <Text style={{color: 'white' , textAlign:"center"}}>
              Show Exact Location
            </Text>
          </TouchableOpacity>
        </View>
      <View
        style={{
          marginTop: 15,
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 20,
          marginHorizontal: 20,
        }}>
        <View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              backgroundColor: 'blue',
              paddingHorizontal: 20,
              paddingVertical: 10,
            }}>
            <Text style={{color: 'white'}}>
              {route.params.data.bachelor ? 'Non Bachelor' : 'Bachelor'}
            </Text>
          </View>
        </View>
        <View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              backgroundColor: 'blue',
              paddingHorizontal: 20,
              paddingVertical: 10,
            }}>
            <Text style={{color: 'white'}}>
              Property Type {route.params.data.type}
            </Text>
          </View>
        </View>
      </View>
      {showAgreement ? (
        <TouchableOpacity
          onPress={onCheckout}
          style={{
            backgroundColor: 'blue',
            marginHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 20,
            marginBottom: 20,
          }}>
          <Text style={{color: 'white', fontSize: 15, textAlign: 'center'}}>
            Make The Agreement
          </Text>
        </TouchableOpacity>
      ) : (
        <></>
      )}

      {showChat ? (
        <TouchableOpacity
          onPress={sendToChat}
          style={{
            backgroundColor: 'green',
            marginHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 20,
            marginBottom: 20,
          }}>
          <Text style={{color: 'white', fontSize: 15, textAlign: 'center'}}>
            Chat With The Owner
          </Text>
        </TouchableOpacity>
      ) : (
        <></>
      )}
      <Modal transparent={true} visible={loading} animationType="fade">
        <View style={styles.overlay}>
          <Loading />
        </View>
      </Modal>

      <Modal
              transparent={true}
              visible={showLocation}
              animationType="fade"
              style={{width: '90%'}}>
              <View style={styles.overlay}>
                <Mapbox.MapView
                  style={{height: '80%', width: '90%'}}
                  styleURL="mapbox://styles/mapbox/streets-v12"
                >
                  <Mapbox.Camera
                    zoomLevel={15}
                    centerCoordinate={route.params.data.coordinate} // Set map center to selected place
                  />
                  <Mapbox.MarkerView
                    coordinate={route.params.data.coordinate}
                    >
                    <View style={styles.marker} />
                  </Mapbox.MarkerView>
                </Mapbox.MapView>
                <TouchableOpacity
                  onPress={() => {
                    setShowLocation(false);
                  }}
                  style={{borderRadius: 10}}>
                  <Text
                    style={{backgroundColor: 'white', padding: 10, marginTop: 10}}>
                    Close Location
                  </Text>
                </TouchableOpacity>
              </View>
            </Modal>
    </ScrollView>
  );
};

export default IndiviualProperty;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay
  },
});
