import { View } from 'react-native';
import React, { useEffect, useCallback, useState } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import { useRoute } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

const Message = () => {
  const [messageList, setMessageList] = useState([]);
  const route = useRoute();
 
  useEffect(() => {
    // Subscribe to changes in messages for the chat between the current user and the recipient user
    const unsubscribe = firestore()
      .collection('chats')
      .doc(route.params.id + route.params.data.uid)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .onSnapshot(querySnapshot => {
        // Extract message data from each document in the query snapshot
        const allMessages = querySnapshot.docs.map(doc => {
          return { ...doc.data(), id: doc.id };
        });
        // Update the message list state with the extracted messages
        setMessageList(allMessages);
      });
  
   
    return () => unsubscribe();
  }, []); 
  
  const onSend = useCallback(async (messages = []) => {
    // Extract the first message from the array of sent messages
    const msg = messages[0];
  
    // Check if the message or its text content is invalid
    if (!msg || !msg.text) {
      console.error('Invalid message format');
      return;
    }
  
    // Construct the message object to be sent
    const myMsg = {
      ...msg,
      user: {
        _id: route.params.id,
      },
      createdAt: new Date().getTime(), // Assign the current timestamp to the message
    };
  
    try {
      // Add the message to the sender's chat collection
      const chatRef1 = firestore()
        .collection('chats')
        .doc(`${route.params.id}${route.params.data.uid}`)
        .collection('messages');
  
      // Add the same message to the recipient's chat collection
      const chatRef2 = firestore()
        .collection('chats')
        .doc(`${route.params.data.uid}${route.params.id}`)
        .collection('messages');
  
      // Execute both Firestore write operations concurrently using Promise.all
      await Promise.all([
        chatRef1.add(myMsg),
        chatRef2.add(myMsg),
      ]);
  
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', JSON.stringify(error));
    }
  }, [route.params]); // Dependency array ensures the function is recreated when route.params changes
  

  return (
    <View style={{ flex: 1, backgroundColor: '#ece5dd' }}>
      <GiftedChat
        messages={messageList}
        keyExtractor={(item) => item.id}
        onSend={messages => onSend(messages)}
        user={{
          _id: route.params.id,
        }}
      />
    </View>
  );
};

export default Message;
