/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import 'react-native-gesture-handler';
import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();
import Prelogin from './screens/Prelogin';
import {StyleSheet} from 'react-native';
import SignUp from './screens/SignUp';
import LocationScreen from './screens/LocationScreen';
import MainScreen from './screens/MainScreen';
import AddProperty from './screens/AddProperty';
import BottomBar from './components/BottomBar';
import MyAds from './screens/MyAds';
import IndiviualProperty from './screens/IndiviualProperty';
import Login from './screens/Login';
import Profile from './screens/Profile';

import {StripeProvider} from '@stripe/stripe-react-native';
import ChatScreen from './screens/ChatScreen';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StreamChat} from 'stream-chat';
import {
  OverlayProvider,
  Chat,
  ChannelList,
  useChatContext,
} from 'stream-chat-react-native';
import Channel from './screens/Channel';
import loadAndDecodeToken from './Controller/LoadAndDecodeToken';
const client = StreamChat.getInstance('f4jd4sm2swcv');
function App() {
 

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <OverlayProvider>
        <Chat client={client}>
          <NavigationContainer>
            <StripeProvider publishableKey="pk_test_51Q90mr2LewuTEXoETZLxzjFCEMKSTkSPYtk2Fjjx4vvlwVbAVXbisDW0iUj1sIREf0gmIx25rIwAPzXpl1TeVj9B00AIEutf4J">
              <Stack.Navigator>
              <Stack.Screen
                  name="Login"
                  component={Login}
                  options={{headerShown: false}}
                />
              <Stack.Screen
                  name="MainScreen"
                  component={MainScreen}
                  options={{headerShown: false}}
                />
              <Stack.Screen
                  name="Prelogin"
                  component={Prelogin}
                  options={{headerShown: false}}
                />
                <Stack.Screen
                  name="ChatScreen"
                  component={ChatScreen}
                  options={{headerShown: false}}
                />
                <Stack.Screen
                  name="Channel"
                  component={Channel}
                  options={{headerShown: false}}
                />
                <Stack.Screen
                  name="MyAds"
                  component={MyAds}
                  options={{headerShown: false}}
                />
               
               
                <Stack.Screen
                  name="SignUp"
                  component={SignUp}
                  options={{headerShown: false}}
                />
                <Stack.Screen
                  name="Location"
                  component={LocationScreen}
                  options={{headerShown: false}}
                />
                

                <Stack.Screen
                  name="AddProperty"
                  component={AddProperty}
                  options={{headerShown: false}}
                />

                <Stack.Screen
                  name="IndiviualProperty"
                  component={IndiviualProperty}
                  options={{headerShown: false}}
                />

                <Stack.Screen
                  name="Profile"
                  component={Profile}
                  options={{headerShown: false}}
                />
              </Stack.Navigator>
            </StripeProvider>
          </NavigationContainer>
        </Chat>
      </OverlayProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({});

export default App;
