import axios from 'axios';
import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {BASE_URL} from '../api';

const CreditScreen = ({route}) => {
  const userId = route.params.decodeData.response._id;
  const [transactions, setTransactions] = useState([]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/credit/getTransaction`,
        {
          userId,
        },
      );
      console.log('Fetched Transactions:', response.data.transactions);
      setTransactions(response.data.transactions);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const renderTransaction = transaction => (
    <View key={transaction._id} style={styles.card}>
      <View style={styles.textContainer}>
        <Text style={styles.address}>
          {transaction.InAccordance || 'No Address Available'}
        </Text>
        <Text style={styles.transactionId}>{transaction.PaymentIntentId}</Text>
        <Text style={styles.escrowStatus}>
          {transaction.TransactionType || 'N/A'}
        </Text>
      </View>
      <View style={styles.amountContainer}>
        <Text
          style={[
            styles.amount,
            transaction.TransactionType === 'Transfer' && styles.transferAmount,
          ]}>
          {transaction.TransactionAmount} PKR
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>Escrow</Text>
      {transactions
        .filter(transaction => transaction.TransactionType === 'Escrow')
        .map(renderTransaction)}

      <Text style={styles.sectionTitle}>Receive</Text>
      {transactions
        .filter(
          transaction =>
            (transaction.TransactionType === 'Transfered' ||
              transaction.TransactionType === 'Refund' ||
              transaction.TransactionType === 'Escrow') &&
            transaction.RecieverId === userId,
        )
        .map(renderTransaction)}

      <Text style={styles.sectionTitle}>Send</Text>
      {transactions
        .filter(
          transaction =>
            (transaction.TransactionType === 'Transfered' ||
              transaction.TransactionType === 'Refund' ||
              transaction.TransactionType === 'Escrow') &&
            transaction.SendedId === userId,
        )
        .map(renderTransaction)}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 5, // For Android shadow effect
    marginBottom: 15,
  },
  textContainer: {
    width: '70%',
  },
  address: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  transactionId: {
    fontSize: 12,
    color: '#777',
    marginTop: 5,
  },
  escrowStatus: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
  amountContainer: {
    width: '30%',
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 14,
    color: '#28a745', // Green color for amount
    fontWeight: 'bold',
  },
  transferAmount: {
    color: 'red', // Red color for "Transfer"
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'light',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default CreditScreen;
