import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import Logo from '../resource/logo.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {BASE_URL} from '../api';
function DetailPropertySelling({propertyId, rejectAgreementEffect, rented}) {
  console.log(propertyId);
  const [detail, setDetail] = useState();
  const [loading, setLoading] = useState(true);
  const [price, setPrice] = useState(''); // State to store the input value
  const [agreementCompleted, setAgreementCompleted] = useState(false);
  const finalizeDeal = async PropertyId => {
    setLoading(true);
    const token = await AsyncStorage.getItem('token'); // Replace with your key
    // Check if detail and agreementDetails exist
    if (detail && detail.agreementDetails) {
      const agreementPricePaid = Number(
        detail.agreementDetails.agreementPricePaid,
      );
      const negotiationPrice = Number(detail.agreementDetails.negotationPrice);
      console.log('A', agreementPricePaid);
      console.log('b ', negotiationPrice);
      console.log(
        'the',
        !isNaN(agreementPricePaid) && !isNaN(negotiationPrice),
      );

      // Check if the prices are valid numbers
      if (!isNaN(agreementPricePaid) && !isNaN(negotiationPrice)) {
        let result = Math.round(
          (agreementPricePaid + negotiationPrice) * 0.0036 * 100,
        );
        console.log(result); // Output the final rounded result
        try {
          const response = await axios.post(
            `${BASE_URL}/api/property/dealDone`,
            {
              propertyId: PropertyId,
              amount: result,
              recipientID: detail.owner.BankAountStripeId,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`, // Include the JWT in the headers
              },
            },
          );
          if (response.status == 200) {
            const agreementPricePaid = Number(
              detail.agreementDetails.agreementPricePaid,
            );
            const negotiationPrice = Number(
              detail.agreementDetails.negotationPrice,
            );
            console.log(
              'the total amount',
              agreementPricePaid + negotiationPrice,
            );
            result = agreementPricePaid + negotiationPrice;
            try {
              const secondResponse = await axios.post(
                `${BASE_URL}/api/credit/createPayment`, // Replace with the second API endpoint
                {
                  PaymentIntentId: response.data.transfer.id, // Replace with the data required by the second API
                  TransactionAmount: result,
                  TransactionType: 'Transfered',
                  InAccordance: detail.property.title,
                  InAccordancePropertyId: PropertyId,
                  RecieverId: detail.owner._id,
                  SendedId: detail.agreementMakerID._id,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`, // Include the JWT in the headers
                  },
                },
              );

              console.log(secondResponse);
              // 4. Handle the second API response (optional)
              if (secondResponse.status === 201) {
                try {
                  const thirdResponse = await axios.post(
                    `${BASE_URL}/api/credit/updateEscrow`, // Replace with the second API endpoint
                    {
                      SendedId: detail.agreementMakerID._id,
                      RecieverId: detail.property.propertyowner,
                      InAccordancePropertyId: PropertyId,
                      TransactionTypeConvert: 'Forward',
                    },
                    {
                      headers: {
                        Authorization: `Bearer ${token}`, // Include the JWT in the headers
                      },
                    },
                  );
                  if (thirdResponse.status == 200) {
                    setLoading(false);
                    setAgreementCompleted(true);
                  }
                } catch (thirdError) {
                  console.error('Error in second API call:', thirdError);
                }
              }
            } catch (secondError) {
              // Handle errors for the second API call
              console.error('Error in second API call:', secondError);
            }
          }
        } catch (err) {
          setLoading(false);

          // Log detailed error information
          if (err.response) {
            // For HTTP requests (e.g., axios errors)
            console.log('Response Error:', err.response.data); // Server response data
            console.log('Status Code:', err.response.status); // HTTP status code
            console.log('Headers:', err.response.headers); // HTTP headers
          } else if (err.request) {
            // Request was made but no response received
            console.log('Request Error:', err.request);
          } else {
            // General errors (e.g., syntax errors, runtime errors)
            console.log('Error Message:', err.message);
            console.log('Error Stack:', err.stack);
            console.log('Error Name:', err.name);
          }

          // Optional: Show a user-friendly error message
          alert(`An error occurred: ${err.message}`);
        }
      } else {
        console.log('Invalid price values.');
      }
    } else {
      console.log('detail or agreementDetails is undefined');
    }
  };

  const RejectAgreement = async (agreementId, PropertyId) => {
    console.log('motai motai', detail.agreementMakerID._id);

    setLoading(true);
    const token = await AsyncStorage.getItem('token'); // Replace with your key
    try {
      const response = await axios.post(
        `${BASE_URL}/api/property/rejectAgreement`,
        {
          Id: agreementId,
          propertyId: PropertyId,
          amount: Math.round(
            detail.agreementDetails.agreementPricePaid * 0.0036 * 100,
          ),
          recipientId: detail.agreementMakerID.BankAountStripeId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the JWT in the headers
          },
        },
      );
      console.log();
      if (response.status == 200) {
        try {
          const secondResponse = await axios.post(
            `${BASE_URL}/api/credit/createPayment`, // Replace with the second API endpoint
            {
              PaymentIntentId: response.data.transfer.id, // Replace with the data required by the second API
              TransactionAmount: detail.agreementDetails.agreementPricePaid,
              TransactionType: 'Transfered',
              InAccordance: detail.property.title,
              InAccordancePropertyId: PropertyId,
              RecieverId: detail.agreementMakerID._id,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`, // Include the JWT in the headers
              },
            },
          );

          console.log(secondResponse);
          // 4. Handle the second API response (optional)
          if (secondResponse.status === 201) {
            try {
              const thirdResponse = await axios.post(
                `${BASE_URL}/api/credit/updateEscrow`, // Replace with the second API endpoint
                {
                  SendedId: detail.agreementMakerID._id,
                  RecieverId: detail.property.propertyowner,
                  InAccordancePropertyId: PropertyId,
                  TransactionTypeConvert: 'Refund',
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`, // Include the JWT in the headers
                  },
                },
              );
              if (thirdResponse.status == 200) {
                setLoading(false);
                rejectAgreementEffect();
              }
            } catch (thirdError) {
              console.error('Error in second API call:', thirdError);
            }
          }
        } catch (secondError) {
          // Handle errors for the second API call
          console.error('Error in second API call:', secondError);
        }
        console.log(response);
      }
    } catch (err) {
      setLoading(false);

      // Log detailed error information
      if (err.response) {
        // For HTTP requests (e.g., axios errors)
        console.log('Response Error:', err.response.data); // Server response data
        console.log('Status Code:', err.response.status); // HTTP status code
        console.log('Headers:', err.response.headers); // HTTP headers
      } else if (err.request) {
        // Request was made but no response received
        console.log('Request Error:', err.request);
      } else {
        // General errors (e.g., syntax errors, runtime errors)
        console.log('Error Message:', err.message);
        console.log('Error Stack:', err.stack);
        console.log('Error Name:', err.name);
      }

      // Optional: Show a user-friendly error message
      alert(`An error occurred: ${err.message}`);
    }
  };

  const AcceptAgreement = async agreementId => {
    setLoading(true);
    const token = await AsyncStorage.getItem('token'); // Replace with your key
    try {
      const response = await axios.post(
        `${BASE_URL}/api/property/acceptAgreement`,
        {
          Id: agreementId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the JWT in the headers
          },
        },
      );
      if (response.status == 200) {
        console.log('ABC');
        fetchAgreementDetails();
        console.log(response.status);
        console.log('this is data from property owner', response.data);
      }
    } catch (err) {
      setLoading(false);

      // Log detailed error information
      if (err.response) {
        // For HTTP requests (e.g., axios errors)
        console.log('Response Error:', err.response.data); // Server response data
        console.log('Status Code:', err.response.status); // HTTP status code
        console.log('Headers:', err.response.headers); // HTTP headers
      } else if (err.request) {
        // Request was made but no response received
        console.log('Request Error:', err.request);
      } else {
        // General errors (e.g., syntax errors, runtime errors)
        console.log('Error Message:', err.message);
        console.log('Error Stack:', err.stack);
        console.log('Error Name:', err.name);
      }

      // Optional: Show a user-friendly error message
      alert(`An error occurred: ${err.message}`);
    }
  };
  const MakeNegotationPrice = async (agreementId, negotationPrice) => {
    setLoading(true);
    const token = await AsyncStorage.getItem('token'); // Replace with your key
    try {
      const response = await axios.post(
        `${BASE_URL}/api/property/makeNegotationPrice`,
        {
          agreementId: agreementId,
          negotationPrice: negotationPrice,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the JWT in the headers
          },
        },
      );
      if (response.status == 200) {
        console.log('ABC');
        fetchAgreementDetails();
        setPrice('');
        setLoading(false);
        console.log(response.status);
        console.log('this is data from property owner', response.data);
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };
  const fetchAgreementDetails = async () => {
    if (rented == true) {
      setAgreementCompleted(true);
    }
    const token = await AsyncStorage.getItem('token'); // Replace with your key
    try {
      const response = await axios.post(
        `${BASE_URL}/api/property/agreementDetailShow`,
        {
          propertyId: propertyId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the JWT in the headers
          },
        },
      );

      setDetail(response.data);
      setLoading(false);
      console.log('this is data from property owner', response.data);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAgreementDetails();
  }, []);
  if (loading) {
    return <ActivityIndicator size="large" color="blue" />;
  }
  return (
    <View style={{backgroundColor: 'white', marginHorizontal: 20}}>
      <View style={{marginTop: 10, marginBottom: 10}}>
        <Text
          style={{
            fontSize: 14,
            color: 'black',
            fontWeight: 500,
            textAlign: 'left',
            marginBottom: 10,
          }}>
          Agreement Maker Details{' '}
        </Text>
        <View style={{flexDirection: 'row', marginVertical: 5}}>
          <View style={{width: '40%'}}>
            <Text>Name</Text>
          </View>
          <View style={{width: '60%'}}>
            <Text style={{fontWeight: 800}}>
              {detail.agreementMakerID.username}
            </Text>
          </View>
        </View>
        <View style={{flexDirection: 'row', marginVertical: 5}}>
          <View style={{width: '40%'}}>
            <Text>Email</Text>
          </View>
          <View style={{width: '60%'}}>
            <Text style={{fontWeight: 800}}>
              {detail.agreementMakerID.email}
            </Text>
          </View>
        </View>
        <View style={{flexDirection: 'row', marginVertical: 5}}>
          <View style={{width: '40%'}}>
            <Text>Number</Text>
          </View>
          <View style={{width: '60%'}}>
            <Text style={{fontWeight: 800}}>
              {detail.agreementMakerID.phonenumber}
            </Text>
          </View>
        </View>
      </View>
      <View style={{marginTop: 10, marginBottom: 10}}>
        <Text
          style={{
            fontSize: 14,
            color: 'black',
            fontWeight: 500,
            textAlign: 'left',
            marginBottom: 10,
          }}>
          Agreement Final Price Negotation{' '}
        </Text>
        <View style={{flexDirection: 'row', marginVertical: 5}}>
          <View style={{width: '60%'}}>
            <Text>Advance Price in Escrow :</Text>
          </View>
          <View style={{width: '40%'}}>
            <Text style={{fontWeight: 800}}>
              {detail.agreementDetails.agreementPricePaid} PKR
            </Text>
          </View>
        </View>
        <View style={{flexDirection: 'row', marginVertical: 5}}>
          <View style={{width: '60%'}}>
            <Text>Monthly Price Offered : </Text>
          </View>
          <View style={{width: '40%'}}>
            <Text style={{fontWeight: 800}}>
              {detail.agreementDetails.negotationPrice !== null
                ? detail.agreementDetails.negotationPrice
                : `${detail.property.rent} `}
              {' '}PKR
            </Text>
          </View>
        </View>
        
        {!detail.agreementDetails.agreementBuyer &&
          !detail.agreementDetails.agreementOwner && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 20,
              }}>
              <Text style={{color: 'black', width: '40%'}}>
                Negotating Price Offerering:{' '}
              </Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                placeholder="Enter price"
                value={price} // Bind the input value to the state
                onChangeText={text => setPrice(text)} // Update the state when the input changes
              />
              <TouchableOpacity
                onPress={() => {
                  MakeNegotationPrice(detail.agreementDetails._id, price);
                }}>
                <Text>send</Text>
              </TouchableOpacity>
            </View>
          )}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 20,
          }}>
          <TouchableOpacity
            style={{
              width: '48%',
              alignItems: 'center',
              borderWidth: 1,
              borderStyle: 'dashed',
              padding: 10,
              borderRadius: 5,
              borderColor: 'blue',
              backgroundColor: detail.agreementDetails.agreementBuyer
                ? 'blue'
                : 'transparent',
            }}
            onPress={() => {
              AcceptAgreement(detail.agreementDetails._id);
            }}>
            <Text
              style={{
                textAlign: 'center',
                color: detail.agreementDetails.agreementBuyer
                  ? 'white'
                  : 'black',
              }}>
              Accept The Offer As Buyer
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              width: '48%',
              alignItems: 'center',
              borderWidth: 1,
              borderStyle: 'dashed',
              padding: 10,
              borderRadius: 5,
              borderColor: 'blue',
              backgroundColor: detail.agreementDetails.agreementOwner
                ? 'blue'
                : 'transparent',
            }}
            onPress={() => {
              AcceptAgreement(detail.agreementDetails._id);
            }}>
            <Text
              style={{
                textAlign: 'center',
                color: detail.agreementDetails.agreementSeller
                  ? 'white'
                  : 'black',
              }}>
              Accept The Offer As Seller
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {!(
        detail.agreementDetails.agreementBuyer &&
        detail.agreementDetails.agreementOwner
      ) && (
        <TouchableOpacity
          onPress={() => {
            RejectAgreement(
              detail.agreementDetails._id,
              detail.agreementDetails.PropertyId,
            );
          }}
          style={{
            backgroundColor: 'red',
            marginHorizontal: 10,
            paddingVertical: 10,
            borderRadius: 5,
            marginBottom: 20,
          }}>
          <Text style={{color: 'white', fontSize: 15, textAlign: 'center'}}>
            Reject Deal
          </Text>
          <Text
            style={{
              color: 'white',
              fontSize: 10,
              textAlign: 'center',
              paddingHorizontal: 10,
            }}>
            Your are rejecting the deal once rejected you hahve to start the
            process all over again you money in escrow will be send back to you
            if you are a agreementBuyer
          </Text>
        </TouchableOpacity>
      )}
      {detail.agreementDetails.agreementBuyer &&
        detail.agreementDetails.agreementOwner &&
        !agreementCompleted && (
          <TouchableOpacity
            onPress={() => {
              finalizeDeal(detail.agreementDetails.PropertyId);
            }}
            style={{
              backgroundColor: 'green',
              marginHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 20,
              marginBottom: 20,
            }}>
            <Text style={{color: 'white', fontSize: 15, textAlign: 'center'}}>
              Finalize Deal
            </Text>
            <Text
              style={{
                color: 'white',
                fontSize: 10,
                textAlign: 'center',
                paddingHorizontal: 10,
              }}>
              Your Advance is in escrow you can now see owner Information Use
              this feature to furthur negotiate on things
            </Text>
          </TouchableOpacity>
        )}

      {agreementCompleted && (
        <View
          style={{
            backgroundColor: 'green',
            marginHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 2,
            marginBottom: 20,
          }}>
          <Text
            style={{
              color: 'white',
              fontSize: 15,
              textAlign: 'center',
              paddingHorizontal: 10,
            }}>
            Agreement Successfully Completed
          </Text>
        </View>
      )}
    </View>
  );
}

export default DetailPropertySelling;

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
  textInput: {
    borderWidth: 1, // Adds the border
    borderColor: 'blue', // Border color
    padding: 5, // Space inside the TextInput
    paddingHorizontal: 10,
    borderStyle: 'dashed', // Dashed border
    width: '40%', // Set width for consistency
    borderRadius: 5, // Rounded corners
    marginLeft: 10, // Add space between label and input
    color: 'black', // Text color inside the input
  },
});
