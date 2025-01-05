import React, { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import {
  OverlayProvider,
  Chat,
  ChannelList,
  useChatContext,
} from 'stream-chat-react-native';
import { StreamChat } from 'stream-chat';
import Channel from './Channel';
import loadAndDecodeToken from '../Controller/LoadAndDecodeToken';

const ChatScreen = ({ navigation }) => {
  const chatClient = StreamChat.getInstance('f4jd4sm2swcv'); // Replace with your API Key

  const [isReady, setIsReady] = useState(false); // Track readiness
  const [decodeData, setDecodeData] = useState();

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
  }, [decodeData]);

  const onSelectChannel = (channel) => {
    const otherMember = Object.values(channel.state.members).find(
      (member) => member.user.id !== decodeData.response._id // Exclude logged-in user
    );
    console.log(otherMember?.user.name);
    navigation.navigate('Channel', {channelId: channel.id}); // Navigate to ChannelScreen with channelId
  };

  return (
    <>
      {decodeData && isReady && (
        <ChannelList
          filters={{ members: { $in: [decodeData.response._id] } }} // Filter channels by user ID
          onSelect={(channel) => onSelectChannel(channel)}
         
        />
      )}
    </>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({});
