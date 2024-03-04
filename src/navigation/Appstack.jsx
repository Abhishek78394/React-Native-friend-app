import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { NativeBaseProvider } from 'native-base';
import { clearStorage, getAllDataFromAsyncStorage, getAsyncStorageData } from '../utils/asynStore.js';
import Home from '../screens/mainStack/Home/Home';
import Register from '../screens/authScreen/Register/Register';
import Login from '../screens/authScreen/Login/Login';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Message from '../screens/mainStack/Message/Message.jsx';

const Stack = createNativeStackNavigator();

const Appstack = () => {
 
    return (
    <NativeBaseProvider>
      <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
            <Stack.Screen name="Message" component={Message} options={{ headerShown: false }} />
          </Stack.Navigator>
      </NavigationContainer>
    </NativeBaseProvider>
  )
}

export default Appstack