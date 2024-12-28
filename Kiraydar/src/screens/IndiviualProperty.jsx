import {
  Image,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
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
import {
  useChatContext,
  Channel as StreamChannel,
  MessageList,
  MessageInput,
} from 'stream-chat-react-native';

const IndiviualProperty = ({navigation}) => {
  const [data, setData] = useState();
  const [decodeData, setDecodeData] = useState();
  const [showAgreement, setShowAgreement] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showChatOwner, setShowChatOwner] = useState(false);

  const route = useRoute();
  const {initPaymentSheet, presentPaymentSheet} = useStripe();
  const {client} = useChatContext(); // Same client as in ChatScreen
  console.log(route.params.data.advance);

const sendToChat = async() => {
  navigation.navigate('Channel', {channelId: `${route.params.data.propertySelling.agreementMaker}-${route.params.data._id}`}); // Navigate to ChannelScreen with channelId

}


  const onCheckout = async () => {

    // 1. Create a payment intent
    try {
      const dataResponse = await axios.post(
        `http://${BASE_URL}/api/stripe/intents`,
        {
          amount: route.params.data.advance,
        },
      );

      // 2. Initialize the Payment sheet
      const initResponse = await initPaymentSheet({
        merchantDisplayName: 'notJust.dev',
        paymentIntentClientSecret: dataResponse.data.paymentIntent,
      });

      // 3. Present the Payment Sheet from Stripe
      const result = await presentPaymentSheet();

      // 4. Check the result and call MakeAgreementDone if payment is confirmed
      if (result.error) {
        console.log('Payment failed', result.error);
        Alert.alert('Payment failed', result.error.message);
      } else {
        // Payment was successful
        console.log('Payment successful', result);
        await MakeAgreementDone(); // This function will send data to the database to save it
      }
    } catch (error) {
      console.log('Error in payment process', error);
      Alert.alert('Error', error.message);
    }
  };

  const MakeAgreementDone = async () => {
    const token = await AsyncStorage.getItem('token'); // Replace with your key
    try {
      const response = await axios.post(
        `http://${BASE_URL}/api/property/makeAgreemnet`, // API endpoint
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
        console.log(response.data.propertyowner);
        console.log(response.data.propertySelling.agreementMaker);
        const channel = client.channel('messaging',`${response.data.propertySelling.agreementMaker}-${route.params.data._id}` ,{
          members: [
            response.data.propertyowner,
            response.data.propertySelling.agreementMaker,
          ],
        });
        await channel.watch();
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
      } catch (error) {
        console.error('Error loading and decoding token:', error);
      }
    };
    handleLoadAndDecode();
  }, []);
  useEffect(() => {
    if (decodeData && decodeData.response) {
      if (
        decodeData.response._id === route.params.data.propertyowner ||
        decodeData.response._id ===
          route.params.data.propertySelling.agreementMaker
      ) {
        setShowAgreement(false);
      }

      if (
        decodeData.response._id ===
        route.params.data.propertySelling.agreementMaker
      ) {
        setShowChat(true);
      }

      if (
        decodeData.response._id ===
        route.params.data.propertyowner && route.params.data.propertySelling.agreement === true
      ) {
        setShowChatOwner(true);
      }

    }
  }, [decodeData]);

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
            <Text>2</Text>
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
            <Text>2</Text>
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
            <Text>2</Text>
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
            <Text>2</Text>
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

{showChatOwner ? (
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
            Chat With The Client
          </Text>
        </TouchableOpacity>
      ) : (
        <></>
      )}
    </ScrollView>
  );
};

export default IndiviualProperty;

const styles = StyleSheet.create({});
