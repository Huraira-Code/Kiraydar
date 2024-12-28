import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native'; // For getting route params
import { useChatContext, Channel as StreamChannel, MessageList, MessageInput } from 'stream-chat-react-native';
import { StreamChat } from 'stream-chat';

const ChannelScreen = () => {
  const [channel, setChannel] = useState(null);
  const route = useRoute(); // To get channelId from navigation params
  const { channelId } = route.params;
  console.log("a")
  const {client} = useChatContext() // Same client as in ChatScreen
  console.log(channelId)
  useEffect(() => {
    const fetchChannel = async () => {
      const channels = await client.queryChannels({ id: channelId });
       console.log(channels[0]);
       setChannel(channels[0]);
    };

      fetchChannel();
  }, [channelId, client]);

  if (!channel) {
    return <ActivityIndicator />;
  }

  return (
    <StreamChannel channel={channel} keyboardVerticalOffset={0}>
      <MessageList />
      <MessageInput />
    </StreamChannel>
  );
};

export default ChannelScreen;

const styles = StyleSheet.create({});
