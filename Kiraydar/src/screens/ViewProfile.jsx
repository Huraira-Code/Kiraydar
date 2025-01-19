import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Avatar from '../resource/avatar.png';

const ViewProfile = ({ route }) => {
  const { decodeData } = route.params;  // Get decodeData from route params
 console.log(decodeData);
 
  return (
    <View style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileContainer}>
        {/* Profile Image */}
        
        <Image
         source={Avatar}
          style={styles.profileImage}
        />
        
        {/* User Info */}
        <View style={styles.userInfoContainer}>
          <Text style={styles.username}>{decodeData?.response.username || 'Anonymous User'}</Text>
        </View>
      </View>

      {/* Information Section */}
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>CNIC:</Text>
          <Text style={styles.info}>{decodeData?.response.cnic || 'Not Provided'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Username:</Text>
          <Text style={styles.info}>{decodeData?.response.username || 'Not Provided'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Bank Account:</Text>
          <Text style={styles.info}>{decodeData?.response.bankAccount || 'Not Provided'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Phone Number:</Text>
          <Text style={styles.info}>{decodeData?.response.phonenumber || 'Not Provided'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Stripe Account:</Text>
          <Text style={styles.info}>{decodeData?.response.BankAountStripeId || 'Not Provided'}</Text>
        </View>
      </View>

      {/* Edit Button */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  userInfoContainer: {
    justifyContent: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  bio: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  infoContainer: {
    marginTop: 20,
    width: '100%',
    paddingHorizontal: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  info: {
    fontSize: 16,
    color: '#555',
    flex: 1,
    textAlign: 'right',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ViewProfile;
