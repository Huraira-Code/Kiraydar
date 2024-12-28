import React, {useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import {
  OverlayProvider,
  Chat,
  ChannelList,
  useChatContext,
} from 'stream-chat-react-native';
import {StreamChat} from 'stream-chat';
import Channel from './Channel';
import loadAndDecodeToken from '../Controller/LoadAndDecodeToken';

const ChatScreen = ({navigation}) => {
  const chatClient = StreamChat.getInstance('f4jd4sm2swcv'); // Replace with your API Key

    const [user, setUser] = useState(); // Store logged-in user
    const [isReady, setIsReady] = useState(false); // Track readiness
    const [decodeData,setDecodeData] = useState()
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
      
      if (decodeData) {
        const connect = async () => {
          await chatClient.connectUser(
            {
              id: decodeData.response._id, // User ID
              name: decodeData.response.username, // User Name
            },
            chatClient.devToken(decodeData.response._id)
          );
          setIsReady(true);
        };
  
        connect();
      }
  
      // return () => client.disconnectUser(); // Disconnect user on unmount
    }, [decodeData]);
  // Navigate to the Channel screen
  const onSelectChannel = (channel) => {
    navigation.navigate('Channel', {channelId: channel.id}); // Navigate to ChannelScreen with channelId
  };

  

  return (
    <>
    {decodeData && (
      <ChannelList
        filters={{members: {$in: [decodeData.response._id]}}}
        onSelect={(channel) => onSelectChannel(channel)}
      />
    )}
  </>
    )
};

export default ChatScreen;

const styles = StyleSheet.create({});
