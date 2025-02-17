import {
  Image,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions,
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
import DetailPropertySelling from './DetailPropertySelling';

const IndiviualProperty = ({navigation}) => {
  const [data, setData] = useState();
  const [decodeData, setDecodeData] = useState();
  const [showAgreement, setShowAgreement] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showLocation, setShowLocation] = useState(false);
  const [showDetailPage, setShowDetailPage] = useState(false);
  const route = useRoute();
  const {initPaymentSheet, presentPaymentSheet} = useStripe();
  const {client} = useChatContext(); // Same client as in ChatScreen
  const location = route.params.data.coordinate[0].split(',').map(Number);
  const rejectAgreementEffect = async () => {
    setShowAgreement(true);
    setShowDetailPage(false);
  };
  console.log(route.params.data.propertyowner.Verified);

  const sendToChat = async () => {
    if (decodeData) {
      console.log('thi sis men', decodeData.response._id);
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
        currency: 'PKR', // Add the currency here
      });

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
        console.log(result);

        // Log the details of the payment intent
        console.log('Payment Intent Details:', dataResponse.data.paymentIntent);
        // console.log(dataResponse.data.paymentIntent)

        // Uncomment the line below to save data in the database
        await MakeAgreementDone(dataResponse.data.paymentIntent);
      }
    } catch (error) {
      console.log('Error in payment process:', error);
      Alert.alert('Error', error.message);
    }
  };

  const MakeAgreementDone = async paymentIntent => {
    const token = await AsyncStorage.getItem('token'); // Replace with your key
    try {
      const response = await axios.post(
        `${BASE_URL}/api/property/makeAgreemnet`, // API endpoint
        {
          propertyId: route.params.data._id,
          agreementPricePaid: route.params.data.advance,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the JWT in the headers
          },
        },
      );
      if (response.status == 200) {
        // 3. Make the second API call after the first one succeeds
        try {
          const secondResponse = await axios.post(
            `${BASE_URL}/api/credit/createPayment`, // Replace with the second API endpoint
            {
              PaymentIntentId: paymentIntent, // Replace with the data required by the second API
              TransactionAmount: route.params.data.advance,
              TransactionType: 'Escrow',
              InAccordance: route.params.data.title,
              InAccordancePropertyId: route.params.data._id,
              RecieverId: route.params.data.propertyowner,
              SendedId: decodeData.response._id,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`, // Include the JWT in the headers
              },
            },
          );
          // 4. Handle the second API response (optional)
          if (secondResponse.status === 201) {
            setShowAgreement(false);
            setShowDetailPage(true);
            Alert.alert(
              'Payment Successful Transfered',
              'Your payment was successful to Escrow Account Know you can see the details of the property',
            );
            // Add any further actions you'd like to handle after the second API success
          }
        } catch (secondError) {
          // Handle errors for the second API call
          console.error('Error in second API call:', secondError);
          Alert.alert(
            'Error',
            'An error occurred while processing the second request.',
          );
        }
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
        if (decoded.response._id == route.params.data.propertyowner) {
          setShowChat(false);
          setShowAgreement(false);
          if (route.params.data.propertySelling.agreement == true) {
            setShowDetailPage(true);
          }
        } else {
          if (route.params.data.propertySelling.agreementMaker) {
            if (
              decoded.response._id ==
              route.params.data.propertySelling.agreementMaker
            ) {
              setShowAgreement(false);
              setShowDetailPage(true);
            }
          }
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
      <ScrollView horizontal={true} style={{height: 300}}>
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
            textAlign: 'left',
            fontSize: 28,
            color: 'black',
            marginLeft: 20,
            marginTop: 10,
            fontWeight: 700,
          }}>
          Rs {route.params.data.rent}
        </Text>
        <Text
          style={{
            textAlign: 'left',
            fontSize: 16,
            color: 'black',
            marginLeft: 20,
            marginTop: 3,
            fontWeight: 600,
          }}>
          {route.params.data.title}
        </Text>
        <Text
          style={{
            marginLeft: 20,
            marginTop: 8,
            backgroundColor: '#eceff4',
            width: '18%',
            paddingLeft:10,
            paddingVertical: 5,
            color: 'black',
            fontSize: 12,
            fontWeight: 600,
          }}>
          For rent
        </Text>
        <Text
          style={{
            marginLeft: 20,
            marginTop: 8,
            backgroundColor: route.params.data.propertyowner.Verified ? '#116d02' : '#750909',
            width: '32%',
            paddingLeft:10,
            paddingVertical: 5,

            color: 'white',
            fontSize: 12,
            fontWeight: 600,
          }}>
          {route.params.data.propertyowner.Verified
            ? 'Verified Owner'
            : 'Unverified Owner'}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => {
          setShowLocation(true);
        }}
        style={{
          flexDirection: 'row',
          marginHorizontal: 20,
          marginTop: 20,
          paddingBottom: 20,
          borderBottomWidth: 1,
          borderBottomColor: '#adb5bd',
        }}>
        <AwesomeIcon
          style={{fontSize: 30, marginRight: 10, color: 'blue'}}
          name="map-marker"></AwesomeIcon>
        <Text>{route.params.data.address}</Text>
      </TouchableOpacity>
      <View
        style={{
          marginTop: 15,
          flexDirection: 'row',
          marginHorizontal: 20,
          marginBottom: 10,
        }}>
        <View style={{marginRight: '30%'}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'left',
            }}>
            <View>
              <AwesomeIcon
                style={{
                  fontSize: 20,
                  marginRight: 10,
                  color: 'blue',
                  width: 30,
                }}
                name="bed"></AwesomeIcon>
            </View>
            <View>
              <Text style={{fontSize: 14, color: 'grey'}}>Bedrooms</Text>
              <Text style={{fontSize: 14, color: 'black', fontWeight: 600}}>
                {route.params.data.bedroom}
              </Text>
            </View>
          </View>
        </View>
        <View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'left',
            }}>
            <View>
              <AwesomeIcon
                style={{
                  fontSize: 20,
                  marginRight: 10,
                  color: 'blue',
                  width: 30,
                }}
                name="shower"></AwesomeIcon>
            </View>
            <View>
              <Text style={{fontSize: 14, color: 'grey'}}>Bathrooms</Text>

              <Text style={{fontSize: 14, color: 'black', fontWeight: 600}}>
                {route.params.data.bathroom}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View
        style={{
          marginTop: 15,
          flexDirection: 'row',
          marginBottom: 20,
          marginHorizontal: 20,
          borderBottomWidth: 1,
          paddingBottom: 20,
          borderBottomColor: '#adb5bd',
        }}>
        <View style={{marginRight: '40%'}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'left',
            }}>
            <View>
              <AwesomeIcon
                style={{
                  fontSize: 20,
                  marginRight: 10,
                  color: 'blue',
                  width: 30,
                }}
                name="square"></AwesomeIcon>
            </View>
            <View>
              <Text style={{fontSize: 14, color: 'grey'}}>Area</Text>
              <Text style={{fontSize: 14, color: 'black', fontWeight: 600}}>
                {route.params.data.areaofhouse}
              </Text>
            </View>
          </View>
        </View>
        <View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'left',
            }}>
            <View>
              <AwesomeIcon
                style={{
                  fontSize: 20,
                  marginRight: 10,
                  color: 'blue',
                  width: 30,
                }}
                name="group">
                {' '}
              </AwesomeIcon>
            </View>
            <View>
              <Text style={{fontSize: 14, color: 'grey'}}>Sharing</Text>
              <Text style={{fontSize: 14, color: 'black', fontWeight: 600}}>
                {route.params.data.peoplesharing}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View style={{marginHorizontal: 20}}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'black',
            marginBottom: 10,
          }}>
          Details
        </Text>
        <View style={{flexDirection: 'row', marginVertical: 5}}>
          <View style={{width: '60%'}}>
            <Text>Area Unit</Text>
          </View>
          <View style={{width: '50%'}}>
            <Text style={{fontWeight: 800}}>Square feet</Text>
          </View>
        </View>
        <View style={{flexDirection: 'row', marginVertical: 5}}>
          <View style={{width: '60%'}}>
            <Text>Area </Text>
          </View>
          <View style={{width: '50%'}}>
            <Text style={{fontWeight: 800}}>
              {route.params.data.areaofhouse}
            </Text>
          </View>
        </View>
        <View style={{flexDirection: 'row', marginVertical: 5}}>
          <View style={{width: '60%'}}>
            <Text>No of people Sharing</Text>
          </View>
          <View style={{width: '50%'}}>
            <Text style={{fontWeight: 800}}>
              {route.params.data.peoplesharing}
            </Text>
          </View>
        </View>
        <View style={{flexDirection: 'row', marginVertical: 5}}>
          <View style={{width: '60%'}}>
            <Text>Bedrooms</Text>
          </View>
          <View style={{width: '50%'}}>
            <Text style={{fontWeight: 800}}>{route.params.data.bedroom}</Text>
          </View>
        </View>
        <View style={{flexDirection: 'row', marginVertical: 5}}>
          <View style={{width: '60%'}}>
            <Text>Bathrooms</Text>
          </View>
          <View style={{width: '50%'}}>
            <Text style={{fontWeight: 800}}>{route.params.data.bathroom}</Text>
          </View>
        </View>
        <View style={{flexDirection: 'row', marginVertical: 5}}>
          <View style={{width: '60%'}}>
            <Text>Monthly Rent</Text>
          </View>
          <View style={{width: '50%'}}>
            <Text style={{fontWeight: 800}}>Rs {route.params.data.rent}</Text>
          </View>
        </View>
        <View style={{flexDirection: 'row', marginVertical: 5}}>
          <View style={{width: '60%'}}>
            <Text>1 time Advance</Text>
          </View>
          <View style={{width: '50%'}}>
            <Text style={{fontWeight: 800}}>
              Rs {route.params.data.advance}
            </Text>
          </View>
        </View>
        <View style={{flexDirection: 'row', marginVertical: 5}}>
          <View style={{width: '60%'}}>
            <Text>Property Type</Text>
          </View>
          <View style={{width: '50%'}}>
            <Text style={{fontWeight: 800}}>{route.params.data.type}</Text>
          </View>
        </View>
        <View style={{flexDirection: 'row', marginVertical: 5}}>
          <View style={{width: '60%'}}>
            <Text>Resident Type</Text>
          </View>
          <View style={{width: '50%'}}>
            <Text style={{fontWeight: 800}}>
              {route.params.data.bachelor ? 'Non Bachelor' : 'Bachelor'}
            </Text>
          </View>
        </View>
      </View>
      <View style={{marginHorizontal: 20, marginVertical: 20}}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'black',
            marginBottom: 10,
          }}>
          Description
        </Text>
        <Text style={{lineHeight: 19}}>
          {`The property features a ${route.params.data.type} with an area of ${
            route.params.data.areaofhouse
          } Square feet, accommodating ${
            route.params.data.peoplesharing
          } residents who share ${route.params.data.bedroom} bedrooms and ${
            route.params.data.bathroom
          } bathroom. The monthly rent is Rs ${
            route.params.data.rent
          }, with a one-time advance payment of Rs ${
            route.params.data.rent
          }. This space is for ${
            route.params.data.bachelor ? 'Non Bachelor' : 'Bachelor'
          }, offering a comfortable and well-managed living experience.`}
        </Text>
        <Text style={{marginTop: 10}}>{route.params.data.description}</Text>
      </View>
      {showDetailPage && route.params?.data ? (
        <DetailPropertySelling
          propertyId={route.params.data._id}
          rented={route.params.data.rented}
          rejectAgreementEffect={rejectAgreementEffect}
        />
      ) : (
        <></>
      )}
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
            styleURL="mapbox://styles/mapbox/streets-v12">
            <Mapbox.Camera
              zoomLevel={15}
              centerCoordinate={location} // Set map center to selected place
            />
            <Mapbox.MarkerView coordinate={location}>
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
  marker: {
    width: 30,
    height: 30,
    backgroundColor: 'blue',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'white',
  },
});
